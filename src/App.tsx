import { useCallback, useEffect, useState } from 'react'
import McKinseyLogo from './McKinseyLogo'
import { Menu } from './Menu'
import Rotator from './Rotator'

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

const useAutoRefreshingViewerCount = (
	refreshIntervalMS: number = 60 * 1000,
) => {
	const [onAir, setOnAir] = useState<boolean>(false)

	const fetchViewerCount = useCallback(async () => {
		try {
			const response = await fetch(
				`https://kiltiskamera.prodeko.org/on_air?password=${
					import.meta.env.VITE_KILTISKAMERA_ON_AIR_PASSWORD
				}`,
			)
			const data = await response.json()
			setOnAir(data.onAir)
		} catch (error) {
			console.error(
				'Failed to fetch viewer count. Maybe the Kiltiskamera is down?',
				error,
			)
		}
	}, [])

	// Refresh the viewer count every `refreshIntervalMS` milliseconds
	useEffect(() => {
		const interval = setInterval(fetchViewerCount, refreshIntervalMS)
		return () => clearInterval(interval)
	}, [refreshIntervalMS, fetchViewerCount])

	// Fetch viewers on mount
	useEffect(() => {
		fetchViewerCount()
	}, [fetchViewerCount])

	return { onAir }
}

const Time = () => {
	const time = useClock()
	const timeHoursMinutesSeconds = time.toLocaleTimeString('fi-FI', {
		minute: '2-digit',
		hour: '2-digit',
		second: '2-digit',
	})

	const date = time.toLocaleDateString('fi-FI', {
		weekday: 'short', // This adds the name of the day
		year: 'numeric',
		month: 'numeric',
		day: 'numeric',
	})

	return (
		<div>
			<p className="text-3xl">{date}</p>
			<p className="text-4xl font-mono font-bold">{timeHoursMinutesSeconds}</p>
		</div>
	)
}

const Viewers = () => {
	const { onAir } = useAutoRefreshingViewerCount(1000)

	return (
		<div className="flex items-center justify-center p-4 rounded-lg shadow-inner relative">
			<div
				className={`absolute inset-0 rounded-lg ${
					onAir ? 'bg-red-200 animate-pulse' : 'bg-green-200'
				}`}
			/>
			<div className="relative z-10">
				{onAir ? (
					<div className="flex flex-col gap-2">
						<p className="text-xl font-normal">Kiltiskamera</p>
						<p className="text-2xl font-bold text-red-700">ON AIR</p>
					</div>
				) : (
					<p className="text-xl font-light">No camera viewers</p>
				)}
			</div>
		</div>
	)
}

const App = () => {
	return (
		<main className="grid grid-rows-1 grid-cols-[8fr_1fr] h-screen">
			<div className="h-full p-4">
				<Rotator defaultRotationInterval={10000}>
					<Menu rotationInterval={30000} />
					<McKinseyLogo rotationInterval={10000} />
				</Rotator>
			</div>
			<div className="bg-stone-100 h-full text-center flex flex-col justify-between shadow-md p-4">
				<Time />
				<Viewers />
			</div>
		</main>
	)
}

export default App
