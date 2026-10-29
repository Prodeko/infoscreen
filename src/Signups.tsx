import { useState } from 'react'
import QrLink from './QrLink'

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

const MAX_OPEN = 3
const MAX_UPCOMING = 3
const FALLBACK_COLOR = '#002851' // Prodeko navy

const clock = (date: Date) =>
	date.toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' })

// "ma 3.5."
const day = (iso: string) => {
	const date = new Date(iso)
	const weekday = date.toLocaleDateString('fi-FI', { weekday: 'short' })
	return `${weekday} ${date.getDate()}.${date.getMonth() + 1}.`
}

// "tänään 12.00", "huomenna 12.00", "pe 30.10. 12.00"
const when = (iso: string) => {
	const date = new Date(iso)
	const midnight = (d: Date) => new Date(d).setHours(0, 0, 0, 0)
	const days = Math.round((midnight(date) - midnight(new Date())) / 86_400_000)
	if (days === 0) return `tänään ${clock(date)}`
	if (days === 1) return `huomenna ${clock(date)}`
	return `${day(iso)} ${clock(date)}`
}

// Ilmo counts the waiting list in registrations, so a full event can have
// more registrations than places
const Capacity = ({ signup }: { signup: Signup }) => {
	const color = signup.color ?? FALLBACK_COLOR
	const { registrations, places } = signup

	if (!places) {
		return (
			<p className="text-4xl font-bold tabular-nums">
				{registrations}{' '}
				<span className="text-xl font-normal text-[#5A6475]">
					ilmoittautunutta
				</span>
			</p>
		)
	}

	const full = registrations >= places
	const fill = Math.min(1, registrations / places)

	return (
		<div>
			<div className="h-4 rounded-full bg-[#E3E7ED] overflow-hidden">
				<div
					className="h-full rounded-full"
					style={{ width: `${fill * 100}%`, backgroundColor: color }}
				/>
			</div>
			<p className="mt-2 text-4xl font-bold tabular-nums">
				{full ? (
					<>
						Täynnä{' '}
						{registrations > places && (
							<span className="text-xl font-normal text-[#5A6475]">
								{registrations - places} jonossa
							</span>
						)}
					</>
				) : (
					<>
						{registrations}
						<span className="text-xl font-normal text-[#5A6475]">
							{' '}
							/ {places} paikkaa
						</span>
					</>
				)}
			</p>
		</div>
	)
}

// Ilmo banners are 3:1. Some fail to load (the static server sends a few
// with the wrong content type), so fall back to the organizer's color.
const Banner = ({ signup }: { signup: Signup }) => {
	const [failed, setFailed] = useState(false)

	if (signup.image && !failed) {
		return (
			<img
				src={signup.image}
				alt=""
				onError={() => setFailed(true)}
				className="w-full object-cover rounded-md"
				style={{ aspectRatio: '3 / 1' }}
			/>
		)
	}

	return (
		<div
			className="w-full rounded-md flex items-end p-4"
			style={{
				aspectRatio: '3 / 1',
				backgroundColor: signup.color ?? FALLBACK_COLOR,
			}}
		>
			<span className="text-3xl font-bold text-white">
				{signup.organization}
			</span>
		</div>
	)
}

const OpenEvent = ({ signup }: { signup: Signup }) => (
	<li className="flex flex-col gap-3 min-w-0">
		<Banner signup={signup} />
		<div>
			<h3 className="text-2xl font-bold leading-tight line-clamp-2 min-h-[2lh]">
				{signup.name}
			</h3>
			<p className="mt-1 text-xl text-[#5A6475]">
				{[signup.organization, day(signup.eventStart)]
					.filter(Boolean)
					.join(', ')}
			</p>
		</div>
		<Capacity signup={signup} />
		<p className="text-xl text-[#5A6475]">Sulkeutuu {when(signup.signupEnd)}</p>
	</li>
)

const Signups = ({
	signups,
}: {
	signups: Signups
	rotationInterval?: number
}) => {
	const open = signups.open.slice(0, MAX_OPEN)
	const moreOpen = signups.open.length - open.length
	const upcoming = signups.upcoming.slice(0, MAX_UPCOMING)

	return (
		<div className="relative h-full flex flex-col p-6 text-[#002851]">
			{open.length > 0 && (
				<section>
					<h2 className="text-4xl font-bold mb-5">Ilmoittaudu nyt</h2>
					<ul className="grid grid-cols-3 gap-10">
						{open.map((signup) => (
							<OpenEvent key={signup.url} signup={signup} />
						))}
					</ul>
					{moreOpen > 0 && (
						<p className="mt-4 text-xl text-[#5A6475]">
							Ja {moreOpen} muuta osoitteessa ilmo.prodeko.org
						</p>
					)}
				</section>
			)}

			{upcoming.length > 0 && (
				<section className="mt-auto pt-6 pr-48 border-t-2 border-[#E3E7ED]">
					<h2 className="text-3xl font-bold mb-3">Aukeaa pian</h2>
					<ul className="flex flex-col gap-2">
						{upcoming.map((signup) => (
							<li key={signup.url} className="flex items-baseline gap-6">
								<span className="w-72 shrink-0 text-3xl font-bold tabular-nums">
									{when(signup.signupStart)}
								</span>
								{/* The organizer as a dot in its Ilmo colour, like the bars
								    above; the text would repeat when one team has several */}
								<span
									className="w-3 h-3 shrink-0 self-center rounded-full"
									style={{ backgroundColor: signup.color ?? FALLBACK_COLOR }}
								/>
								<span className="text-2xl font-semibold truncate">
									{signup.name}
								</span>
								<span className="text-xl text-[#5A6475] shrink-0">
									{day(signup.eventStart)}
								</span>
							</li>
						))}
					</ul>
				</section>
			)}

			<QrLink url="https://ilmo.prodeko.org" />
		</div>
	)
}

export default Signups
