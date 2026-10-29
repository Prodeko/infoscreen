import { useCallback, useEffect, useState } from 'react'
import Biliskilke, { type BilisStats } from './Biliskilke'
import Coffee from './Coffee'
import Countdown, { type CountdownEntry, getNextCountdown } from './Countdown'
import { type CalendarEvent, fetchWeekEvents } from './calendarApi'
import Elections, { type VaaliElection } from './Elections'
import { getFlagDays } from './flagDays'
import Hsl from './Hsl'
import McKinseyLogo from './McKinseyLogo'
import { Menu } from './Menu'
import NowPlaying from './NowPlaying'
import PterIdeas, { type PterIdea } from './PterIdeas'
import RainMap from './RainMap'
import Rotator from './Rotator'
import SidebarDepartures from './SidebarDepartures'
import Signups, { type Signups as SignupsData } from './Signups'
import Slides from './Slides'
import Stocks, { useAutoRefreshingStocks } from './Stocks'
import Tiedote from './Tiedote'
import type {
	Menu as MenuType,
	Restaurant,
	RestaurantDailyMenu,
	Slide,
	TiedoteCategory,
	TiedoteMessageWithCategory,
} from './types'
import { useAutoRefreshingHsl } from './useAutoRefreshingHsl'
import { useNightMode } from './useNightMode'
import { fetchJson, usePolling } from './usePolling'
import Weather from './Weather'
import WeekCalendar from './WeekCalendar'

const RESTAURANT_IDS = ['7', '52', '2'] // TUAS, A Bloc, T-talo, Täffä

const loadMenus = async () => {
	const [menus, restaurantList] = await Promise.all([
		fetchJson<Record<string, MenuType>>(
			`/kanttiinitproxy/menus?restaurants=${RESTAURANT_IDS.join(',')}`,
		),
		fetchJson<Restaurant[]>('/kanttiinitproxy/restaurants'),
	])
	const restaurants: Record<string, Restaurant> = {}
	for (const restaurant of restaurantList) {
		restaurants[restaurant.id] = restaurant
	}
	return { menus, restaurants }
}

const loadTiedote = () => fetchJson<TiedoteCategory[]>('/tiedoteproxy/content/')

// A slide with an `until` date shows through the end of that day
const loadSlides = async () => {
	const slides = await fetchJson<Slide[]>('/slidesproxy/fi/infoscreen.json')
	const today = new Date().toLocaleDateString('sv-SE') // YYYY-MM-DD, local
	return slides.filter((slide) => !slide.until || slide.until >= today)
}

const loadCountdowns = () =>
	fetchJson<CountdownEntry[]>('/slidesproxy/fi/infoscreen-countdowns.json')

// The week shown is the one the fetch falls in, so on Monday the slide moves on
// to the new week at the first refresh after midnight.
const loadWeekEvents = (): Promise<CalendarEvent[]> => fetchWeekEvents()

const PTER_IDEA_COUNT = 5

const loadPterIdeas = async () =>
	(
		await fetchJson<{ ideas: PterIdea[] }>(
			`/pterproxy/api/top-ideas?limit=${PTER_IDEA_COUNT}`,
		)
	).ideas

const loadSignups = () => fetchJson<SignupsData>('/api/ilmo-signups')

// The open election, or null outside election season
const loadElection = async () => {
	const elections = await fetchJson<Array<{ id: number; state: string }>>(
		'/vaaliproxy/api/election',
	)
	const open = elections.find((election) => election.state === 'open')
	return open
		? fetchJson<VaaliElection>(`/vaaliproxy/api/election/${open.id}`)
		: null
}

// Biliskilke's leaderboards and latest games (public, like the app itself)
const loadBilisStats = () => fetchJson<BilisStats>('/bilisproxy/api/infoscreen')

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
			// The proxy in vite.config.ts adds the password
			const response = await fetch('/kiltiskameraproxy/on_air')
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

	const flagDays = getFlagDays(time)

	return (
		<div>
			<p className="text-3xl">{date}</p>
			<p className="text-4xl font-mono font-bold">{timeHoursMinutesSeconds}</p>
			{flagDays.length > 0 && (
				<p className="text-sm mt-1">
					<span className="emoji">🇫🇮</span> {flagDays.join(' · ')}
				</p>
			)}
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

// The lunch menus are only of use during the day: they leave the rotation at
// 18:00 and come back at 07:00, when night mode ends.
const MENUS_FROM_HOUR = 7
const MENUS_UNTIL_HOUR = 18

const isLunchHour = () => {
	const hour = new Date().getHours()
	return hour >= MENUS_FROM_HOUR && hour < MENUS_UNTIL_HOUR
}

const useIsLunchTime = () => {
	const [isLunchTime, setIsLunchTime] = useState(isLunchHour)

	useEffect(() => {
		const interval = setInterval(() => setIsLunchTime(isLunchHour()), 60 * 1000)
		return () => clearInterval(interval)
	}, [])

	return isLunchTime
}

const App = () => {
	const isLunchTime = useIsLunchTime()
	useNightMode()
	const menusPoll = usePolling(loadMenus, 60 * 60 * 1000)
	const tiedotePoll = usePolling(loadTiedote, 60 * 60 * 1000)
	const slidesPoll = usePolling(loadSlides, 5 * 60 * 1000)
	const countdownsPoll = usePolling(loadCountdowns, 5 * 60 * 1000)
	const weekEventsPoll = usePolling(loadWeekEvents, 60 * 60 * 1000)
	const pterPoll = usePolling(loadPterIdeas, 10 * 60 * 1000)
	const signupsPoll = usePolling(loadSignups, 5 * 60 * 1000)
	const electionPoll = usePolling(loadElection, 10 * 60 * 1000)
	const bilisPoll = usePolling(loadBilisStats, 2 * 60 * 1000)
	const { quotesById } = useAutoRefreshingStocks()
	const hslPoll = useAutoRefreshingHsl(60 * 1000)

	const { menus, restaurants } = menusPoll.data ?? {
		menus: null,
		restaurants: null,
	}
	const tiedote = tiedotePoll.data
	const slides = slidesPoll.data
	const weekEvents = weekEventsPoll.data
	const pterIdeas = pterPoll.data
	const hsl = hslPoll.data
	const signups = signupsPoll.data
	const election = electionPoll.data
	// Freshness of a source, for the stale-data note the Rotator shows
	const freshness = (poll: { updatedAt: Date | null; isStale: boolean }) => ({
		updatedAt: poll.updatedAt,
		isStale: poll.isStale,
	})

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
					{isLunchTime && (
						<Menu
							rotationInterval={30000}
							todaysMenus={todaysMenus}
							{...freshness(menusPoll)}
						/>
					)}
					{slides && slides.length > 0 && (
						<Slides
							slides={slides}
							rotationInterval={15000}
							{...freshness(slidesPoll)}
						/>
					)}
					{signups &&
						(signups.open.length > 0 || signups.upcoming.length > 0) && (
							<Signups
								signups={signups}
								rotationInterval={20000}
								{...freshness(signupsPoll)}
							/>
						)}
					{election && (
						<Elections
							election={election}
							rotationInterval={20000}
							{...freshness(electionPoll)}
						/>
					)}
					{allTiedoteMessages && allTiedoteMessages.length > 0 && (
						<Tiedote
							messages={allTiedoteMessages}
							rotationInterval={15000}
							{...freshness(tiedotePoll)}
						/>
					)}
					{getNextCountdown(countdownsPoll.data) && (
						<Countdown
							countdowns={countdownsPoll.data}
							rotationInterval={10000}
						/>
					)}
					{weekEvents && weekEvents.length > 0 && (
						<WeekCalendar
							events={weekEvents}
							rotationInterval={20000}
							{...freshness(weekEventsPoll)}
						/>
					)}
					{pterIdeas && pterIdeas.length > 0 && (
						<PterIdeas
							ideas={pterIdeas}
							rotationInterval={15000}
							{...freshness(pterPoll)}
						/>
					)}
					{bilisPoll.data && bilisPoll.data.overall.length > 0 && (
						<Biliskilke
							stats={bilisPoll.data}
							rotationInterval={20000}
							{...freshness(bilisPoll)}
						/>
					)}
					<Hsl data={hsl} rotationInterval={15000} {...freshness(hslPoll)} />
					<RainMap rotationInterval={15000} />
					{Object.keys(quotesById).length > 0 && (
						<Stocks quotesById={quotesById} rotationInterval={20000} />
					)}
					<McKinseyLogo rotationInterval={5000} />
				</Rotator>
			</div>
			<div className="bg-stone-100 h-full text-center flex flex-col gap-4 shadow-md p-4">
				<Time />
				<Weather />
				<SidebarDepartures data={hsl} />
				<Coffee />
				<NowPlaying />
				<div className="mt-auto">
					<Viewers />
				</div>
			</div>
		</main>
	)
}

export default App
