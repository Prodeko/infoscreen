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
		directionId?: string | null
		route?: {
			mode?: string | null
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
	lat?: number | null
	lon?: number | null
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
	mode: string | null
	// GTFS direction, "0" or "1"; tells a station's two directions apart
	direction: string | null
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
	// Line 52's nearest stops to TUAS: Tietotie towards Aalto-yliopisto (M) and
	// Laivamiehenpolku on Maarintie towards Otaniemi.
	{
		id: 'tietotie',
		title: 'Tietotie',
		locations: [
			{ id: 'HSL:2222223', nodeType: 'stop' },
			{ id: 'HSL:2222229', nodeType: 'stop' },
		],
	},
	// Maari, the tram 15 stop next to TUAS, both directions.
	{
		id: 'ratikka',
		title: 'Ratikka, Maari',
		locations: [
			{ id: 'HSL:2222404', nodeType: 'stop' },
			{ id: 'HSL:2222403', nodeType: 'stop' },
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
	aliases: HSL_QUERY_LOCATIONS.filter(
		(location) => location.groupId === group.id,
	).map((location) => location.alias),
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
    lat
    lon
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
        directionId
        route {
          mode
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

// The proxy in vite.config.ts adds the subscription key
export const HSL_ENDPOINT = '/hsldata/routing/v2/hsl/gtfs/v1'

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

// HSL's own colours for each mode, as on its stops and maps
const HSL_MODE_COLORS: Record<string, string> = {
	BUS: '#007ac9',
	TRAM: '#00985f',
	SUBWAY: '#ff6319',
	RAIL: '#8c4799',
	FERRY: '#00b9e4',
}

/** Background colour for a line number badge; null for an unknown mode. */
export const getModeColor = (mode: string | null) =>
	(mode && HSL_MODE_COLORS[mode]) || null

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
	return minutes > minuteThreshold
		? formatHslTime(departureUnix)
		: `${minutes} min`
}

// Walking times are measured from TUAS's main door on Maarintie, as the crow
// flies with a detour factor for the paths in between, at an unhurried pace.
// A metro station gets extra minutes for the escalators down to the platform.
const WALK_FROM = { lat: 60.18688, lon: 24.81838 }
const WALK_DETOUR = 1.3
const WALK_METRES_PER_MINUTE = 80
const STATION_EXTRA_MINUTES = 2

const NODE_TYPE_BY_ALIAS: Record<string, HSLNodeType> = Object.fromEntries(
	HSL_QUERY_LOCATIONS.map((location) => [location.alias, location.nodeType]),
)

export const isStation = (alias: string) =>
	NODE_TYPE_BY_ALIAS[alias] === 'station'

const distanceMetres = (
	a: { lat: number; lon: number },
	b: { lat: number; lon: number },
) => {
	const rad = Math.PI / 180
	const dLat = (b.lat - a.lat) * rad
	const dLon = (b.lon - a.lon) * rad
	const h =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2
	return 2 * 6371000 * Math.asin(Math.sqrt(h))
}

/** Minutes to walk from TUAS to the stop or station behind `alias`; null when its position is not known. */
export const getWalkMinutes = (data: HSLData, alias: string) => {
	const stop = data[alias]
	if (stop?.lat == null || stop?.lon == null) {
		return null
	}
	const metres =
		distanceMetres(WALK_FROM, { lat: stop.lat, lon: stop.lon }) * WALK_DETOUR
	const extra =
		NODE_TYPE_BY_ALIAS[alias] === 'station' ? STATION_EXTRA_MINUTES : 0
	return Math.max(1, Math.ceil(metres / WALK_METRES_PER_MINUTE) + extra)
}

/** The shortest walk to any of a group's stops, for its heading. */
export const getGroupWalkMinutes = (
	data: HSLData,
	aliases: readonly string[],
) => {
	const minutes = aliases
		.map((alias) => getWalkMinutes(data, alias))
		.filter((m): m is number => m != null)
	return minutes.length > 0 ? Math.min(...minutes) : null
}

type GetDeparturesOptions = {
	// Leave out departures that leave before one could walk to the stop
	reachableOnly?: boolean
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
		const walkMinutes = options.reachableOnly
			? (getWalkMinutes(data, alias) ?? 0)
			: 0
		const earliestUnix = Math.max(fromUnix, nowUnix + walkMinutes * 60)

		for (const stoptime of stop?.stoptimesWithoutPatterns ?? []) {
			const departureUnix = getDepartureUnix(stoptime)
			if (
				departureUnix == null ||
				departureUnix < (options.reachableOnly ? earliestUnix : fromUnix) ||
				departureUnix > toUnix
			) {
				continue
			}

			departures.push({
				id: `${alias}-${departureUnix}-${stoptime.trip?.route?.shortName ?? ''}-${stoptime.headsign ?? ''}`,
				alias,
				stopName: stop?.name || group?.title || alias,
				groupTitle: group?.title || alias,
				headsign: stoptime.headsign || 'Tuntematon suunta',
				line: stoptime.trip?.route?.shortName || '-',
				mode: stoptime.trip?.route?.mode ?? null,
				direction: stoptime.trip?.directionId ?? null,
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
