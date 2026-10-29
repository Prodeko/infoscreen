import { usePolling } from './usePolling'

// What the guild room's Spotify is playing, from /api/spotify-now-playing
// (server/spotify.ts). The card is in the sidebar only while something plays.

// Same shape as NowPlaying in server/spotify.ts
type NowPlayingData = {
	title: string
	artists: string
	album: string
	image: string | null
	progressMs: number
	durationMs: number
}

const loadNowPlaying = async (): Promise<NowPlayingData | null> => {
	const response = await fetch('/api/spotify-now-playing')
	// 204: nothing playing, or Spotify not set up on this machine
	if (response.status === 204) {
		return null
	}
	if (!response.ok) {
		throw new Error(`Spotify request failed with status ${response.status}`)
	}
	return (await response.json()) as NowPlayingData
}

const NowPlaying = () => {
	const { data } = usePolling(loadNowPlaying, 10 * 1000)

	if (!data) {
		return null
	}

	const progress =
		data.durationMs > 0 ? Math.min(1, data.progressMs / data.durationMs) : 0

	return (
		<div className="bg-white rounded-lg shadow-md p-3 text-left">
			<p className="text-sm text-stone-500 mb-2">
				<span className="emoji">🎵</span> Nyt soi
			</p>
			<div className="flex gap-3 items-center">
				{data.image && (
					<img src={data.image} alt="" className="w-14 h-14 rounded shrink-0" />
				)}
				<div className="min-w-0">
					<p className="font-semibold leading-tight truncate">{data.title}</p>
					<p className="text-sm text-stone-600 truncate">{data.artists}</p>
				</div>
			</div>
			<div className="h-1 bg-stone-200 rounded mt-2">
				<div
					className="h-1 bg-emerald-500 rounded"
					style={{ width: `${progress * 100}%` }}
				/>
			</div>
		</div>
	)
}

export default NowPlaying
