import StaleNote from './StaleNote'
import { fetchJson, usePolling } from './usePolling'

// The guild room's two coffee pots, from kahvikilke (kahvi.prodeko.org,
// github.com/Prodeko/kahvikilke). Its /api/status is public: a smart plug on
// the coffee maker tells when a brew starts and ends, and how much was made.

type PotStatus = {
	status:
		| 'idle'
		| 'brewing'
		| 'fresh'
		| 'good'
		| 'stale'
		| 'old'
		| 'cold'
		| 'warming'
	message: string
	minutes_old?: number
	volume_ml?: number
}

type KahvikilkeStatus = {
	coffee_status: { pot_a: PotStatus; pot_b: PotStatus }
}

const LABELS: Record<PotStatus['status'], { text: string; dot: string }> = {
	brewing: { text: 'Keittyy', dot: 'bg-blue-500' },
	fresh: { text: 'Tuoretta', dot: 'bg-emerald-500' },
	good: { text: 'Hyvää', dot: 'bg-emerald-500' },
	stale: { text: 'Vanhenee', dot: 'bg-amber-500' },
	old: { text: 'Vanhaa', dot: 'bg-red-500' },
	cold: { text: 'Kylmää', dot: 'bg-red-500' },
	warming: { text: 'Levy lämpenee', dot: 'bg-stone-400' },
	idle: { text: 'Ei kahvia', dot: 'bg-stone-300' },
}

const loadStatus = () => fetchJson<KahvikilkeStatus>('/kahviproxy/api/status')

const formatLitres = (ml: number) =>
	`${(ml / 1000).toLocaleString('fi-FI', { maximumFractionDigits: 1 })} l`

const Pot = ({ name, pot }: { name: string; pot: PotStatus }) => {
	const label = LABELS[pot.status] ?? { text: pot.message, dot: 'bg-stone-300' }
	const details = [
		pot.volume_ml != null ? formatLitres(pot.volume_ml) : null,
		pot.minutes_old != null ? `${pot.minutes_old} min` : null,
	].filter(Boolean)

	return (
		<li className="flex items-center gap-2">
			<span className={`w-2.5 h-2.5 rounded-full shrink-0 ${label.dot}`} />
			<span className="font-semibold">{name}</span>
			<span className="truncate">{label.text}</span>
			{details.length > 0 && (
				<span className="ml-auto font-mono text-sm text-stone-500 whitespace-nowrap">
					{details.join(' · ')}
				</span>
			)}
		</li>
	)
}

const Coffee = () => {
	const { data, updatedAt, isStale } = usePolling(loadStatus, 30 * 1000)

	if (!data) {
		return null
	}

	return (
		<div className="bg-white rounded-lg shadow-md p-3 text-left">
			<h2 className="text-2xl font-semibold mb-2">Kahvi</h2>
			<ul className="flex flex-col gap-1">
				<Pot name="A" pot={data.coffee_status.pot_a} />
				<Pot name="B" pot={data.coffee_status.pot_b} />
			</ul>
			<StaleNote updatedAt={updatedAt} isStale={isStale} className="mt-1" />
		</div>
	)
}

export default Coffee
