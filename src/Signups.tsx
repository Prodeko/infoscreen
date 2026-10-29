// Same shape as SignupsResponse in server/ilmoSignups.ts
export type Signup = {
	name: string
	url: string
	location: string | null
	organization: string | null
	color: string | null
	image: string | null
	eventStart: string
	signupStart: string
	signupEnd: string
	registrations: number
	places: number | null
}

export type Signups = { open: Signup[]; upcoming: Signup[] }

const MAX_PER_COLUMN = 5

const dayAndTime = (iso: string) =>
	new Date(iso).toLocaleString('fi-FI', {
		weekday: 'short',
		day: 'numeric',
		month: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	})

// Ilmo counts the waiting list in registrations, so a full event can have
// more registrations than places
const places = (signup: Signup) => {
	if (!signup.places) {
		return `${signup.registrations} ilmoittautunutta`
	}
	if (signup.registrations >= signup.places) {
		return `Täynnä, ${signup.registrations} ilmoittautunutta`
	}
	return `${signup.registrations}/${signup.places} paikkaa täytetty`
}

const SignupCard = ({ signup, detail }: { signup: Signup; detail: string }) => (
	<li
		className="bg-white rounded-lg shadow-md p-4 border-l-8"
		style={{ borderColor: signup.color ?? '#a8a29e' }}
	>
		<p className="text-2xl font-bold">{signup.name}</p>
		<p className="text-lg text-stone-600">
			{[signup.organization, dayAndTime(signup.eventStart), signup.location]
				.filter(Boolean)
				.join(' · ')}
		</p>
		<p className="text-lg font-semibold mt-1">{detail}</p>
	</li>
)

const Signups = ({
	signups,
}: {
	signups: Signups
	rotationInterval?: number
}) => {
	const data = signups

	const open = data.open.slice(0, MAX_PER_COLUMN)
	const upcoming = data.upcoming.slice(0, MAX_PER_COLUMN)

	return (
		<div className="h-full flex flex-col gap-4 p-4">
			<div className="flex items-baseline justify-between">
				<h1 className="text-4xl font-bold">Ilmoittautumiset</h1>
				<p className="text-lg text-stone-500">ilmo.prodeko.org</p>
			</div>
			<div className="grid grid-cols-2 gap-6 min-h-0">
				<section>
					<h2 className="text-3xl font-semibold mb-3 text-emerald-700">
						Ilmo auki
					</h2>
					<ul className="flex flex-col gap-3">
						{open.map((signup) => (
							<SignupCard
								key={signup.url}
								signup={signup}
								detail={`${places(signup)} · sulkeutuu ${dayAndTime(signup.signupEnd)}`}
							/>
						))}
						{open.length === 0 && (
							<p className="text-xl text-stone-500">Ei avoimia ilmoja.</p>
						)}
					</ul>
				</section>
				<section>
					<h2 className="text-3xl font-semibold mb-3 text-sky-700">
						Ilmo aukeaa
					</h2>
					<ul className="flex flex-col gap-3">
						{upcoming.map((signup) => (
							<SignupCard
								key={signup.url}
								signup={signup}
								detail={`Aukeaa ${dayAndTime(signup.signupStart)}`}
							/>
						))}
						{upcoming.length === 0 && (
							<p className="text-xl text-stone-500">Ei tulevia ilmoja.</p>
						)}
					</ul>
				</section>
			</div>
		</div>
	)
}

export default Signups
