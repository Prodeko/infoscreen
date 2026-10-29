// The guild's elections from vaalit.prodeko.org (vaaliplatta). Its API is
// public: the election with its positions, each with its applications.

type VaaliApplication = {
	id: string
	applicant_name: string
	profile_picture: string | null
}

type VaaliPosition = {
	id: number
	name: string
	state: 'open' | 'closed' | 'draft'
	applications: VaaliApplication[] | null
}

export type VaaliElection = {
	id: number
	name: string
	state: 'open' | 'closed' | 'draft'
	positions: VaaliPosition[]
}

const LATEST_COUNT = 6

const Elections = ({
	election,
}: {
	election: VaaliElection
	rotationInterval?: number
}) => {
	const data = election

	const applications = data.positions.flatMap((position) =>
		(position.applications ?? []).map((application) => ({
			...application,
			position: position.name,
		})),
	)
	// Application ids grow over time, so the highest are the newest
	const latest = [...applications]
		.sort((a, b) => Number(b.id) - Number(a.id))
		.slice(0, LATEST_COUNT)
	const openPositions = data.positions.filter((p) => p.state === 'open').length

	return (
		<div className="h-full flex flex-col gap-4 p-4">
			<div className="flex items-baseline justify-between">
				<h1 className="text-4xl font-bold">{data.name}</h1>
				<p className="text-lg text-stone-500">vaalit.prodeko.org</p>
			</div>
			<p className="text-2xl">
				<span className="font-bold">{applications.length}</span>{' '}
				{applications.length === 1 ? 'hakemus' : 'hakemusta'} ·{' '}
				<span className="font-bold">{openPositions}</span>{' '}
				{openPositions === 1 ? 'virka' : 'virkaa'} haettavana
			</p>
			<h2 className="text-3xl font-semibold">Uusimmat hakemukset</h2>
			{latest.length === 0 ? (
				<p className="text-xl text-stone-500">
					Ei vielä hakemuksia. Ole ensimmäinen!
				</p>
			) : (
				<ul className="grid grid-cols-3 gap-4">
					{latest.map((application) => (
						<li
							key={application.id}
							className="bg-white rounded-lg shadow-md p-4 flex items-center gap-4"
						>
							{application.profile_picture && (
								<img
									src={application.profile_picture}
									alt=""
									className="w-20 h-20 rounded-full object-cover shrink-0"
								/>
							)}
							<div className="min-w-0">
								<p className="text-2xl font-bold truncate">
									{application.applicant_name}
								</p>
								<p className="text-lg text-stone-600">{application.position}</p>
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	)
}

export default Elections
