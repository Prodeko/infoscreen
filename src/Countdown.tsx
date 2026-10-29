import { useEffect, useState } from 'react'

// A slide counting down to the next big event. Countdowns are edited at
// prodeko.org/admin → Infoscreen → Laskurit and published as
// prodeko.org/fi/infoscreen-countdowns.json. The nearest one still ahead is
// shown; once its time has passed the next one takes its place, and with none
// ahead the slide leaves the rotation.
export type CountdownEntry = {
	title: string
	// RFC 3339 with offset, e.g. 2026-10-30T18:00:00+02:00
	at: string
}

/** The nearest countdown still ahead of `now`, or null. */
export const getNextCountdown = (
	countdowns: CountdownEntry[] | null,
	now: Date = new Date(),
) =>
	(countdowns ?? [])
		.map((countdown) => ({
			title: countdown.title,
			at: new Date(countdown.at),
		}))
		.filter((countdown) => countdown.at > now)
		.sort((a, b) => a.at.getTime() - b.at.getTime())[0] ?? null

const pad = (n: number) => String(n).padStart(2, '0')

/** "Perjantaina 30.10. klo 18.00" */
const formatWhen = (at: Date) => {
	const day = at.toLocaleDateString('fi-FI', {
		weekday: 'long',
		day: 'numeric',
		month: 'numeric',
	})
	const time = at.toLocaleTimeString('fi-FI', {
		hour: '2-digit',
		minute: '2-digit',
	})
	const text = `${day} klo ${time}`
	return text.charAt(0).toUpperCase() + text.slice(1)
}

const Unit = ({ value, label }: { value: number; label: [string, string] }) => (
	<div className="flex flex-col items-center">
		<span className="text-[10rem] leading-none font-mono font-bold">
			{label[0] === 'päivä' ? value : pad(value)}
		</span>
		<span className="text-3xl text-stone-500 mt-2">
			{value === 1 ? label[0] : label[1]}
		</span>
	</div>
)

const Countdown = ({
	countdowns,
}: {
	countdowns: CountdownEntry[] | null
	rotationInterval?: number
}) => {
	const [now, setNow] = useState(() => new Date())

	useEffect(() => {
		const interval = setInterval(() => setNow(new Date()), 1000)
		return () => clearInterval(interval)
	}, [])

	const next = getNextCountdown(countdowns, now)
	if (!next) {
		return null
	}

	const totalSeconds = Math.floor((next.at.getTime() - now.getTime()) / 1000)
	const days = Math.floor(totalSeconds / 86400)
	const hours = Math.floor((totalSeconds % 86400) / 3600)
	const minutes = Math.floor((totalSeconds % 3600) / 60)
	const seconds = totalSeconds % 60

	return (
		<div className="h-full flex flex-col items-center justify-center gap-12">
			<div className="text-center">
				<p className="text-4xl text-stone-500">Aikaa jäljellä</p>
				<h1 className="text-7xl font-bold mt-2">{next.title}</h1>
				<p className="text-3xl text-stone-600 mt-4">{formatWhen(next.at)}</p>
			</div>
			<div className="flex gap-16">
				{days > 0 && <Unit value={days} label={['päivä', 'päivää']} />}
				<Unit value={hours} label={['tunti', 'tuntia']} />
				<Unit value={minutes} label={['minuutti', 'minuuttia']} />
				<Unit value={seconds} label={['sekunti', 'sekuntia']} />
			</div>
		</div>
	)
}

Countdown.displayName = 'Countdown'

export default Countdown
