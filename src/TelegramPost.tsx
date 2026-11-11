import { useLayoutEffect, useRef, useState } from 'react'
import QrLink from './QrLink'

// The newest post on Prodeko's Telegram announcement channel, from
// /api/telegram-latest (server/telegram.ts).

// Same shape as TelegramPost in server/telegram.ts
export type TelegramPostData = {
	text: string
	date: string
	url: string
	image: string | null
}

// Older posts are hidden: the slide is for what's current
export const TELEGRAM_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000

export const loadTelegramPost = async (): Promise<TelegramPostData | null> => {
	const response = await fetch('/api/telegram-latest')
	// 204: no text post found on the channel page
	if (response.status === 204) {
		return null
	}
	if (!response.ok) {
		throw new Error(`Telegram request failed with status ${response.status}`)
	}
	return (await response.json()) as TelegramPostData
}

export const isRecentTelegramPost = (post: TelegramPostData | null) =>
	post !== null && Date.now() - Date.parse(post.date) < TELEGRAM_MAX_AGE_MS

const BLUE = '#002e7d'

const formatDate = (iso: string) => {
	const date = new Date(iso)
	const day = date.toLocaleDateString('fi-FI', {
		weekday: 'short',
		day: 'numeric',
		month: 'numeric',
	})
	const time = date.toLocaleTimeString('fi-FI', {
		hour: '2-digit',
		minute: '2-digit',
	})
	return `${day} klo ${time}`
}

// Most long posts are in Finnish, then a line like ___, ——— or ***, then the
// same in English. Show the Finnish part; the QR code opens the whole post.
const firstLanguage = (text: string) =>
	text.split(/\n\s*[-—–_=~*]{3,}\s*\n/)[0].trim()

// Tried biggest first until the text fits
const TEXT_SIZES = [
	'text-5xl leading-tight',
	'text-4xl leading-snug',
	'text-3xl leading-snug',
	'text-2xl leading-snug',
]

const TelegramPost = ({
	post,
}: {
	post: TelegramPostData
	rotationInterval?: number
}) => {
	const text = firstLanguage(post.text)
	const textRef = useRef<HTMLParagraphElement>(null)
	const [size, setSize] = useState(0)
	const [overflows, setOverflows] = useState(false)

	// Steps the size down until the text fits. App keys this slide by the
	// post, so a new post starts again from the biggest size.
	useLayoutEffect(() => {
		const element = textRef.current
		if (!element) return
		const tooTall = element.scrollHeight > element.clientHeight
		if (tooTall && size < TEXT_SIZES.length - 1) {
			setSize(size + 1)
		} else {
			setOverflows(tooTall)
		}
	}, [size])

	return (
		<div className="relative flex flex-col gap-6 h-full p-4">
			<div className="flex items-baseline justify-between">
				<h1 className="text-4xl font-bold" style={{ color: BLUE }}>
					Prodekon tiedotus
				</h1>
				<p className="text-2xl text-stone-500">
					Telegram, {formatDate(post.date)}
				</p>
			</div>
			<div className="flex gap-8 min-h-0 flex-1">
				<p
					ref={textRef}
					className={`${TEXT_SIZES[size]} whitespace-pre-line overflow-hidden flex-1 pr-40`}
					style={
						overflows
							? {
									maskImage:
										'linear-gradient(to bottom, black 85%, transparent)',
								}
							: undefined
					}
				>
					{text}
				</p>
				{post.image && (
					<img
						src={post.image}
						alt=""
						className="max-w-[35%] max-h-[70%] object-contain rounded-lg self-start"
					/>
				)}
			</div>
			<QrLink url={post.url} />
		</div>
	)
}

TelegramPost.displayName = 'TelegramPost'

export default TelegramPost
