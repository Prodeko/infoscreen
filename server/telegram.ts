import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'

// Serves /api/telegram-latest?channel=<name>: the newest post on one of the
// public Telegram channels below. Public channels have a web preview at
// t.me/s/<channel> that needs no bot or key, so this reads that page and
// pulls the last post out of its HTML. If Telegram changes the markup, this
// finds no post, answers 204, and the slide hides itself.

// Only these channels can be asked for, so the endpoint can't be used to
// fetch arbitrary pages. needsText skips posts without text, such as a bare
// photo; the announcement slide is all text, the advent calendar is videos.
const CHANNELS: Record<string, { needsText: boolean }> = {
	// Prodeko's announcements, the default when no channel is given
	prodekotiedotus: { needsText: true },
	// Sindi's advent calendar: a short video every day in December
	sindinjoulukalenteri: { needsText: false },
}
const DEFAULT_CHANNEL = 'prodekotiedotus'
const CACHE_MS = 2 * 60 * 1000

export type TelegramPost = {
	// Empty when the post has no text
	text: string
	// ISO time the post was sent
	date: string
	url: string
	image: string | null
	// The post's first video. Telegram's CDN links carry a token that expires,
	// which the two-minute cache and the page's polling keep fresh.
	video: string | null
	// A still from that video, shown until it plays
	poster: string | null
}

const ENTITIES: Record<string, string> = {
	amp: '&',
	lt: '<',
	gt: '>',
	quot: '"',
	apos: "'",
	nbsp: ' ',
}

const decodeEntities = (html: string) =>
	html.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, code: string) => {
		if (code[0] === '#') {
			const point =
				code[1].toLowerCase() === 'x'
					? Number.parseInt(code.slice(2), 16)
					: Number.parseInt(code.slice(1), 10)
			return Number.isNaN(point) ? entity : String.fromCodePoint(point)
		}
		return ENTITIES[code.toLowerCase()] ?? entity
	})

// The post's HTML as plain text: line breaks kept, tags dropped. Emoji are
// images with the character itself inside a <b>, so they survive.
const toText = (html: string) =>
	decodeEntities(html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ''))
		.replace(/\n{3,}/g, '\n\n')
		.trim()

export const parseLatestPost = (
	html: string,
	{ needsText = true } = {},
): TelegramPost | null => {
	const posts = html.split('<div class="tgme_widget_message_wrap').slice(1)
	// Newest last. A post with neither text nor media (a service message, a
	// sticker) is never shown.
	for (const post of posts.reverse()) {
		const text = post.match(
			/<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/,
		)
		const id = post.match(/data-post="([^"]+)"/)
		const date = post.match(/<time datetime="([^"]+)"/)
		if (!id || !date) continue
		const image = post.match(
			/tgme_widget_message_photo_wrap[^>]*background-image:url\('([^']+)'\)/,
		)
		const video = post.match(/<video src="([^"]+)"/)
		const poster = post.match(
			/tgme_widget_message_video_thumb"[^>]*background-image:url\('([^']+)'\)/,
		)
		if (!text && (needsText || (!image && !video))) continue
		return {
			text: text ? toText(text[1]) : '',
			date: date[1],
			url: `https://t.me/${id[1]}`,
			image: image ? decodeEntities(image[1]) : null,
			video: video ? decodeEntities(video[1]) : null,
			poster: poster ? decodeEntities(poster[1]) : null,
		}
	}
	return null
}

const fetchLatestPost = async (channel: string) => {
	const response = await fetch(`https://t.me/s/${channel}`)
	if (!response.ok) {
		throw new Error(`Telegram answered ${response.status}`)
	}
	return parseLatestPost(await response.text(), CHANNELS[channel])
}

export const telegram = (): Plugin => {
	const cache = new Map<string, { at: number; post: TelegramPost | null }>()

	const middleware = async (
		req: IncomingMessage,
		res: ServerResponse,
		next: () => void,
	) => {
		const url = new URL(req.url ?? '/', 'http://localhost')
		if (url.pathname !== '/api/telegram-latest') {
			next()
			return
		}
		const channel = url.searchParams.get('channel') ?? DEFAULT_CHANNEL
		if (!Object.hasOwn(CHANNELS, channel)) {
			res.statusCode = 404
			res.setHeader('Content-Type', 'application/json')
			res.end(JSON.stringify({ error: `Unknown channel ${channel}` }))
			return
		}
		try {
			let cached = cache.get(channel)
			if (!cached || Date.now() - cached.at > CACHE_MS) {
				cached = { at: Date.now(), post: await fetchLatestPost(channel) }
				cache.set(channel, cached)
			}
			if (!cached.post) {
				res.statusCode = 204
				res.end()
				return
			}
			res.setHeader('Content-Type', 'application/json')
			res.end(JSON.stringify(cached.post))
		} catch (error) {
			console.error('[telegram-latest]', channel, error)
			res.statusCode = 502
			res.setHeader('Content-Type', 'application/json')
			res.end(JSON.stringify({ error: String(error) }))
		}
	}

	return {
		name: 'telegram-latest',
		configureServer: (server) => {
			server.middlewares.use(middleware)
		},
		configurePreviewServer: (server) => {
			server.middlewares.use(middleware)
		},
	}
}
