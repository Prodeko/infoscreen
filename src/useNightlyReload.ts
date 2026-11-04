import { useEffect } from 'react'

// The hour (local time) the page reloads itself every night
const RELOAD_HOUR = 4

// Reloads the page once a night. The kiosk runs for days without a reload,
// and on the Pi Chrome's memory grows until the tab crashes; a fresh page
// every night keeps it from building up.
export const useNightlyReload = () => {
	useEffect(() => {
		const next = new Date()
		next.setHours(RELOAD_HOUR, 0, 0, 0)
		if (next.getTime() <= Date.now()) {
			next.setDate(next.getDate() + 1)
		}
		const timeout = setTimeout(
			() => window.location.reload(),
			next.getTime() - Date.now(),
		)
		return () => clearTimeout(timeout)
	}, [])
}
