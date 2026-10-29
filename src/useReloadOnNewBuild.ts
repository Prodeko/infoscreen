import { useEffect } from 'react'

const CHECK_INTERVAL_MS = 5 * 60 * 1000

// Reloads the page when a newer build is on the server, so a deploy reaches
// the kiosk without anyone pressing F5. In dev there is no version.json and
// nothing happens.
export const useReloadOnNewBuild = () => {
	useEffect(() => {
		const check = async () => {
			try {
				const response = await fetch(`/version.json?t=${Date.now()}`, {
					cache: 'no-store',
				})
				if (!response.ok) return
				const { version } = (await response.json()) as { version?: string }
				if (version && version !== __BUILD_ID__) {
					window.location.reload()
				}
			} catch {
				// Offline or mid-deploy; try again at the next check
			}
		}

		const interval = setInterval(check, CHECK_INTERVAL_MS)
		return () => clearInterval(interval)
	}, [])
}
