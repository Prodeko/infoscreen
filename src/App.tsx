import { useCallback, useEffect, useState } from 'react'
import McKinseyLogo from './McKinseyLogo'
import { Menu } from './Menu'
import Rotator from './Rotator'
import Tiedote from './Tiedote'
import type {
	Menu as MenuType,
	Restaurant,
	RestaurantDailyMenu,
	TiedoteCategory,
	TiedoteMessageWithCategory,
} from './types'

const RESTAURANT_IDS = ['7', '52', '2'] // TUAS, A Bloc, T-talo

const useAutoRefreshingMenus = (refreshIntervalMS: number = 60 * 60 * 1000) => {
	const [menus, setMenus] = useState<Record<string, MenuType> | null>(null)
	const [restaurants, setRestaurants] = useState<Record<
		string,
		Restaurant
	> | null>(null)

	const fetchMenus = async () => {
		try {
			const response = await fetch('/kanttiinitproxy/menus/')
			const data = await response.json()
			setMenus(data)
		} catch (error) {
			console.error('Failed to fetch menus. Maybe the server is down?', error)
		}
	}

	const fetchRestaurants = async () => {
		try {
			const response = await fetch('/kanttiinitproxy/restaurants/')
			const data = (await response.json()) as Restaurant[]
			const restaurantMap = data.reduce(
				(acc, restaurant) => {
					acc[restaurant.id] = restaurant
					return acc
				},
				{} as Record<string, Restaurant>,
			)
			setRestaurants(restaurantMap)
		} catch (error) {
			console.error(
				'Failed to fetch restaurants. Maybe the server is down?',
				error,
			)
		}
	}

	// Refresh the menus every `refreshIntervalMS` milliseconds
	useEffect(() => {
		const interval = setInterval(fetchMenus, refreshIntervalMS)
		return () => clearInterval(interval)
	}, [refreshIntervalMS])

	// Fetch menus and restaurants on mount
	useEffect(() => {
		fetchMenus()
		fetchRestaurants()
	}, [])

	return { menus, restaurants }
}

const useAutoRefreshingTiedote = (refreshIntervalMS: number = 60 * 60 * 1000) => {
	const [tiedote, setTiedote] = useState<TiedoteCategory[] | null>(null)

	const fetchTiedote = async () => {
		try {
			const response = await fetch('/tiedoteproxy/content/')
			const data = await response.json()
			setTiedote(data)
		} catch (error) {
			console.error('Failed to fetch tiedote. Maybe the server is down?', error)
		}
	}

	useEffect(() => {
		fetchTiedote()
		const interval = setInterval(fetchTiedote, refreshIntervalMS)
		return () => clearInterval(interval)
	}, [refreshIntervalMS])

	return tiedote
}

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
	const { onAir } = useAutoRefreshingViewerCount(2000)

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
	const { menus, restaurants } = useAutoRefreshingMenus()
	const tiedote = useAutoRefreshingTiedote()

	const allTiedoteMessages: TiedoteMessageWithCategory[] | undefined =
		tiedote?.flatMap((category) =>
			category.messages.map((message) => ({
				...message,
				categoryTitle: category.title,
			})),
		)

	const today = new Date()
	const todayKey = `${today.getFullYear()}-${String(
		today.getMonth() + 1,
	).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

	// The API's openingHours array is likely Monday-indexed (0=Mon, 6=Sun).
	// Date.getDay() is Sunday-indexed (0=Sun, 1=Mon).
	// We need to convert Sunday from 0 to 6.
	const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1

	const todaysMenus: RestaurantDailyMenu[] | null =
		menus && restaurants
			? RESTAURANT_IDS.map((id) => {
					const restaurant = restaurants[id]
					const menu = menus[id]?.[todayKey]
					const openingHours = restaurant?.openingHours[dayOfWeek]

					return {
						id: restaurant.id,
						name: restaurant.name,
						menu: menu || null,
						openingHours: openingHours || null,
					}
				})
			: null

	return (
		<main className="grid grid-rows-1 grid-cols-[8fr_1fr] h-screen">
			<div className="h-full p-4">
				<Rotator defaultRotationInterval={10000}>
					<Menu rotationInterval={30000} todaysMenus={todaysMenus} />
					<Tiedote messages={allTiedoteMessages} rotationInterval={15000} />
					<McKinseyLogo rotationInterval={5000} />
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
