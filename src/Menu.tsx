import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { Meal, RestaurantDailyMenu } from './types'

// Restaurants prefix dishes with their line ("Kasvislounas : Tummaa riisiä",
// "Pizzat: BBQ pekonipizza"). Consecutive dishes of one line are grouped under
// it once, which saves a line per dish on long menus.
type MealGroup = { category: string; meals: { name: string; meal: Meal }[] }

const groupMeals = (meals: Meal[]): MealGroup[] => {
	const groups: MealGroup[] = []
	for (const meal of meals) {
		// Titles sometimes carry line breaks ("Erikoisannos: Valkosipulia\n")
		const title = meal.title.replace(/\s+/g, ' ').trim()
		const match = title.match(/^([^:]{2,40}?)\s*:\s*(.+)$/)
		const category = match ? match[1].trim() : ''
		const name = match ? match[2].trim() : title
		const last = groups[groups.length - 1]
		if (last && last.category === category) {
			last.meals.push({ name, meal })
		} else {
			groups.push({ category, meals: [{ name, meal }] })
		}
	}
	return groups
}

const MealRow = ({ name, meal }: { name: string; meal: Meal }) => (
	<div>
		<p className="font-semibold leading-snug">{name}</p>
		{meal.properties.length > 0 && (
			<p className="text-[0.65em] text-stone-500">
				{meal.properties.join(', ')}
			</p>
		)}
	</div>
)

// Shrinks the menu's text until it fits its column, so a long menu (A Bloc
// often has ten dishes) never runs off the screen, whatever the screen's size.
// Font size is in em below this element, so one value scales everything.
const MAX_SCALE = 1.125 // text-lg
const MIN_SCALE = 0.7

const useFitText = (content: unknown) => {
	const ref = useRef<HTMLDivElement>(null)
	const [scale, setScale] = useState(MAX_SCALE)

	// biome-ignore lint/correctness/useExhaustiveDependencies: refit when the menu changes
	useLayoutEffect(() => {
		const el = ref.current
		if (!el) return
		const fit = () => {
			let next = MAX_SCALE
			el.style.fontSize = `${next}rem`
			while (el.scrollHeight > el.clientHeight + 1 && next > MIN_SCALE) {
				next = Math.max(MIN_SCALE, next - 0.05)
				el.style.fontSize = `${next}rem`
			}
			setScale(next)
		}
		fit()
		const observer = new ResizeObserver(fit)
		observer.observe(el)
		return () => observer.disconnect()
	}, [content])

	return { ref, scale }
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
	const fit = useFitText(menu)

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
			<div
				ref={fit.ref}
				className="flex-grow min-h-0 overflow-hidden flex flex-col gap-[0.6em]"
				style={{ fontSize: `${fit.scale}rem` }}
			>
				{menu ? (
					groupMeals(menu).map((group) => (
						<div
							key={`${group.category}|${group.meals[0].meal.title}`}
							className="flex flex-col gap-[0.35em]"
						>
							{group.category && (
								<p className="text-[0.75em] font-semibold text-stone-500">
									{group.category}
								</p>
							)}
							{group.meals.map(({ name, meal }) => (
								<MealRow key={meal.title} name={name} meal={meal} />
							))}
						</div>
					))
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
