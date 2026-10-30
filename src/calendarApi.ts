import ICAL from 'ical.js'

// The guild's public Google calendars. A calendar's ID is in Google Calendar
// under Settings → the calendar → "Integrate calendar"; the calendar must be
// public for its feed to load.
export const CALENDARS = [
	{
		name: 'Tapahtumat',
		id: 'jgqf5u162heo7vgkgddq90d68s@group.calendar.google.com',
		color: 'bg-blue-600',
	},
	{ name: 'Yleiset', id: 'cto@prodeko.org', color: 'bg-stone-600' },
	{
		name: 'Excut',
		id: 'a440frd2hhop84nhvesq3krijc@group.calendar.google.com',
		color: 'bg-emerald-600',
	},
	{
		name: 'Fuksit',
		id: 'c_557a8944da2a9e3a4d3b27656145670f269d157cb26d4cefe3e61b162a527b6f@group.calendar.google.com',
		color: 'bg-amber-500',
	},
	{
		name: 'PoRa',
		id: 'miqv1ra1mb1878p9d5766i8a7g@group.calendar.google.com',
		color: 'bg-rose-600',
	},
] as const

export type CalendarEvent = {
	id: string
	calendar: (typeof CALENDARS)[number]
	title: string
	location: string
	start: Date
	end: Date
	allDay: boolean
}

// A recurring event that started years ago is walked from its first
// occurrence; this bounds the walk for a rule that never ends.
const MAX_OCCURRENCES = 5000

/** Monday 00:00 of the week `date` is in, local time. */
export const startOfWeek = (date: Date) => {
	const monday = new Date(date)
	monday.setHours(0, 0, 0, 0)
	monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
	return monday
}

const feedUrl = (id: string) =>
	`/calendarproxy/calendar/ical/${encodeURIComponent(id)}/public/basic.ics`

/** The calendar's events that overlap [from, to), recurring ones expanded. */
const parseEvents = (
	ics: string,
	calendar: CalendarEvent['calendar'],
	from: Date,
	to: Date,
): CalendarEvent[] => {
	const root = new ICAL.Component(ICAL.parse(ics))
	for (const timezone of root.getAllSubcomponents('vtimezone')) {
		ICAL.TimezoneService.register(timezone)
	}

	// A moved or edited occurrence of a recurring event is a vevent of its own
	// with the same UID and a RECURRENCE-ID; it is attached to its series.
	const masters = new Map<string, ICAL.Event>()
	const exceptions: ICAL.Event[] = []
	for (const component of root.getAllSubcomponents('vevent')) {
		const event = new ICAL.Event(component)
		if (event.isRecurrenceException()) {
			exceptions.push(event)
		} else {
			masters.set(event.uid, event)
		}
	}
	for (const exception of exceptions) {
		masters.get(exception.uid)?.relateException(exception)
	}

	const events: CalendarEvent[] = []
	const add = (item: ICAL.Event, start: ICAL.Time, end: ICAL.Time) => {
		if (item.component.getFirstPropertyValue('status') === 'CANCELLED') {
			return
		}
		const startDate = start.toJSDate()
		const endDate = end.toJSDate()
		if (endDate <= from || startDate >= to) {
			return
		}
		events.push({
			id: `${calendar.id}|${item.uid}|${start.toString()}`,
			calendar,
			title: item.summary || '(nimetön)',
			location: item.location || '',
			start: startDate,
			end: endDate,
			allDay: start.isDate,
		})
	}

	for (const event of masters.values()) {
		if (!event.isRecurring()) {
			add(event, event.startDate, event.endDate)
			continue
		}
		const iterator = event.iterator()
		for (let i = 0; i < MAX_OCCURRENCES; i++) {
			const next = iterator.next()
			if (!next || next.toJSDate() >= to) {
				break
			}
			const occurrence = event.getOccurrenceDetails(next)
			add(occurrence.item, occurrence.startDate, occurrence.endDate)
		}
	}
	return events
}

/** This week's events from every calendar, Monday to Sunday, in start order. A calendar that fails to load is left out. */
export type WeekEvents = {
	events: CalendarEvent[]
	// Calendars whose feed didn't load; their events are missing from the week
	failed: string[]
}

export const fetchWeekEvents = async (
	now: Date = new Date(),
): Promise<WeekEvents> => {
	const from = startOfWeek(now)
	const to = new Date(from)
	to.setDate(to.getDate() + 7)

	const perCalendar = await Promise.all(
		CALENDARS.map(async (calendar) => {
			try {
				const response = await fetch(feedUrl(calendar.id))
				if (!response.ok) {
					throw new Error(`status ${response.status}`)
				}
				return parseEvents(await response.text(), calendar, from, to)
			} catch (error) {
				console.error(`Failed to fetch calendar ${calendar.name}:`, error)
				return null
			}
		}),
	)

	// One event is often in two calendars, e.g. an excursion for fuksis in both
	// Excut and Fuksit; the first calendar in CALENDARS keeps it.
	const failed = CALENDARS.filter((_, i) => perCalendar[i] === null).map(
		(calendar) => calendar.name,
	)
	if (failed.length === CALENDARS.length) {
		throw new Error('no calendar loaded')
	}

	const seen = new Set<string>()
	const events = perCalendar
		.flatMap((calendarEvents) => calendarEvents ?? [])
		.filter((event) => {
			const key = `${event.title.trim().toLowerCase()}|${event.start.getTime()}`
			if (seen.has(key)) {
				return false
			}
			seen.add(key)
			return true
		})
		.sort(
			(a, b) =>
				a.start.getTime() - b.start.getTime() ||
				a.title.localeCompare(b.title, 'fi'),
		)
	return { events, failed }
}
