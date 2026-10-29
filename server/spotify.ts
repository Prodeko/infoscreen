import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'

// Serves /api/spotify-now-playing: what the guild room's Spotify account is
// playing right now, trimmed to what the sidebar shows.
//
// Spotify's Web API needs a user's access token. The account signs in once
// with `npm run spotify-login` (scripts/spotify-login.mjs), which prints a
// refresh token for .env; from then on this exchanges it for short-lived
// access tokens on the server, so neither token nor the app's secret ever
// reaches the page. Without the three variables the endpoint answers 204 and
// the sidebar card stays hidden.

const TOKEN_URL = 'https://accounts.spotify.com/api/token'
const NOW_PLAYING_URL =
	'https://api.spotify.com/v1/me/player/currently-playing?additional_types=track,episode'
const CACHE_MS = 5 * 1000

export type NowPlaying = {
	title: string
	artists: string
	album: string
	image: string | null
	progressMs: number
	durationMs: number
}

type SpotifyImage = { url: string; width: number | null }

type SpotifyItem = {
	name: string
	duration_ms: number
	// A track
	artists?: Array<{ name: string }>
	album?: { name: string; images: SpotifyImage[] }
	// A podcast episode
	show?: { name: string; publisher: string; images: SpotifyImage[] }
	images?: SpotifyImage[]
}

type SpotifyCurrentlyPlaying = {
	is_playing: boolean
	progress_ms: number | null
	item: SpotifyItem | null
}

type Credentials = {
	clientId: string
	clientSecret: string
	refreshToken: string
}

// The smallest cover that is still at least 200 px wide
const pickImage = (images: SpotifyImage[] = []) => {
	const sorted = [...images].sort((a, b) => (a.width ?? 0) - (b.width ?? 0))
	return (
		(sorted.find((image) => (image.width ?? 0) >= 200) ?? sorted.at(-1))?.url ??
		null
	)
}

const toNowPlaying = (data: SpotifyCurrentlyPlaying): NowPlaying | null => {
	const item = data.item
	if (!data.is_playing || !item) {
		return null
	}
	return {
		title: item.name,
		artists: item.artists
			? item.artists.map((artist) => artist.name).join(', ')
			: (item.show?.publisher ?? ''),
		album: item.album?.name ?? item.show?.name ?? '',
		image: pickImage(item.album?.images ?? item.images ?? item.show?.images),
		progressMs: data.progress_ms ?? 0,
		durationMs: item.duration_ms,
	}
}

export const spotify = (credentials: Credentials): Plugin => {
	let accessToken: { value: string; expiresAt: number } | null = null
	let cached: { at: number; body: NowPlaying | null } | null = null

	const getAccessToken = async () => {
		if (accessToken && Date.now() < accessToken.expiresAt - 60 * 1000) {
			return accessToken.value
		}
		const response = await fetch(TOKEN_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				Authorization: `Basic ${Buffer.from(
					`${credentials.clientId}:${credentials.clientSecret}`,
				).toString('base64')}`,
			},
			body: new URLSearchParams({
				grant_type: 'refresh_token',
				refresh_token: credentials.refreshToken,
			}),
		})
		if (!response.ok) {
			throw new Error(`token request failed with status ${response.status}`)
		}
		const data = (await response.json()) as {
			access_token: string
			expires_in: number
		}
		accessToken = {
			value: data.access_token,
			expiresAt: Date.now() + data.expires_in * 1000,
		}
		return accessToken.value
	}

	const fetchNowPlaying = async (): Promise<NowPlaying | null> => {
		const response = await fetch(NOW_PLAYING_URL, {
			headers: { Authorization: `Bearer ${await getAccessToken()}` },
		})
		// 204: nothing is playing, or the account has no active device
		if (response.status === 204) {
			return null
		}
		if (response.status === 401) {
			accessToken = null
		}
		if (!response.ok) {
			throw new Error(`currently-playing failed with status ${response.status}`)
		}
		return toNowPlaying((await response.json()) as SpotifyCurrentlyPlaying)
	}

	const configured =
		credentials.clientId && credentials.clientSecret && credentials.refreshToken

	const middleware = async (
		req: IncomingMessage,
		res: ServerResponse,
		next: () => void,
	) => {
		if (req.url?.split('?')[0] !== '/api/spotify-now-playing') {
			next()
			return
		}
		if (!configured) {
			res.statusCode = 204
			res.end()
			return
		}
		try {
			if (!cached || Date.now() - cached.at > CACHE_MS) {
				cached = { at: Date.now(), body: await fetchNowPlaying() }
			}
			if (!cached.body) {
				res.statusCode = 204
				res.end()
				return
			}
			res.setHeader('Content-Type', 'application/json')
			res.end(JSON.stringify(cached.body))
		} catch (error) {
			console.error('[spotify]', error)
			res.statusCode = 502
			res.setHeader('Content-Type', 'application/json')
			res.end(JSON.stringify({ error: String(error) }))
		}
	}

	return {
		name: 'spotify-now-playing',
		configureServer: (server) => {
			server.middlewares.use(middleware)
		},
		configurePreviewServer: (server) => {
			server.middlewares.use(middleware)
		},
	}
}
