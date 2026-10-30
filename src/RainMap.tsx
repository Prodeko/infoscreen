import { useEffect, useState } from 'react'

// Rain radar over the capital region: FMI's radar layer (open WMS, no key)
// over OpenStreetMap tiles, muted to grey so the rain stands out. The area is
// a 7 x 4 block of zoom-10 map tiles around Otaniemi, roughly Kirkkonummi to
// Sipoo; the radar is requested for exactly that Web Mercator area, so the
// two line up. One screen loading a couple of dozen tiles is within
// OpenStreetMap's tile usage policy, which asks for the attribution below.
const ZOOM = 10
const COLS = 7
const ROWS = 4
const TILE = 256
const CENTER = { lat: 60.1867, lon: 24.8277 } // Otaniemi
const EARTH = 6378137
const REFRESH_MS = 5 * 60 * 1000
const LAYER = 'Radar:suomi_dbz_eureffin'

// The last half hour as a loop of FMI's 5-minute radar frames. FMI's open
// data has no radar forecast, so the loop ends at the newest frame and holds
// there a moment before starting over.
const FRAME_STEP_MS = 5 * 60 * 1000
const FRAME_COUNT = 7
const FRAME_MS = 600
const HOLD_MS = 2000

const tiles = 2 ** ZOOM
const centerX = ((CENTER.lon + 180) / 360) * tiles
const latRad = (CENTER.lat * Math.PI) / 180
const centerY =
	((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
	tiles
const firstX = Math.floor(centerX - COLS / 2)
const firstY = Math.floor(centerY - ROWS / 2)

const metersX = (tileX: number) =>
	(tileX / tiles) * 2 * Math.PI * EARTH - Math.PI * EARTH
const metersY = (tileY: number) =>
	Math.PI * EARTH - (tileY / tiles) * 2 * Math.PI * EARTH

const RADAR_BBOX = [
	metersX(firstX),
	metersY(firstY + ROWS),
	metersX(firstX + COLS),
	metersY(firstY),
].join(',')

const wmsUrl = (layer: string, extra = '') =>
	'https://openwms.fmi.fi/geoserver/wms?SERVICE=WMS&VERSION=1.3.0' +
	`&REQUEST=GetMap&LAYERS=${layer}&STYLES=&CRS=EPSG:3857` +
	`&BBOX=${RADAR_BBOX}&WIDTH=${COLS * TILE}&HEIGHT=${ROWS * TILE}` +
	`&FORMAT=image/png${extra}`

const TILES = Array.from({ length: ROWS * COLS }, (_, i) => ({
	x: firstX + (i % COLS),
	y: firstY + Math.floor(i / COLS),
	left: (i % COLS) * TILE,
	top: Math.floor(i / COLS) * TILE,
}))

const radarUrl = (time: string | null, cacheKey: number) =>
	wmsUrl(LAYER, `&TRANSPARENT=true${time ? `&TIME=${time}` : `&_=${cacheKey}`}`)

// The newest frame's time, from the end of the layer's time dimension
// ("start/end/PT5M") in its capabilities.
const fetchLatestFrame = async () => {
	const response = await fetch(
		`https://openwms.fmi.fi/geoserver/${LAYER.replace(':', '/')}/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities`,
	)
	if (!response.ok) {
		throw new Error(`HTTP ${response.status}`)
	}
	const capabilities = await response.text()
	const extent = capabilities.match(/<Dimension name="time"[^>]*>([^<]+)</)
	const end = extent?.[1].trim().split('/')[1]
	const latest = end ? Date.parse(end) : Number.NaN
	if (Number.isNaN(latest)) {
		throw new Error('no radar times')
	}
	return latest
}

const frameTimes = (latest: number) =>
	Array.from(
		{ length: FRAME_COUNT },
		(_, i) => latest - (FRAME_COUNT - 1 - i) * FRAME_STEP_MS,
	)

const clock = (time: number) =>
	new Date(time).toLocaleTimeString('fi-FI', {
		hour: '2-digit',
		minute: '2-digit',
	})

// Where Otaniemi is on the grid, for the marker
const markerLeft = ((centerX - firstX) / COLS) * 100
const markerTop = ((centerY - firstY) / ROWS) * 100

const RainMap = (_props: { rotationInterval?: number }) => {
	const [loadedAt, setLoadedAt] = useState(() => Date.now())
	// Frame times for the loop; null shows FMI's current frame, unanimated,
	// when the frame times could not be loaded
	const [frames, setFrames] = useState<number[] | null>(null)
	const [frame, setFrame] = useState(FRAME_COUNT - 1)

	useEffect(() => {
		const load = () => {
			setLoadedAt(Date.now())
			fetchLatestFrame()
				.then((latest) => setFrames(frameTimes(latest)))
				.catch(() => setFrames(null))
		}
		load()
		const interval = setInterval(load, REFRESH_MS)
		return () => clearInterval(interval)
	}, [])

	useEffect(() => {
		if (!frames) {
			return
		}
		const last = frames.length - 1
		const timeout = setTimeout(
			() => setFrame((current) => (current >= last ? 0 : current + 1)),
			frame >= last ? HOLD_MS : FRAME_MS,
		)
		return () => clearTimeout(timeout)
	}, [frames, frame])

	return (
		<div className="h-full flex flex-col gap-4">
			<div className="flex items-baseline justify-between">
				<h1 className="text-4xl font-bold">Sadetutka</h1>
				<p className="text-lg text-stone-500">
					{frames ? 'Viimeiset 30 minuuttia' : `Päivitetty ${clock(loadedAt)}`}
				</p>
			</div>
			<div className="relative flex-1 min-h-0 overflow-hidden rounded-lg shadow-md">
				<div
					className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
					style={{ width: COLS * TILE, height: ROWS * TILE }}
				>
					{TILES.map((tile) => (
						<img
							key={`${tile.x}-${tile.y}`}
							src={`https://tile.openstreetmap.org/${ZOOM}/${tile.x}/${tile.y}.png`}
							alt=""
							className="absolute grayscale opacity-80"
							style={{
								left: tile.left,
								top: tile.top,
								width: TILE,
								height: TILE,
							}}
						/>
					))}
					{/* Every frame stays loaded and only the current one is shown, so the
					    loop doesn't flicker while images load */}
					{frames ? (
						frames.map((time, i) => (
							<img
								key={time}
								src={radarUrl(new Date(time).toISOString(), loadedAt)}
								alt={i === frame ? 'Sadetutka' : ''}
								className={`absolute inset-0 w-full h-full ${
									i === frame ? 'opacity-100' : 'opacity-0'
								}`}
							/>
						))
					) : (
						<img
							src={radarUrl(null, loadedAt)}
							alt="Sadetutka"
							className="absolute inset-0 w-full h-full"
						/>
					)}
					<div
						className="absolute w-4 h-4 -ml-2 -mt-2 rounded-full bg-red-600 ring-4 ring-white"
						style={{ left: `${markerLeft}%`, top: `${markerTop}%` }}
					/>
				</div>
				{frames && (
					<div className="absolute top-3 left-3 flex items-end gap-1 bg-white/85 rounded px-3 py-2">
						{frames.map((time, i) => (
							<div key={time} className="flex flex-col items-center gap-1">
								<div
									className={`h-2 w-10 rounded-sm ${
										i <= frame ? 'bg-[#002e7d]' : 'bg-stone-300'
									}`}
								/>
								<span
									className={`text-sm font-mono ${
										i === frame ? 'text-stone-900 font-bold' : 'text-stone-500'
									}`}
								>
									{clock(time)}
								</span>
							</div>
						))}
					</div>
				)}
				<p className="absolute bottom-1 right-2 text-xs text-stone-500 bg-white/70 px-1 rounded">
					Tutka: Ilmatieteen laitos. Kartta: © OpenStreetMapin tekijät
				</p>
			</div>
		</div>
	)
}

export default RainMap
