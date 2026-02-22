export type HSLNodeType = 'station' | 'stop'

type HSLGroupDefinition = {
	id: string
	title: string
	locations: Array<{
		id: string
		nodeType: HSLNodeType
	}>
}

type HSLQueryLocation = {
	alias: string
	groupId: string
	id: string
	nodeType: HSLNodeType
}

export type HSLStoptime = {
	headsign?: string | null
	realtime?: boolean | null
	realtimeDeparture?: number | null
	scheduledDeparture?: number | null
	serviceDay?: number | null
	trip?: {
		route?: {
			shortName?: string | null
		} | null
	} | null
}

type HSLRawAlert = {
	alertHeaderText?: string | null
	alertDescriptionText?: string | null
	alertCause?: string | null
	alertEffect?: string | null
}

export type HSLStopData = {
	id: string
	name?: string | null
	alerts?: HSLRawAlert[] | null
	stoptimesWithoutPatterns?: HSLStoptime[] | null
}

export type HSLData = Record<string, HSLStopData | null>

export type HSLResponse = {
	data?: HSLData
	errors?: Array<{ message: string }>
}

export type HSLGroup = {
	id: string
	title: string
	aliases: string[]
}

export type HSLDeparture = {
	id: string
	alias: string
	stopName: string
	groupTitle: string
	headsign: string
	line: string
	departureUnix: number
}

export type HSLAlert = {
	id: string
	alias: string
	groupTitle: string
	header: string
	description: string
}

const HSL_GROUP_DEFINITIONS: HSLGroupDefinition[] = [
	{
		id: 'aalto',
		title: 'Aalto metroasema',
		locations: [{ id: 'HSL:2000102', nodeType: 'station' }],
	},
	{
		id: 'innopolis',
		title: 'Innopolis',
		locations: [
			{ id: 'HSL:2222225', nodeType: 'stop' },
			{ id: 'HSL:2222226', nodeType: 'stop' },
		],
	},
	{
		id: 'ratikka',
		title: 'Ratikkapysäkki',
		locations: [
			{ id: 'HSL:2222406', nodeType: 'stop' },
			{ id: 'HSL:2222405', nodeType: 'stop' },
		],
	},
]

const HSL_DEPARTURES_PER_LOCATION = 12
export const HSL_MAX_GROUP_DEPARTURES = 8

const createQueryLocations = (
	groupDefinitions: HSLGroupDefinition[],
): HSLQueryLocation[] => {
	return groupDefinitions.flatMap((group) =>
		group.locations.map((location, index) => ({
			alias: `${group.id}_${index}`,
			groupId: group.id,
			id: location.id,
			nodeType: location.nodeType,
		})),
	)
}

const HSL_QUERY_LOCATIONS = createQueryLocations(HSL_GROUP_DEFINITIONS)

export const HSL_GROUPS: HSLGroup[] = HSL_GROUP_DEFINITIONS.map((group) => ({
	id: group.id,
	title: group.title,
	aliases: HSL_QUERY_LOCATIONS.filter((location) => location.groupId === group.id)
		.map((location) => location.alias),
}))

const HSL_GROUP_BY_ALIAS: Record<string, HSLGroup> = Object.fromEntries(
	HSL_GROUPS.flatMap((group) =>
		group.aliases.map((alias) => [alias, group] as const),
	),
)

export const HSL_ALL_ALIASES = HSL_GROUPS.flatMap((group) => group.aliases)

export const HSL_VARIABLES: Record<string, string> = Object.fromEntries(
	HSL_QUERY_LOCATIONS.map((location) => [location.alias, location.id]),
)

const buildQueryVariables = (locations: HSLQueryLocation[]) =>
	locations.map((location) => `$${location.alias}: String!`).join(', ')

const buildLocationQuery = (location: HSLQueryLocation) => `
  ${location.alias}: ${location.nodeType}(id: $${location.alias}) {
    id
    name
    alerts {
      alertHeaderText
      alertDescriptionText
      alertCause
      alertEffect
    }
    stoptimesWithoutPatterns(numberOfDepartures: ${HSL_DEPARTURES_PER_LOCATION}) {
      headsign(language: "fi")
      realtime
      realtimeDeparture
      scheduledDeparture
      serviceDay
      trip {
        route {
          shortName
        }
      }
    }
  }
`

export const HSL_QUERY = `
query HslInfo(${buildQueryVariables(HSL_QUERY_LOCATIONS)}) {
${HSL_QUERY_LOCATIONS.map(buildLocationQuery).join('\n')}
}
`

const HSL_SUBSCRIPTION_KEY = import.meta.env.VITE_HSL_SUBSCRIPTION_KEY || ''
export const HSL_ENDPOINT =
	`/hsldata/routing/v2/hsl/gtfs/v1?digitransit-subscription-key=${encodeURIComponent(HSL_SUBSCRIPTION_KEY)}`

export const getDepartureUnix = (stoptime: HSLStoptime) => {
	if (stoptime.serviceDay == null) {
		return null
	}

	const secondsFromMidnight = stoptime.realtime
		? stoptime.realtimeDeparture
		: stoptime.scheduledDeparture

	if (secondsFromMidnight == null) {
		return null
	}

	return stoptime.serviceDay + secondsFromMidnight
}

export const formatHslTime = (departureUnix: number) =>
	new Date(departureUnix * 1000).toLocaleTimeString('fi-FI', {
		hour: '2-digit',
		minute: '2-digit',
	})

export const getMinutesUntilDeparture = (departureUnix: number) =>
	Math.max(0, Math.round((departureUnix * 1000 - Date.now()) / (1000 * 60)))

export const formatHslDepartureDisplay = (
	departureUnix: number,
	minuteThreshold: number = 15,
) => {
	const minutes = getMinutesUntilDeparture(departureUnix)
	return minutes > minuteThreshold ? formatHslTime(departureUnix) : `${minutes} min`
}

type GetDeparturesOptions = {
	fromUnix?: number
	toUnix?: number
	limit?: number
}

export const getHslDepartures = (
	data: HSLData,
	aliases: readonly string[],
	options: GetDeparturesOptions = {},
) => {
	const nowUnix = Math.floor(Date.now() / 1000)
	const fromUnix = options.fromUnix ?? nowUnix - 60
	const toUnix = options.toUnix ?? Number.POSITIVE_INFINITY
	const departures: HSLDeparture[] = []

	for (const alias of aliases) {
		const stop = data[alias]
		const group = HSL_GROUP_BY_ALIAS[alias]

		for (const stoptime of stop?.stoptimesWithoutPatterns ?? []) {
			const departureUnix = getDepartureUnix(stoptime)
			if (departureUnix == null || departureUnix < fromUnix || departureUnix > toUnix) {
				continue
			}

			departures.push({
				id: `${alias}-${departureUnix}-${stoptime.trip?.route?.shortName ?? ''}-${stoptime.headsign ?? ''}`,
				alias,
				stopName: stop?.name || group?.title || alias,
				groupTitle: group?.title || alias,
				headsign: stoptime.headsign || 'Tuntematon suunta',
				line: stoptime.trip?.route?.shortName || '-',
				departureUnix,
			})
		}
	}

	const sorted = departures.sort((a, b) => a.departureUnix - b.departureUnix)
	return options.limit ? sorted.slice(0, options.limit) : sorted
}

type GetAlertsOptions = {
	limit?: number
}

export const getHslAlerts = (
	data: HSLData,
	aliases: readonly string[],
	options: GetAlertsOptions = {},
) => {
	const uniqueAlerts = new Map<string, HSLAlert>()

	for (const alias of aliases) {
		const stop = data[alias]
		const group = HSL_GROUP_BY_ALIAS[alias]

		for (const alert of stop?.alerts ?? []) {
			const header = alert.alertHeaderText?.trim() || ''
			const description = alert.alertDescriptionText?.trim() || ''
			if (!header && !description) {
				continue
			}

			const id = `${header}|${description}`
			if (!uniqueAlerts.has(id)) {
				uniqueAlerts.set(id, {
					id,
					alias,
					groupTitle: group?.title || alias,
					header: header || 'Häiriötiedote',
					description,
				})
			}
		}
	}

	const alerts = Array.from(uniqueAlerts.values())
	return options.limit ? alerts.slice(0, options.limit) : alerts
}
