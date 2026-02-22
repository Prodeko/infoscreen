import {
	HSL_ALL_ALIASES,
	getHslDepartures,
	getMinutesUntilDeparture,
	type HSLData,
} from './hsl'

type SidebarDeparturesProps = {
	data: HSLData | null
}

const MAX_UPCOMING_STOPS = 5

const SidebarDepartures = ({ data }: SidebarDeparturesProps) => {
	if (!data) {
		return (
			<div className="bg-white rounded-lg shadow-md p-3 text-left">
				<h2 className="text-2xl font-semibold mb-2">Lähdöt</h2>
				<p className="text-sm text-stone-500">Ladataan...</p>
			</div>
		)
	}

	const nowUnix = Math.floor(Date.now() / 1000)
	const departures = getHslDepartures(data, HSL_ALL_ALIASES, {
		fromUnix: nowUnix,
	})
	const nextDepartureByStop = new Map<string, (typeof departures)[number]>()

	for (const departure of departures) {
		if (!nextDepartureByStop.has(departure.alias)) {
			nextDepartureByStop.set(departure.alias, departure)
		}
	}

	const nextStops = Array.from(nextDepartureByStop.values())
		.sort((a, b) => a.departureUnix - b.departureUnix)
		.slice(0, MAX_UPCOMING_STOPS)

	return (
		<div className="bg-white rounded-lg shadow-md p-3 text-left">
			<h2 className="text-2xl font-semibold mb-2">Lähdöt</h2>
			{nextStops.length > 0 ? (
				<div className="space-y-2">
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
