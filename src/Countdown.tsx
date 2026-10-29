import { useEffect, useState } from 'react'

// Countdowns in the sidebar, edited at prodeko.org/admin → Infoscreen →
// Laskurit and published as prodeko.org/fi/infoscreen-countdowns.json. The
// nearest one still ahead is shown; once its time has passed it disappears and
// the next one takes its place.
export type CountdownEntry = {
	title: string
	// RFC 3339 with offset, e.g. 2026-10-30T18:00:00+02:00
	at: string
}

const pad = (n: number) => String(n).padStart(2, '0')

const formatRemaining = (ms: number) => {
	const totalSeconds = Math.floor(ms / 1000)
	const days = Math.floor(totalSeconds / 86400)
	const hours = Math.floor((totalSeconds % 86400) / 3600)
	const minutes = Math.floor((totalSeconds % 3600) / 60)
	const seconds = totalSeconds % 60
	const clock = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
	return days > 0 ? `${days} pv ${clock}` : clock
}

const Countdown = ({ countdowns }: { countdowns: CountdownEntry[] | null }) => {
	const [now, setNow] = useState(() => new Date())

	useEffect(() => {
		const interval = setInterval(() => setNow(new Date()), 1000)
		return () => clearInterval(interval)
	}, [])

	const next = (countdowns ?? [])
		.map((countdown) => ({
			title: countdown.title,
			at: new Date(countdown.at),
		}))
		.filter((countdown) => countdown.at > now)
		.sort((a, b) => a.at.getTime() - b.at.getTime())[0]
	if (!next) {
		return null
	}

	return (
		<div className="bg-white rounded-lg shadow-md p-3">
			<p className="text-lg font-semibold">{next.title}</p>
			<p className="text-2xl font-mono font-bold">
				{formatRemaining(next.at.getTime() - now.getTime())}
			</p>
		</div>
	)
}

export default Countdown
