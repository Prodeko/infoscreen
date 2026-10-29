import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { ilmoSignups } from './server/ilmoSignups'

// Strips `prefix` from a proxied path and adds a query parameter. Secrets are
// added this way, on the server running `vite preview`, so they never become
// part of the page the browser loads.
const rewriteWithParam =
	(prefix: string, name: string, value: string) => (path: string) => {
		const url = new URL(path.slice(prefix.length), 'http://localhost')
		url.searchParams.set(name, value)
		return url.pathname + url.search
	}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '')

	// The VITE_ names are what the Pi's .env used while these were baked into
	// the page. They still work, but nothing reads them from the page anymore.
	const hslSubscriptionKey =
		env.HSL_SUBSCRIPTION_KEY || env.VITE_HSL_SUBSCRIPTION_KEY || ''
	const kiltiskameraPassword =
		env.KILTISKAMERA_ON_AIR_PASSWORD ||
		env.VITE_KILTISKAMERA_ON_AIR_PASSWORD ||
		''

	return {
		// ilmoSignups serves /api/ilmo-signups, see server/ilmoSignups.ts
		plugins: [react(), ilmoSignups()],
		server: {
			proxy: {
				'/kanttiinitproxy': {
					target: 'https://kitchen.kanttiinit.fi',
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/kanttiinitproxy/, ''),
				},
				// The bulletin still lives on the old Django site. Move this when
				// viikkotiedote gets a new home.
				'/tiedoteproxy': {
					target: 'https://old.prodeko.org/fi/palvelut/viikkotiedote/api',
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/tiedoteproxy/, ''),
				},
				// Slides from prodeko.org/fi/infoscreen.json. SLIDES_ORIGIN points it
				// elsewhere, e.g. a local `hugo server` of Prodeko/prodeko-org.
				'/slidesproxy': {
					target: env.SLIDES_ORIGIN || 'https://prodeko.org',
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/slidesproxy/, ''),
				},
				// The guild's public Google calendars, as iCalendar feeds.
				'/calendarproxy': {
					target: 'https://calendar.google.com',
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/calendarproxy/, ''),
				},
				// The most-voted PTER ideas. PTER_ORIGIN points it elsewhere, e.g. a
				// local `pnpm dev` of Prodeko/pter on http://localhost:3000.
				'/pterproxy': {
					target: env.PTER_ORIGIN || 'https://pter.prodeko.org',
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/pterproxy/, ''),
				},
				// Elections at vaalit.prodeko.org (vaaliplatta), public API
				'/vaaliproxy': {
					target: 'https://vaalit.prodeko.org',
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/vaaliproxy/, ''),
				},
				// HSL city bike stations through citybik.es (no key)
				'/citybikesproxy': {
					target: 'https://api.citybik.es',
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/citybikesproxy/, ''),
				},
				// Open-Meteo forecast (no key)
				'/weatherproxy': {
					target: 'https://api.open-meteo.com',
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/weatherproxy/, ''),
				},
				'/hsldata': {
					target: 'https://api.digitransit.fi',
					changeOrigin: true,
					rewrite: rewriteWithParam(
						'/hsldata',
						'digitransit-subscription-key',
						hslSubscriptionKey,
					),
				},
				'/kiltiskameraproxy': {
					target: 'https://kiltiskamera.prodeko.org',
					changeOrigin: true,
					rewrite: rewriteWithParam(
						'/kiltiskameraproxy',
						'password',
						kiltiskameraPassword,
					),
				},
				// Twelve Data. Without a key the Stocks slide stays hidden.
				'/stocksproxy': {
					target: 'https://api.twelvedata.com',
					changeOrigin: true,
					rewrite: rewriteWithParam(
						'/stocksproxy',
						'apikey',
						env.TWELVE_DATA_API_KEY ?? '',
					),
				},
			},
		},
	}
})
