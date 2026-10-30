import {
	getHslDepartures,
	getMinutesUntilDeparture,
	HSL_ALL_ALIASES,
	type HSLData,
	isStation,
} from './hslApi'

type SidebarDeparturesProps = {
	data: HSLData | null
	error?: string | null
}

const MAX_UPCOMING_STOPS = 5

const SidebarDepartures = ({ data, error }: SidebarDeparturesProps) => {
	if (!data) {
		return (
			<div className="bg-white rounded-lg shadow-md p-3 text-left">
				<h2 className="text-2xl font-semibold mb-2">Lähdöt</h2>
				<p className="text-sm text-stone-500">
					{error ? 'Lähtöjä ei saatu' : 'Ladataan...'}
				</p>
			</div>
		)
	}

	const nowUnix = Math.floor(Date.now() / 1000)
	const departures = getHslDepartures(data, HSL_ALL_ALIASES, {
		fromUnix: nowUnix,
		reachableOnly: true,
	})
	// The next departure from each stop, and from the metro station the next
	// train in each direction. The station is the longest walk, so its trains
	// would never make the nearest few; they always get their rows.
	const nextDepartureByStop = new Map<string, (typeof departures)[number]>()

	for (const departure of departures) {
		const key = isStation(departure.alias)
			? `${departure.alias}-${departure.direction}`
			: departure.alias
		if (!nextDepartureByStop.has(key)) {
			nextDepartureByStop.set(key, departure)
		}
	}

	const next = Array.from(nextDepartureByStop.values())
	const metro = next.filter((departure) => isStation(departure.alias))
	const nextStops = [
		...metro,
		...next
			.filter((departure) => !isStation(departure.alias))
			.slice(0, MAX_UPCOMING_STOPS - metro.length),
	].sort((a, b) => a.departureUnix - b.departureUnix)

	return (
		<div className="bg-white rounded-lg shadow-md p-3 text-left">
			<h2 className="text-2xl font-semibold mb-2">Lähdöt</h2>
			{nextStops.length > 0 ? (
				<div className="space-y-1">
					{nextStops.map((departure) => (
						<div
							key={departure.id}
							className="grid grid-cols-[auto_1fr_auto] gap-2 items-center"
						>
							<p className="font-mono font-bold text-sm bg-stone-100 rounded px-2 py-1">
								{departure.line}
							</p>
							<div className="min-w-0">
								<p className="text-sm truncate">{departure.stopName}</p>
								<p className="text-xs text-stone-500 truncate">
									{departure.headsign}
								</p>
							</div>
							<p className="text-sm font-mono text-right whitespace-nowrap">
								{getMinutesUntilDeparture(departure.departureUnix)} min
							</p>
						</div>
					))}
				</div>
			) : (
				<p className="text-sm text-stone-500">Ei tulevia lähtöjä.</p>
			)}
		</div>
	)
}

SidebarDepartures.displayName = 'SidebarDepartures'

export default SidebarDepartures
