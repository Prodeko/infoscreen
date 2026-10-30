import { useEffect, useState } from 'react'
import type { Meal, RestaurantDailyMenu } from './types'

const MenuRow = ({ meal }: { meal: Meal }) => {
	return (
		<div>
			<p className="text-lg font-semibold leading-snug line-clamp-2">
				{meal.title}
			</p>
			{meal.properties.length > 0 && (
				<p className="text-xs text-stone-500">{meal.properties.join(', ')}</p>
			)}
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

			if (Number.isNaN(hours) || Number.isNaN(minutes)) return

			const now = new Date()
			const closingTime = new Date()
			closingTime.setHours(hours, minutes, 0, 0)

			const diffInMinutes =
				(closingTime.getTime() - now.getTime()) / (1000 * 60)

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
	menu: Meal[] | null
	restaurant: RestaurantDailyMenu
}) => {
	const isClosingSoon = useClosingSoon(restaurant.openingHours)

	return (
		<div className="bg-white rounded-lg shadow-md p-4 flex flex-col gap-3 min-h-0 overflow-hidden">
			{/* Hours under the name: "Tietotekniikantalo" leaves no room beside it */}
			<div className="flex justify-between items-end gap-2">
				<div className="min-w-0">
					<h1 className="text-3xl font-bold truncate">{restaurant.name}</h1>
					{restaurant.openingHours && (
						<p className="text-lg text-stone-600">{restaurant.openingHours}</p>
					)}
				</div>
				<div className="flex flex-col items-end gap-1 shrink-0">
					{isClosingSoon && (
						<span className="bg-yellow-200 text-yellow-800 text-sm font-medium px-2.5 py-0.5 rounded animate-pulse">
							Closing soon
						</span>
					)}
				</div>
			</div>
			<div className="flex-grow min-h-0 space-y-2.5">
				{menu ? (
					menu.map((meal) => <MenuRow key={meal.title} meal={meal} />)
				) : (
					<p>No menu for today</p>
				)}
			</div>
		</div>
	)
}

export const Menu = ({
	todaysMenus,
}: {
	rotationInterval?: number
	todaysMenus: RestaurantDailyMenu[] | null
}) => {
	if (!todaysMenus) {
		return <p>Loading menus...</p>
	}

	const restaurantsWithMenu = todaysMenus.filter((r) => r.menu)
	const restaurantsWithoutMenu = todaysMenus.filter((r) => !r.menu)

	const gridCols =
		restaurantsWithMenu.length === 1
			? 'grid-cols-[2fr_1fr]'
			: `grid-cols-${restaurantsWithMenu.length + (restaurantsWithoutMenu.length > 0 ? 1 : 0)}`

	return (
		<div className={`grid ${gridCols} gap-4 h-full min-h-0`}>
			{restaurantsWithMenu.map((restaurant) => (
				<RestaurantMenu
					key={restaurant.id}
					restaurant={restaurant}
					menu={restaurant.menu}
				/>
			))}
			{restaurantsWithoutMenu.length > 0 && (
				<div className="flex flex-col gap-4">
					{restaurantsWithoutMenu.map((restaurant) => (
						<div
							key={restaurant.id}
							className="bg-white rounded-lg shadow-md p-4"
						>
							<h1 className="text-2xl font-bold">{restaurant.name}</h1>
							<p>No menu for today</p>
						</div>
					))}
				</div>
			)}
		</div>
	)
}
