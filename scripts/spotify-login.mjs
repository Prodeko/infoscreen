// Signs the guild room's Spotify account in once and prints the refresh token
// that server/spotify.ts needs. Run on any computer with a browser:
//
//   npm run spotify-login
//
// It reads SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET from .env (or the
// environment), opens nothing itself: it prints a link, and after you sign in
// and allow access, Spotify redirects back to http://127.0.0.1:8888/callback,
// which this script is listening on. Put the printed SPOTIFY_REFRESH_TOKEN in
// the Pi's .env and restart the service.
//
// The redirect URI must be listed in the app's settings at
// https://developer.spotify.com/dashboard exactly as above.

import { randomBytes } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { createServer } from 'node:http'

const PORT = 8888
const REDIRECT_URI = `http://127.0.0.1:${PORT}/callback`
const SCOPES = 'user-read-currently-playing user-read-playback-state'

const readEnvFile = () => {
	try {
		return Object.fromEntries(
			readFileSync('.env', 'utf8')
				.split('\n')
				.map((line) => line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/))
				.filter(Boolean)
				.map((match) => [match[1], match[2].replace(/^["']|["']$/g, '')]),
		)
	} catch {
		return {}
	}
}

const env = { ...readEnvFile(), ...process.env }
const clientId = env.SPOTIFY_CLIENT_ID
const clientSecret = env.SPOTIFY_CLIENT_SECRET
if (!clientId || !clientSecret) {
	console.error(
		'Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env first.',
	)
	process.exit(1)
}

const state = randomBytes(16).toString('hex')
const authorizeUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams(
	{
		response_type: 'code',
		client_id: clientId,
		scope: SCOPES,
		redirect_uri: REDIRECT_URI,
		state,
	},
)}`

const server = createServer(async (req, res) => {
	const url = new URL(req.url ?? '/', REDIRECT_URI)
	if (url.pathname !== '/callback') {
		res.statusCode = 404
		res.end()
		return
	}
	if (
		url.searchParams.get('state') !== state ||
		!url.searchParams.get('code')
	) {
		res.end(`Sign-in failed: ${url.searchParams.get('error') ?? 'bad state'}`)
		return
	}
	const response = await fetch('https://accounts.spotify.com/api/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
		},
		body: new URLSearchParams({
			grant_type: 'authorization_code',
			code: url.searchParams.get('code'),
			redirect_uri: REDIRECT_URI,
		}),
	})
	const data = await response.json()
	if (!response.ok || !data.refresh_token) {
		res.end('Getting the token failed; see the terminal.')
		console.error('Token request failed:', response.status, data)
	} else {
		res.end('Done. You can close this tab and go back to the terminal.')
		console.log('\nAdd this line to the .env on the Pi:\n')
		console.log(`SPOTIFY_REFRESH_TOKEN=${data.refresh_token}\n`)
	}
	server.close()
})

server.listen(PORT, '127.0.0.1', () => {
	console.log(
		'Open this link, sign in with the guild room Spotify account and allow access:\n',
	)
	console.log(`${authorizeUrl}\n`)
})
