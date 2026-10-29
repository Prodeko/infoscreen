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

const PterIdeas = ({ ideas }: PterIdeasProps) => (
	<div className="relative flex flex-col gap-6 h-full p-4">
		<div className="flex items-baseline justify-between">
			<h1 className="text-4xl font-bold">PTER – suosituimmat ideat</h1>
			<p className="text-2xl text-stone-600">
				Äänestä ja ehdota: <span className="font-mono">pter.prodeko.org</span>
			</p>
		</div>
		<ol className="flex flex-col gap-4">
			{ideas.map((idea, index) => (
				<li
					key={idea.id}
					className="bg-white rounded-lg shadow-md p-5 grid grid-cols-[auto_1fr_auto] items-center gap-6"
				>
					<span className="text-4xl font-bold text-stone-400 w-12 text-right">
						{index + 1}.
					</span>
					<span className="text-3xl font-semibold">{idea.title}</span>
					<span className="text-3xl font-mono font-bold">▲ {idea.votes}</span>
				</li>
			))}
		</ol>
		<QrLink url="https://pter.prodeko.org" />
	</div>
)

PterIdeas.displayName = 'PterIdeas'

export default PterIdeas
