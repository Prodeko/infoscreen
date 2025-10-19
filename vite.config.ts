import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
	// Throw an error if the password is not set during build
	if (
		command === 'build' &&
		!loadEnv(mode, process.cwd(), '').VITE_KILTISKAMERA_ON_AIR_PASSWORD
	) {
		throw new Error(
			'VITE_KILTISKAMERA_ON_AIR_PASSWORD is not set.',
		)
	}

	return {
		plugins: [react()],
	}
})
