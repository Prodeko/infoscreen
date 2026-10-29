import StaleNote from './StaleNote'
import { fetchJson, usePolling } from './usePolling'

// HSL city bike stations closest to the guild room. IDs are HSL's own
// (smoove:<number>); the data comes from citybik.es, which needs no key.
const STATIONS = [
	{ id: 'smoove:541', name: 'Korkeakouluaukio' },
	{ id: 'smoove:545', name: 'Sähkömies' },
	{ id: 'smoove:539', name: 'Tietotie' },
	{ id: 'smoove:547', name: 'Jämeräntaival' },
]

type CitybikesResponse = {
	network: {
		stations: Array<{
			free_bikes: number | null
			empty_slots: number | null
			extra?: { uid?: string; online?: boolean }
		}>
	}
}

type StationStatus = {
	id: string
	name: string
	bikes: number
	slots: number
}

const loadStations = async (): Promise<StationStatus[]> => {
	const data = await fetchJson<CitybikesResponse>(
		'/citybikesproxy/v2/networks/citybikes-helsinki?fields=stations',
	)
	return STATIONS.flatMap((station) => {
		const live = data.network.stations.find((s) => s.extra?.uid === station.id)
		// Stations go offline between November and March
		if (!live || live.extra?.online === false) {
			return []
		}
		return [
			{
				...station,
				bikes: live.free_bikes ?? 0,
				slots: live.empty_slots ?? 0,
			},
		]
	})
}

const CityBikes = () => {
	const { data, updatedAt, isStale } = usePolling(loadStations, 60 * 1000)

	// Hidden off-season, when no station is online
	if (!data || data.length === 0) {
		return null
	}

	return (
		<div className="bg-white rounded-lg shadow-md p-3 text-left">
			<h2 className="text-2xl font-semibold mb-2">Kaupunkipyörät</h2>
			<ul className="flex flex-col gap-1">
				{data.map((station) => (
					<li key={station.id} className="flex justify-between gap-2">
						<span className="truncate">{station.name}</span>
						<span
							className={`font-mono font-bold ${
								station.bikes === 0 ? 'text-red-600' : ''
							}`}
						>
							{station.bikes}
						</span>
					</li>
				))}
			</ul>
			<StaleNote updatedAt={updatedAt} isStale={isStale} className="mt-1" />
		</div>
	)
}

export default CityBikes
