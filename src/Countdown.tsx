import { useEffect, useState } from 'react'

// Countdowns in the sidebar. The nearest one still ahead is shown; once its
// time has passed it disappears and the next one takes its place. Add an
// entry here for the next big event.
const COUNTDOWNS = [
	{ title: 'Halloweensitsit', at: new Date('2026-10-30T18:00:00+02:00') },
]

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

const Countdown = () => {
	const [now, setNow] = useState(() => new Date())

	useEffect(() => {
		const interval = setInterval(() => setNow(new Date()), 1000)
		return () => clearInterval(interval)
	}, [])

	const next = COUNTDOWNS.filter((countdown) => countdown.at > now).sort(
		(a, b) => a.at.getTime() - b.at.getTime(),
	)[0]
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
