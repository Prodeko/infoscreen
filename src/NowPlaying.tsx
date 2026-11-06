// What the guild room's Spotify is playing, from /api/spotify-now-playing
// (server/spotify.ts). The card is in the sidebar only while something plays;
// App polls it so the departures can make room for the card.

// Same shape as NowPlaying in server/spotify.ts
export type NowPlayingData = {
	title: string
	artists: string
	album: string
	image: string | null
	progressMs: number
	durationMs: number
}

export const loadNowPlaying = async (): Promise<NowPlayingData | null> => {
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

const NowPlaying = ({ data }: { data: NowPlayingData | null }) => {
	if (!data) {
		return null
	}

	const progress =
		data.durationMs > 0 ? Math.min(1, data.progressMs / data.durationMs) : 0

	return (
		<div className="bg-white rounded-lg shadow-md p-3 text-left">
			<div className="flex gap-3 items-center">
				{data.image ? (
					<img src={data.image} alt="" className="w-10 h-10 rounded shrink-0" />
				) : (
					<span className="emoji text-2xl">🎵</span>
				)}
				<div className="min-w-0">
					<p className="font-semibold leading-tight truncate">{data.title}</p>
					<p className="text-sm leading-tight text-stone-600 truncate">
						{data.artists}
					</p>
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
