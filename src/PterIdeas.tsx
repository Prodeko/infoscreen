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
// the overalls rainbow for the rank numbers. The brand yellow is too pale to
// read as text on a light surface, so rank 3 uses a deeper yellow.
const BLUE = '#002e7d'
const INK = '#000a14'
const TINT = '#eef1f8' // --pd-blue-tint-04, PTER's sunken surface
const RANK_TEXT = ['#e84028', '#f08028', '#c9a227', '#408850', '#386088']

const PterIdeas = ({ ideas }: PterIdeasProps) => {
	return (
		<div className="relative flex flex-col gap-6 h-full p-4">
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
					return (
						<li
							key={idea.id}
							className="rounded-lg p-4 grid grid-cols-[auto_1fr_auto] items-center gap-x-6"
							style={{ backgroundColor: TINT, color: INK }}
						>
							<span
								className="w-12 text-5xl font-bold tabular-nums text-center"
								style={{ color: RANK_TEXT[index % RANK_TEXT.length] }}
							>
								{index + 1}
							</span>
							<span className="text-3xl font-semibold truncate">
								{idea.title}
							</span>
							<span className="w-28 text-right text-3xl font-bold tabular-nums">
								▲ {idea.votes}
							</span>
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
