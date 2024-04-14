import { useEffect, useState } from "react"

/**
 * Custom hook to get the current time from the browser.
 * Updates once every second.
 * @returns The current time as a Date object.
 */
const useClock = () => {
	const [time, setTime] = useState<Date>(new Date())

	useEffect(() => {
		const interval = setInterval(() => setTime(new Date()), 1000)
		return () => clearInterval(interval)
	}, [])

	return time
}

const App = () => {
	const time = useClock()
	const timeHoursMinutes = time.toLocaleTimeString("fi-FI", {
		"minute": "2-digit",
		"hour": "2-digit",
	}).replace(/\./g, ":")

	return (
		<div className="grid min-h-screen grid-cols-[2fr_2fr_1fr] grid-rows-[100px_auto_100px] gap-10 bg-gray-50 p-4">
			<h1 className="text-xl font-bold underline bg-blue-100 col-span-2">
				Prodeko
			</h1>
			<h1 className="text-8xl flex flex-col font-semibold bg-green-200 text-center items-center justify-center">{
				timeHoursMinutes
			}</h1>
			<h1 className="text-xl font-bold underline bg-orange-100">Kanttiinit</h1>
			<h1 className="text-xl font-bold underline bg-orange-100 row-span-2">
				Ilmos
			</h1>
			<h1 className="text-xl font-bold underline bg-orange-100 row-span-2">
				Viewers
			</h1>
			<h1 className="text-xl font-bold underline bg-orange-100">Sponsors</h1>
		</div>
	)
}

export default App
