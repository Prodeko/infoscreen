import { Fragment } from 'react'
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
	// At most this many rows; the soonest are kept
	maxRows?: number
}

// Rail only: the metro from Aalto-yliopisto and tram 15 from Maari, the next
// two departures in each direction, whether or not one can walk there in
// time. Buses are on the HSL slide.
const RAIL_MODES = ['SUBWAY', 'TRAM']
const PER_DIRECTION = 2

// "Itäkeskus (M) via …" → "Itäkeskus": every rail line here ends at a metro
// station, so the (M) says nothing
const sidebarHeadsign = (headsign: string) =>
	shortHeadsign(headsign).replace(/\s*\(M\)$/, '')

const SidebarDepartures = ({
	data,
	error,
	maxRows = Number.POSITIVE_INFINITY,
}: SidebarDeparturesProps) => {
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

	// One row per line and direction. When rows are capped, the soonest win.
	const rows = new Map<string, HSLDeparture[]>()
	for (const departure of departures) {
		const key = `${departure.alias}-${departure.line}-${departure.direction}`
		const row = rows.get(key)
		if (!row) {
			if (rows.size < maxRows) {
				rows.set(key, [departure])
			}
		} else if (row.length < PER_DIRECTION) {
			row.push(departure)
		}
	}
	// Shown in a fixed order, metro before tram, so rows don't jump around as
	// the minutes tick
	const sortedRows = Array.from(rows.values()).sort(
		([a], [b]) =>
			RAIL_MODES.indexOf(a.mode ?? '') - RAIL_MODES.indexOf(b.mode ?? '') ||
			a.line.localeCompare(b.line, 'fi', { numeric: true }) ||
			a.headsign.localeCompare(b.headsign, 'fi'),
	)

	return (
		<div className="bg-white rounded-lg shadow-md p-3 text-left">
			<div className="flex items-baseline justify-between mb-2">
				<h2 className="text-2xl font-semibold">Lähdöt</h2>
				{sortedRows.length > 0 && <p className="text-sm text-stone-400">min</p>}
			</div>
			{sortedRows.length > 0 ? (
				// One grid for all rows so the columns line up: line, where to,
				// the next departure, and the one after it in grey
				<div className="grid grid-cols-[auto_1fr_auto_auto] gap-x-2 gap-y-1.5 items-center">
					{sortedRows.map(([next, after]) => (
						<Fragment key={next.id}>
							<LineBadge
								line={next.line}
								mode={next.mode}
								className="text-sm leading-6 px-1.5 min-w-[2.5rem]"
							/>
							<p className="text-sm leading-tight min-w-0 break-words">
								{sidebarHeadsign(next.headsign)}
							</p>
							<p className="text-base font-semibold tabular-nums text-right">
								{getMinutesUntilDeparture(next.departureUnix)}
							</p>
							<p className="text-sm tabular-nums text-right text-stone-400 min-w-[1.25rem]">
								{after ? getMinutesUntilDeparture(after.departureUnix) : ''}
							</p>
						</Fragment>
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
