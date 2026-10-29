import QrLink from './QrLink'

// The guild's snack shop (namu.prodeko.org): this week's most bought products
// and the most liked open wishes. The data comes from namu2's /api/infoscreen;
// the proxy in vite.config.ts adds the key.

type NamuProduct = {
	id: number
	name: string
	imageUrl: string
	quantity: number
}

type NamuWish = {
	id: number
	title: string
	likes: number
}

export type NamuStats = {
	topProducts: NamuProduct[]
	topWishes: NamuWish[]
}

const Namukilke = ({
	stats,
}: {
	stats: NamuStats
	rotationInterval?: number
}) => (
	<div className="relative h-full flex flex-col gap-4 p-4">
		<div className="flex items-baseline justify-between">
			<h1 className="text-4xl font-bold">Namukilke</h1>
			<p className="text-lg text-stone-500">namu.prodeko.org</p>
		</div>
		<div className="grid grid-cols-2 gap-6 min-h-0">
			<section>
				<h2 className="text-3xl font-semibold mb-3">Viikon suosituimmat</h2>
				{stats.topProducts.length === 0 ? (
					<p className="text-xl text-stone-500">
						Tällä viikolla ei vielä ostoksia.
					</p>
				) : (
					<ol className="flex flex-col gap-3">
						{stats.topProducts.map((product, i) => (
							<li
								key={product.id}
								className="bg-white rounded-lg shadow-md p-3 flex items-center gap-4"
							>
								<span className="text-3xl font-bold text-stone-400 w-8">
									{i + 1}.
								</span>
								<img
									src={product.imageUrl}
									alt=""
									className="w-16 h-16 object-contain shrink-0"
								/>
								<p className="text-2xl font-bold flex-1 min-w-0 truncate">
									{product.name}
								</p>
								<p className="text-xl text-stone-600 shrink-0">
									{product.quantity} kpl
								</p>
							</li>
						))}
					</ol>
				)}
			</section>
			<section>
				<h2 className="text-3xl font-semibold mb-3">Toivotuimmat tuotteet</h2>
				{stats.topWishes.length === 0 ? (
					<p className="text-xl text-stone-500">Ei avoimia toiveita.</p>
				) : (
					<ol className="flex flex-col gap-3">
						{stats.topWishes.map((wish) => (
							<li
								key={wish.id}
								className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between gap-4"
							>
								<p className="text-2xl font-bold min-w-0 truncate">
									{wish.title}
								</p>
								<p className="text-xl text-stone-600 shrink-0">
									♥ {wish.likes}
								</p>
							</li>
						))}
					</ol>
				)}
			</section>
		</div>
		<QrLink url="https://namu.prodeko.org/wish" />
	</div>
)

export default Namukilke
