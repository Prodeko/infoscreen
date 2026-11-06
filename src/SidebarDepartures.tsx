import {
	getHslDepartures,
	getMinutesUntilDeparture,
	HSL_ALL_ALIASES,
	type HSLData,
	type HSLDeparture,
	shortHeadsign,
} from './hslApi'
import LineBadge from './LineBadge'

type SidebarDeparturesProps = {
	data: HSLData | null
	error?: string | null
}

// Rail only: the metro from Aalto-yliopisto and tram 15 from Maari, the next
// two departures in each direction, whether or not one can walk there in
// time. Buses are on the HSL slide.
const RAIL_MODES = ['SUBWAY', 'TRAM']
const PER_DIRECTION = 2

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

	const departures = getHslDepartures(data, HSL_ALL_ALIASES, {
		fromUnix: Math.floor(Date.now() / 1000),
	}).filter((departure) => RAIL_MODES.includes(departure.mode ?? ''))

	// One row per line and direction, in the order of its next departure
	const rows = new Map<string, HSLDeparture[]>()
	for (const departure of departures) {
		const key = `${departure.alias}-${departure.line}-${departure.direction}`
		const row = rows.get(key) ?? []
		if (row.length < PER_DIRECTION) {
			row.push(departure)
			rows.set(key, row)
		}
	}

	return (
		<div className="bg-white rounded-lg shadow-md p-3 text-left">
			<h2 className="text-2xl font-semibold mb-2">Lähdöt</h2>
			{rows.size > 0 ? (
				<div className="space-y-1">
					{Array.from(rows.values()).map(([next, ...later]) => (
						<div
							key={next.id}
							className="grid grid-cols-[auto_1fr_auto] gap-2 items-center"
						>
							<LineBadge
								line={next.line}
								mode={next.mode}
								className="text-sm px-1.5 py-0.5 min-w-[2.5rem]"
							/>
							<p className="text-sm leading-tight min-w-0 break-words">
								{shortHeadsign(next.headsign)}
							</p>
							<p className="text-sm font-mono text-right whitespace-nowrap">
								{getMinutesUntilDeparture(next.departureUnix)}
								{later.map((departure) => (
									<span key={departure.id} className="text-stone-400">
										, {getMinutesUntilDeparture(departure.departureUnix)}
									</span>
								))}{' '}
								min
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
