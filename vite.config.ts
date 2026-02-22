import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
	if (command === 'build') {
		const env = loadEnv(mode, process.cwd(), '')
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
				'/tiedoteproxy': {
					target: 'https://prodeko.org/fi/palvelut/viikkotiedote/api',
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/tiedoteproxy/, ''),
				},
				'/hsldata': {
					target: 'https://api.digitransit.fi',
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/hsldata/, ''),
				},
				'/stocksproxy': {
					target: 'https://stooq.com',
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/stocksproxy/, ''),
				},
			},
		},
	}
})
