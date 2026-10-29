// The guild's billiards ranking from Biliskilke (bilis2.prodeko.org): this
// season's and the all-time top 10, and the latest games. Ranks are drawn as
// pool balls in their standard colours.

type RankedPlayer = {
	id: number
	name: string
	emoji: string
	elo: number
}

type BilisGame = {
	id: number
	winner: string
	loser: string
	underTable: boolean
	eloChange: number
	playedAt: string
}

export type BilisStats = {
	season: { name: string | null; start: string; end: string } | null
	overall: RankedPlayer[]
	seasonal: RankedPlayer[]
	recentGames: BilisGame[]
}

// Standard pool ball colours; 9 and 10 are the striped versions of 1 and 2
const BALLS = [
	{ color: '#F2C200', stripe: false },
	{ color: '#1F4FB4', stripe: false },
	{ color: '#D2232A', stripe: false },
	{ color: '#5B2A86', stripe: false },
	{ color: '#F36F21', stripe: false },
	{ color: '#00804A', stripe: false },
	{ color: '#7A1F2B', stripe: false },
	{ color: '#141414', stripe: false },
	{ color: '#F2C200', stripe: true },
	{ color: '#1F4FB4', stripe: true },
]

const RECENT_GAMES = 4

const Ball = ({ rank }: { rank: number }) => {
	const ball = BALLS[rank - 1]
	return (
		<span
			className="relative w-10 h-10 shrink-0 rounded-full flex items-center justify-center"
			style={{
				background: ball.stripe
					? `linear-gradient(white 22%, ${ball.color} 22% 78%, white 78%)`
					: ball.color,
				boxShadow: ball.stripe ? 'inset 0 0 0 2px #E3E7ED' : undefined,
			}}
		>
			<span className="w-6 h-6 rounded-full bg-white text-[#002851] text-sm font-bold flex items-center justify-center tabular-nums">
				{rank}
			</span>
		</span>
	)
}

const Ranking = ({
	title,
	subtitle,
	players,
	empty,
}: {
	title: string
	subtitle?: string
	players: RankedPlayer[]
	empty: string
}) => (
	<section className="min-w-0">
		<div className="flex items-baseline gap-4 mb-3">
			<h2 className="text-4xl font-bold">{title}</h2>
			{subtitle && <p className="text-2xl text-[#5A6475]">{subtitle}</p>}
		</div>
		{players.length === 0 ? (
			<p className="text-2xl text-[#5A6475]">{empty}</p>
		) : (
			<ol className="flex flex-col gap-1.5">
				{players.map((player, i) => (
					<li key={player.id} className="flex items-center gap-4">
						<Ball rank={i + 1} />
						<span className="emoji text-[1.75rem] w-10 shrink-0">
							{player.emoji}
						</span>
						<span className="text-[1.75rem] font-semibold truncate flex-1">
							{player.name}
						</span>
						<span className="text-[1.75rem] font-bold tabular-nums">
							{player.elo}
						</span>
					</li>
				))}
			</ol>
		)}
	</section>
)

// "29.10.", in Helsinki time: seasons start and end at midnight Helsinki
const dayMonth = (iso: string) =>
	new Date(iso).toLocaleDateString('fi-FI', {
		timeZone: 'Europe/Helsinki',
		day: 'numeric',
		month: 'numeric',
	})

// "5 min sitten", "3 h sitten", "eilen", "12.3."
const ago = (iso: string) => {
	const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000)
	if (minutes < 1) return 'juuri nyt'
	if (minutes < 60) return `${minutes} min sitten`
	if (minutes < 24 * 60) return `${Math.round(minutes / 60)} h sitten`
	if (minutes < 48 * 60) return 'eilen'
	return dayMonth(iso)
}

const Biliskilke = ({
	stats,
}: {
	stats: BilisStats
	rotationInterval?: number
}) => {
	const { season } = stats
	const seasonDates = season
		? `${dayMonth(season.start)}–${dayMonth(season.end)}`
		: undefined

	return (
		<div className="h-full flex flex-col p-6 text-[#002851]">
			<div
				className={`grid gap-16 ${season ? 'grid-cols-2' : 'grid-cols-1 max-w-4xl'}`}
			>
				{season && (
					<Ranking
						title={season.name || 'Tämä kausi'}
						subtitle={seasonDates}
						players={stats.seasonal}
						empty="Kauden ensimmäinen peli on vielä pelaamatta."
					/>
				)}
				<Ranking
					title="Kaikkien aikojen"
					players={stats.overall}
					empty="Ei vielä pelejä."
				/>
			</div>

			{stats.recentGames.length > 0 && (
				<section className="mt-auto pt-4 border-t-2 border-[#E3E7ED]">
					<h2 className="text-3xl font-bold mb-2">Viimeisimmät pelit</h2>
					<ul className="flex flex-col gap-1">
						{stats.recentGames.slice(0, RECENT_GAMES).map((game) => (
							<li key={game.id} className="flex items-baseline gap-3 text-2xl">
								<span className="w-44 shrink-0 text-[#5A6475]">
									{ago(game.playedAt)}
								</span>
								<span className="font-semibold [word-spacing:0.2em]">
									{game.winner}
								</span>
								<span className="text-[#5A6475]">
									{game.underTable ? 'laittoi pöydän alle' : 'voitti'}
								</span>
								<span className="font-semibold [word-spacing:0.2em]">
									{game.loser}
								</span>
								<span className="ml-auto font-bold tabular-nums text-[#00804A]">
									+{game.eloChange}
								</span>
							</li>
						))}
					</ul>
				</section>
			)}
		</div>
	)
}

export default Biliskilke
