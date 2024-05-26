import { useCallback, useEffect, useState } from 'react'
import { PiForkKnifeBold, PiHandWavingFill } from 'react-icons/pi'

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

/**
 * A scraped ilmo event.
 */
type IlmoEvent = {
	name: string
	description: string
	eventStartTime: string
	registrationStartTime: string
	headerImageFile: string
}

/**
 * Custom hook to fetch ilmo events from a JSON file and refresh them every `refreshIntervalMS` milliseconds.
 * @param refreshIntervalMS The interval in milliseconds to refresh the ilmo events.
 * @returns An object containing the open and upcoming ilmo events.
 */
const useAutoRefreshingIlmoEvents = (refreshIntervalMS: number = 60 * 1000) => {
	const [openIlmos, setOpenIlmos] = useState<IlmoEvent[]>([])
	const [upcomingIlmos, setUpcomingIlmos] = useState<IlmoEvent[]>([])

	/**
	 * Fetch the ilmo events from the JSON file and set them to the state.
	 */
	const setIlmoEvents = useCallback(async () => {
		try {
			const response = await fetch('/events.json')
			const data = await response.json()
			const { open, upcoming } = data
			if (open) setOpenIlmos(open)
			if (upcoming) setUpcomingIlmos(upcoming)
		} catch (error) {
			console.error(
				'Failed to get ilmo events. Maybe you forgot to set up the scraper?',
				error,
			)
		}
	}, [])

	// Refresh the ilmo events every `refreshIntervalMS` milliseconds.
	useEffect(() => {
		const interval = setInterval(setIlmoEvents, refreshIntervalMS)
		return () => clearInterval(interval)
	}, [refreshIntervalMS, setIlmoEvents])

	// Fetch the ilmo events on mount.
	useEffect(() => {
		setIlmoEvents()
	}, [setIlmoEvents])

	return { openIlmos, upcomingIlmos }
}

type MenuDetails = {
	restaurantName: string
	items: string[]
}

const useAutoRefreshingMenus = (refreshIntervalMS: number = 60 * 1000) => {
	const [menus, setMenus] = useState<MenuDetails[]>([])

	/**
	 * Fetch the menus from Kanttiinit API and set them to the state.
	 */
	const fetchMenus = useCallback(async () => {
		const restaurants = [
			{
				name: 'A Bloc',
				id: '52',
			},
			{
				name: 'TUAS',
				id: '7',
			},
		]
		try {
			const responses = await Promise.all(
				restaurants.map(async (restaurant) => {
					const response = await fetch(
						`/kanttiinitproxy/menus?restaurants=${restaurant.id}`,
					)
					const data = await response.json()
					const items: { title: string; properties: string[] }[] =
						data[restaurant.id][Object.keys(data[restaurant.id])[0]] || []

					return {
						restaurantName: restaurant.name,
						items: items.map((item) => item.title),
					}
				}),
			)
			setMenus(responses)
		} catch (error) {
			console.error(
				'Failed to fetch restaurant menus. Maybe the API is down?',
				error,
			)
		}
	}, [])

	// Refresh the ilmo events every `refreshIntervalMS` milliseconds.
	useEffect(() => {
		const interval = setInterval(fetchMenus, refreshIntervalMS)
		return () => clearInterval(interval)
	}, [refreshIntervalMS, fetchMenus])

	// Fetch the menus on mount.
	useEffect(() => {
		fetchMenus()
	}, [fetchMenus])

	return { menus }
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
			<p className="text-2xl">{date}</p>
			<p className="text-3xl font-mono font-bold">{timeHoursMinutesSeconds}</p>
		</div>
	)
}

const Viewers = () => {
	// TODO: Create custom hook for fetching viewers
	const [viewers, setViewers] = useState<string[]>(['Jaska', 'Kalle', 'Matti'])
	// const [viewers, setViewers] = useState<string[]>([])

	return (
		<div className="flex items-center justify-center p-4 rounded-lg shadow-inner relative">
			<div
				className={`absolute inset-0 rounded-lg ${
					viewers.length > 0 ? 'bg-red-200 animate-pulse' : 'bg-green-100'
				}`}
			/>
			<div className="relative z-10">
				{viewers.length > 0 ? (
					<div className="flex flex-col gap-2">
						<p className="text-2xl font-bold text-red-700">ON AIR</p>
						<p className="text-xl font-semibold">Camera viewers</p>
						<ul className="text-lg">
							{viewers.map((viewer) => (
								<li key={viewer}>{viewer}</li>
							))}
						</ul>
					</div>
				) : (
					<p className="text-xl font-light">No camera viewers</p>
				)}
			</div>
		</div>
	)
}

/**
 * A card component for displaying an ilmo event.
 */
const IlmoEventCard = ({ ilmo }: { ilmo: IlmoEvent }) => {
	const formatToLocaleDateTime = (dateString: string) =>
		new Date(dateString).toLocaleString('fi-FI', {
			minute: '2-digit',
			hour: '2-digit',
			day: '2-digit',
			month: '2-digit',
		})

	return (
		<div className="grid grid-cols-[3fr_5fr] rounded-lg overflow-hidden gap-4 border-stone-200 border-2 items-center">
			<img
				src={
					ilmo.headerImageFile ??
					'https://static.prodeko.org/media/ilmo/default-header-image.jpg'
				}
				alt={ilmo.name}
			/>
			<div className="my-2">
				<h3 className="font-bold text-2xl mb-1">{ilmo.name}</h3>
				<div className="text-lg">
					<label className="font-semibold">Signup opens: </label>
					<span>{formatToLocaleDateTime(ilmo.registrationStartTime)}</span>
				</div>
				<div className="text-lg">
					<label className="font-semibold">Event starts: </label>
					<span>{formatToLocaleDateTime(ilmo.eventStartTime)}</span>
				</div>
			</div>
		</div>
	)
}

const Ilmos = () => {
	const { openIlmos, upcomingIlmos } = useAutoRefreshingIlmoEvents(60 * 1000)

	return (
		<div className="flex flex-col gap-4 p-4">
			<div className="flex items-center gap-6">
				<div className="bg-stone-200 rounded-2xl p-4 text-5xl items-center flex shadow-md">
					<PiHandWavingFill />
				</div>
				<h1 className="text-4xl font-bold">Ilmos</h1>
			</div>
			<div>
				<h2 className="text-3xl font-semibold mb-4">Currently open</h2>
				<div className="grid grid-cols-1 gap-4">
					{openIlmos.length > 0 ? (
						openIlmos.map((ilmo) => (
							<IlmoEventCard key={ilmo.name} ilmo={ilmo} />
						))
					) : (
						<p className="text-center text-2xl font-light">
							No open ilmos right now! :(
						</p>
					)}
				</div>
			</div>
			<div>
				<h2 className="text-3xl font-semibold mb-4">Upcoming</h2>
				<div className="grid grid-cols-1 gap-4">
					{openIlmos.length > 0 ? (
						upcomingIlmos.map((ilmo) => (
							<IlmoEventCard key={ilmo.name} ilmo={ilmo} />
						))
					) : (
						<p className="text-center text-2xl font-light">
							No upcoming ilmos in sight! :(
						</p>
					)}
				</div>
			</div>
		</div>
	)
}

const MenuCard = ({ menu }: { menu: MenuDetails }) => {
	return (
		<div className="border-stone-200 border-2 rounded-lg p-4">
			<h2 className="text-4xl font-bold mb-2">{menu.restaurantName}</h2>
			<ul className="text-lg">
				{menu.items.length > 0 ? (
					<ul>
						{menu.items.map((item) => (
							<li className="text-3xl" key={item}>
								{item}
							</li>
						))}
					</ul>
				) : (
					<li className="text-3xl">No menu available for today :(</li>
				)}
			</ul>
		</div>
	)
}

const Menus = () => {
	const { menus } = useAutoRefreshingMenus()

	return (
		<div className="flex flex-col gap-6 p-4">
			<div className="flex items-center gap-6">
				<div className="bg-stone-200 rounded-2xl p-4 text-5xl items-center flex shadow-md">
					<PiForkKnifeBold />
				</div>
				<h1 className="text-4xl font-bold">Today's menus</h1>
			</div>
			<div className="flex flex-col gap-4">
				{menus.map((menu) => (
					<MenuCard key={menu.restaurantName} menu={menu} />
				))}
			</div>
		</div>
	)
}

const App = () => {
	return (
		<main className="grid grid-rows-1 grid-cols-[8fr_1fr] h-screen">
			<div className="h-full p-4 flex">
				<div className="w-1/2 h-full border-r-2 border-stone-200">
					<Menus />
				</div>
				<div className="w-1/2">
					<Ilmos />
				</div>
			</div>
			<div className="bg-stone-100 h-full text-center flex flex-col justify-between shadow-md p-4">
				<Time />
				<Viewers />
				<div>
					<p className="mb-4">Sponsored by</p>
					<img src="/McKinsey_logo.svg" alt="McKinsey sponsor logo" />
				</div>
			</div>
		</main>
	)
}

export default App
