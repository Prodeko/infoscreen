import { CALENDARS, type CalendarEvent, startOfWeek } from './calendarApi'

type WeekCalendarProps = {
	events: CalendarEvent[]
	rotationInterval?: number
}

const formatTime = (date: Date) =>
	date.toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' })

const sameDay = (a: Date, b: Date) =>
	a.getFullYear() === b.getFullYear() &&
	a.getMonth() === b.getMonth() &&
	a.getDate() === b.getDate()

/** Whether the event is on `day`; an all-day event ends at the next midnight, a multi-day one is on every day it spans. */
const isOnDay = (event: CalendarEvent, day: Date) => {
	const dayEnd = new Date(day)
	dayEnd.setDate(dayEnd.getDate() + 1)
	return event.start < dayEnd && event.end > day
}

const WeekCalendar = ({ events }: WeekCalendarProps) => {
	const today = new Date()
	const monday = startOfWeek(today)
	const days = Array.from({ length: 7 }, (_, i) => {
		const day = new Date(monday)
		day.setDate(day.getDate() + i)
		return day
	})

	return (
		<div className="flex flex-col gap-4 h-full">
			<div className="flex items-baseline justify-between">
				<h1 className="text-4xl font-bold">Tämän viikon tapahtumat</h1>
				<div className="flex gap-4">
					{CALENDARS.map((calendar) => (
						<span key={calendar.id} className="flex items-center gap-2 text-lg">
							<span className={`w-3 h-3 rounded-full ${calendar.color}`} />
							{calendar.name}
						</span>
					))}
				</div>
			</div>
			<div className="grid grid-cols-7 gap-3 flex-1 min-h-0">
				{days.map((day) => {
					const dayEvents = events.filter((event) => isOnDay(event, day))
					const isToday = sameDay(day, today)

					return (
						<div
							key={day.toISOString()}
							className={`rounded-lg shadow-md p-3 flex flex-col gap-2 min-h-0 overflow-hidden ${
								isToday ? 'bg-blue-50 ring-2 ring-blue-600' : 'bg-white'
							}`}
						>
							<h2 className="text-2xl font-semibold capitalize">
								{day.toLocaleDateString('fi-FI', {
									weekday: 'short',
									day: 'numeric',
									month: 'numeric',
								})}
							</h2>
							{dayEvents.length === 0 && (
								<p className="text-lg text-stone-400">–</p>
							)}
							{dayEvents.map((event) => (
								<div
									key={event.id}
									className="flex gap-2 border-b border-stone-100 pb-2 last:border-b-0"
								>
									<span
										className={`w-1.5 shrink-0 rounded-full ${event.calendar.color}`}
									/>
									<div className="min-w-0">
										<p className="font-mono text-base text-stone-600">
											{event.allDay || !sameDay(event.start, day)
												? 'Koko päivän'
												: formatTime(event.start)}
										</p>
										<p className="text-lg font-semibold leading-tight break-words hyphens-auto">
											{event.title}
										</p>
										{event.location && (
											<p className="text-base text-stone-500 truncate">
												{event.location}
											</p>
										)}
									</div>
								</div>
							))}
						</div>
					)
				})}
			</div>
		</div>
	)
}

WeekCalendar.displayName = 'WeekCalendar'

export default WeekCalendar
