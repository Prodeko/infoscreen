import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
	const env = loadEnv(mode, process.cwd(), '')

	if (command === 'build') {
		const requiredEnvKeys = [
			'VITE_KILTISKAMERA_ON_AIR_PASSWORD',
			'VITE_HSL_SUBSCRIPTION_KEY',
		] as const
		const missingEnvKeys = requiredEnvKeys.filter((key) => !env[key])

		if (missingEnvKeys.length > 0) {
			throw new Error(`${missingEnvKeys.join(', ')} is not set.`)
		}
	}

	return {
		plugins: [react()],
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
				'/hsldata': {
					target: 'https://api.digitransit.fi',
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/hsldata/, ''),
				},
				// Twelve Data. The key is added here, on the server, so it is not
				// part of the page. Without it the Stocks slide stays hidden.
				'/stocksproxy': {
					target: 'https://api.twelvedata.com',
					changeOrigin: true,
					rewrite: (path) => {
						const url = new URL(
							path.replace(/^\/stocksproxy/, ''),
							'http://localhost',
						)
						url.searchParams.set('apikey', env.TWELVE_DATA_API_KEY ?? '')
						return url.pathname + url.search
					},
				},
			},
		},
	}
})
