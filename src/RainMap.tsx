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

const radarUrl = (cacheKey: number) =>
	wmsUrl('Radar:suomi_dbz_eureffin', `&TRANSPARENT=true&_=${cacheKey}`)

// Where Otaniemi is on the grid, for the marker
const markerLeft = ((centerX - firstX) / COLS) * 100
const markerTop = ((centerY - firstY) / ROWS) * 100

const RainMap = (_props: { rotationInterval?: number }) => {
	const [loadedAt, setLoadedAt] = useState(() => Date.now())

	useEffect(() => {
		const interval = setInterval(() => setLoadedAt(Date.now()), REFRESH_MS)
		return () => clearInterval(interval)
	}, [])

	return (
		<div className="h-full flex flex-col gap-4">
			<div className="flex items-baseline justify-between">
				<h1 className="text-4xl font-bold">Sadetutka</h1>
				<p className="text-lg text-stone-500">
					Päivitetty{' '}
					{new Date(loadedAt).toLocaleTimeString('fi-FI', {
						hour: '2-digit',
						minute: '2-digit',
					})}
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
					<img
						src={radarUrl(loadedAt)}
						alt="Sadetutka"
						className="absolute inset-0 w-full h-full"
					/>
					<div
						className="absolute w-4 h-4 -ml-2 -mt-2 rounded-full bg-red-600 ring-4 ring-white"
						style={{ left: `${markerLeft}%`, top: `${markerTop}%` }}
					/>
				</div>
				<p className="absolute bottom-1 right-2 text-xs text-stone-500 bg-white/70 px-1 rounded">
					Tutka: Ilmatieteen laitos. Kartta: © OpenStreetMapin tekijät
				</p>
			</div>
		</div>
	)
}

export default RainMap
