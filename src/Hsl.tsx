import {
	HSL_ALL_ALIASES,
	HSL_GROUPS,
	HSL_MAX_GROUP_DEPARTURES,
	formatHslDepartureDisplay,
	getHslDepartures,
	getHslAlerts,
	type HSLData,
	type HSLDeparture,
} from './hsl'

type HSLSlideProps = {
	data: HSLData | null
	rotationInterval?: number
}

const getGroupDepartures = (
	data: HSLData,
	aliases: readonly string[],
): HSLDeparture[] =>
	getHslDepartures(data, aliases, { limit: HSL_MAX_GROUP_DEPARTURES })

const Hsl = ({ data }: HSLSlideProps) => {
	if (!data) {
		return (
			<div className="flex items-center justify-center h-full">
				<p className="text-2xl">Loading HSL departures...</p>
			</div>
		)
	}

	const alerts = getHslAlerts(data, HSL_ALL_ALIASES, { limit: 6 })

	return (
		<div className="flex flex-col gap-4 h-full">
			<h1 className="text-4xl font-bold">HSL lähdöt</h1>
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
				{HSL_GROUPS.map((group) => {
					const departures = getGroupDepartures(data, group.aliases)

					return (
						<div
							key={group.id}
							className="bg-white rounded-lg shadow-md p-4 flex flex-col gap-3"
						>
							<h2 className="text-2xl font-semibold">{group.title}</h2>
							<div className="space-y-2">
								{departures.length > 0 ? (
									departures.map((departure) => (
										<div
											key={departure.id}
											className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-stone-100 pb-2 last:border-b-0"
										>
											<p className="font-mono font-bold text-lg bg-stone-100 rounded px-2">
												{departure.line}
											</p>
											<p className="text-lg truncate">{departure.headsign}</p>
											<p className="text-lg font-mono font-semibold">
												{formatHslDepartureDisplay(departure.departureUnix)}
											</p>
										</div>
									))
								) : (
									<p className="text-stone-500">Ei lähteviä vuoroja.</p>
								)}
							</div>
						</div>
					)
				})}
			</div>
			<div
				className={`rounded-lg shadow-md p-4 mt-auto ${
					alerts.length > 0 ? 'bg-amber-50 border border-amber-200' : 'bg-white'
				}`}
			>
				<h2 className="text-2xl font-semibold mb-2">Häiriötiedotteet</h2>
				{alerts.length > 0 ? (
					<div className="space-y-2">
						{alerts.map((alert) => (
							<div key={alert.id}>
								<p className="font-semibold text-base">{alert.header}</p>
								{alert.description && (
									<p className="text-sm text-stone-700">{alert.description}</p>
								)}
							</div>
						))}
					</div>
				) : (
					<p className="text-stone-500">Ei aktiivisia häiriötiedotteita.</p>
				)}
			</div>
		</div>
	)
}

Hsl.displayName = 'Hsl'

export default Hsl
