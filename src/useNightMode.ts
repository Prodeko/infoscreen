import { useEffect } from 'react'

// From 22:00 to 07:00 the screen goes dark: index.css inverts the whole page
// (and inverts images and emoji back), so no component needs dark styles.
const NIGHT_STARTS = 22
const NIGHT_ENDS = 7

const isNight = (date: Date) => {
	const hour = date.getHours()
	return hour >= NIGHT_STARTS || hour < NIGHT_ENDS
}

export const useNightMode = () => {
	useEffect(() => {
		const update = () =>
			document.documentElement.classList.toggle('night', isNight(new Date()))
		update()
		const interval = setInterval(update, 60 * 1000)
		return () => clearInterval(interval)
	}, [])
}
