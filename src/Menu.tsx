import { useEffect, useState } from 'react'
import type { Meal, Menu as MenuType, Restaurant } from './types'

//const RESTAURANT_IDS = ['7', '52', '2'] // TUAS, A Bloc, T-talo
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

const MenuRow = ({ meal }: { meal: Meal }) => {
	return (
		<div className="grid grid-cols-[6fr_1fr] gap-2">
			<div className="flex flex-col">
				<p className="text-lg font-bold">{meal.title}</p>
				<p className="text-sm italic">{meal.properties.join(', ')}</p>
			</div>
		</div>
	)
}

const useClosingSoon = (openingHours: string | null) => {
	const [isClosingSoon, setIsClosingSoon] = useState(false)

	useEffect(() => {
		if (!openingHours) return

		const checkClosingTime = () => {
			const parts = openingHours.split('-').map((p) => p.trim())
			if (parts.length < 2) return

			const closingTimeStr = parts[1]
			const [hours, minutes] = closingTimeStr.split(':').map(Number)

			if (isNaN(hours) || isNaN(minutes)) return

			const now = new Date()
			const closingTime = new Date()
			closingTime.setHours(hours, minutes, 0, 0)

			const diffInMinutes = (closingTime.getTime() - now.getTime()) / (1000 * 60)

			if (diffInMinutes > 0 && diffInMinutes < 30) {
				setIsClosingSoon(true)
			} else {
				setIsClosingSoon(false)
			}
		}

		checkClosingTime()
		const interval = setInterval(checkClosingTime, 60 * 1000) // Check every minute

		return () => clearInterval(interval)
	}, [openingHours])

	return isClosingSoon
}

const RestaurantMenu = ({
	menu,
	restaurant,
}: {
	menu: MenuType
	restaurant: Restaurant
}) => {
	const today = new Date()
	const todayKey = `${today.getFullYear()}-${String(
		today.getMonth() + 1,
	).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
	const todaysMenu = menu[todayKey]

	// The API's openingHours array is likely Monday-indexed (0=Mon, 6=Sun).
	// Date.getDay() is Sunday-indexed (0=Sun, 1=Mon).
	// We need to convert Sunday from 0 to 6.
	const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1
	const openingHours = restaurant.openingHours[dayOfWeek]
	const isClosingSoon = useClosingSoon(openingHours)

	return (
		<div className="bg-white rounded-lg shadow-md p-4 flex flex-col gap-4">
			<div className="flex justify-between items-center">
				<h1 className="text-3xl font-bold">{restaurant.name}</h1>
				<div className="flex flex-col items-end gap-1">
					{openingHours && <p className="text-xl">{openingHours}</p>}
					{isClosingSoon && (
						<span className="bg-yellow-200 text-yellow-800 text-sm font-medium px-2.5 py-0.5 rounded animate-pulse">
							Closing soon
						</span>
					)}
				</div>
			</div>
			<div className="flex-grow space-y-4">
				{todaysMenu ? (
					todaysMenu.map((meal) => <MenuRow key={meal.title} meal={meal} />)
				) : (
					<p>No menu for today</p>
				)}
			</div>
		</div>
	)
}

export const Menu = ({
}: {
	rotationInterval?: number
}) => {
	const { menus, restaurants } = useAutoRefreshingMenus()

	if (!menus || !restaurants) {
		return <p>Loading menus...</p>
	}

	const today = new Date()
	const todayKey = `${today.getFullYear()}-${String(
		today.getMonth() + 1,
	).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

	const restaurantsWithMenu = RESTAURANT_IDS.filter(
		(id) => menus[id]?.[todayKey]?.length > 0,
	)
	const restaurantsWithoutMenu = RESTAURANT_IDS.filter(
		(id) => !menus[id]?.[todayKey]?.length,
	)

	const gridCols =
		restaurantsWithMenu.length === 1
			? 'grid-cols-[2fr_1fr]'
			: `grid-cols-${restaurantsWithMenu.length + (restaurantsWithoutMenu.length > 0 ? 1 : 0)}`

	return (
		<div className={`grid ${gridCols} gap-4`}>
			{restaurantsWithMenu.map((id) => {
				const menu = menus[id]
				const restaurant = restaurants[id]
				if (!menu || !restaurant) {
					return <p key={id}>Loading menu for restaurant {id}...</p>
				}
				return (
					<RestaurantMenu key={id} menu={menu} restaurant={restaurant} />
				)
			})}
			{restaurantsWithoutMenu.length > 0 && (
				<div className="flex flex-col gap-4">
					{restaurantsWithoutMenu.map((id) => {
						const restaurant = restaurants[id]
						if (!restaurant) {
							return (
								<p key={id}>
									Loading info for restaurant {id}...
								</p>
							)
						}
						return (
							<div
								key={id}
								className="bg-white rounded-lg shadow-md p-4"
							>
								<h1 className="text-xl font-bold">
									{restaurant.name}
								</h1>
								<p>No menu for today</p>
							</div>
						)
					})}
				</div>
			)}
		</div>
	)
}
