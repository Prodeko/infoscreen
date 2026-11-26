import QrLink from './QrLink'
import type { TelegramPostData } from './TelegramPost'

// Today's door of Sindi's advent calendar: the newest post on
// t.me/sindinjoulukalenteri, from /api/telegram-latest (server/telegram.ts).
// The posts are short vertical videos with a one-line caption ("19. päivä"),
// so the video gets the room and plays muted on a loop.

export const JOULUKALENTERI_CHANNEL = 'sindinjoulukalenteri'

const RED = '#b3132b'

const formatDate = (iso: string) =>
	new Date(iso).toLocaleDateString('fi-FI', {
		weekday: 'long',
		day: 'numeric',
		month: 'numeric',
	})

const Joulukalenteri = ({
	post,
}: {
	post: TelegramPostData
	rotationInterval?: number
}) => (
	<div className="relative flex gap-12 h-full p-4">
		<div className="h-full flex items-center justify-center shrink-0 max-w-[55%]">
			{post.video ? (
				<video
					// A new token in the URL reloads the video, a new post remounts it
					src={post.video}
					poster={post.poster ?? undefined}
					autoPlay
					muted
					loop
					playsInline
					className="max-h-full max-w-full rounded-2xl shadow-lg bg-black"
				/>
			) : (
				post.image && (
					<img
						src={post.image}
						alt=""
						className="max-h-full max-w-full rounded-2xl shadow-lg"
					/>
				)
			)}
		</div>
		<div className="flex flex-col gap-6 min-w-0 flex-1 pt-8 pr-40">
			<h1 className="text-5xl font-bold" style={{ color: RED }}>
				🎄 Sindin joulukalenteri
			</h1>
			<p className="text-3xl text-stone-500 first-letter:uppercase">
				{formatDate(post.date)}
			</p>
			{post.text && (
				<p
					className={`${
						// Most captions are a few words; a longer greeting gets smaller
						post.text.length <= 30
							? 'text-7xl leading-tight'
							: 'text-4xl leading-snug'
					} font-semibold whitespace-pre-line break-words overflow-hidden`}
				>
					{post.text}
				</p>
			)}
		</div>
		<QrLink url={post.url} />
	</div>
)

Joulukalenteri.displayName = 'Joulukalenteri'

export default Joulukalenteri
