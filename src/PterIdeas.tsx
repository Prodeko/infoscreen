import QrLink from './QrLink'

export type PterIdea = {
	id: number
	title: string
	votes: number
}

type PterIdeasProps = {
	ideas: PterIdea[]
	rotationInterval?: number
}

// PTER's own palette (Prodeko brand document): Prodeko blue for headings and
// the overalls rainbow, which PTER uses for its stripe and status colours.
const BLUE = '#002e7d'
const INK = '#000a14'
const TINT = '#eef1f8' // --pd-blue-tint-04, PTER's sunken surface
const TRACK = '#d6dcea' // --pd-blue-tint-16
const RAINBOW = ['#e84028', '#f08028', '#e8d068', '#408850', '#386088']

const RainbowStripe = () => (
	<div
		className="h-3 w-full rounded-full"
		style={{
			background: `linear-gradient(90deg, ${RAINBOW.map(
				(color, i) => `${color} ${i * 20}% ${(i + 1) * 20}%`,
			).join(', ')})`,
		}}
	/>
)

const PterIdeas = ({ ideas }: PterIdeasProps) => {
	const maxVotes = Math.max(1, ...ideas.map((idea) => idea.votes))

	return (
		<div className="relative flex flex-col gap-6 h-full p-4">
			<RainbowStripe />
			<div className="flex items-baseline justify-between">
				<h1 className="text-4xl font-bold" style={{ color: BLUE }}>
					PTER – suosituimmat ideat
				</h1>
				<p className="text-2xl" style={{ color: BLUE }}>
					Äänestä ja ehdota: pter.prodeko.org
				</p>
			</div>
			<ol className="flex flex-col gap-3">
				{ideas.map((idea, index) => {
					const color = RAINBOW[index % RAINBOW.length]
					return (
						<li
							key={idea.id}
							className="rounded-lg p-4 grid grid-cols-[auto_1fr_auto] items-center gap-x-6 gap-y-2"
							style={{ backgroundColor: TINT, color: INK }}
						>
							<span
								className="row-span-2 w-14 h-14 rounded-md flex items-center justify-center text-3xl font-bold"
								style={{ backgroundColor: color }}
							>
								{index + 1}
							</span>
							<span className="text-3xl font-semibold truncate">
								{idea.title}
							</span>
							<span className="row-span-2 text-3xl font-bold tabular-nums">
								▲ {idea.votes}
							</span>
							<div
								className="h-3 rounded-full overflow-hidden"
								style={{ backgroundColor: TRACK }}
							>
								<div
									className="h-full rounded-full"
									style={{
										width: `${(idea.votes / maxVotes) * 100}%`,
										backgroundColor: color,
									}}
								/>
							</div>
						</li>
					)
				})}
			</ol>
			<QrLink url="https://pter.prodeko.org" />
		</div>
	)
}

PterIdeas.displayName = 'PterIdeas'

export default PterIdeas
