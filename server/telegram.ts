import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'

// Serves /api/telegram-latest: the newest text post on Prodeko's public
// announcement channel (t.me/prodekotiedotus). Public channels have a web
// preview at t.me/s/<channel> that needs no bot or key, so this reads that
// page and pulls the last post out of its HTML. If Telegram changes the
// markup, this finds no post, answers 204, and the slide hides itself.

const CHANNEL = 'prodekotiedotus'
const CACHE_MS = 2 * 60 * 1000

export type TelegramPost = {
	text: string
	// ISO time the post was sent
	date: string
	url: string
	image: string | null
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

export const parseLatestPost = (html: string): TelegramPost | null => {
	const posts = html.split('<div class="tgme_widget_message_wrap').slice(1)
	// Newest last; skip posts with no text, such as a bare photo
	for (const post of posts.reverse()) {
		const text = post.match(
			/<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/,
		)
		const id = post.match(/data-post="([^"]+)"/)
		const date = post.match(/<time datetime="([^"]+)"/)
		if (!text || !id || !date) continue
		const image = post.match(
			/tgme_widget_message_photo_wrap[^>]*background-image:url\('([^']+)'\)/,
		)
		return {
			text: toText(text[1]),
			date: date[1],
			url: `https://t.me/${id[1]}`,
			image: image?.[1] ?? null,
		}
	}
	return null
}

const fetchLatestPost = async () => {
	const response = await fetch(`https://t.me/s/${CHANNEL}`)
	if (!response.ok) {
		throw new Error(`Telegram answered ${response.status}`)
	}
	return parseLatestPost(await response.text())
}

export const telegram = (): Plugin => {
	let cached: { at: number; post: TelegramPost | null } | null = null

	const middleware = async (
		req: IncomingMessage,
		res: ServerResponse,
		next: () => void,
	) => {
		if (req.url?.split('?')[0] !== '/api/telegram-latest') {
			next()
			return
		}
		try {
			if (!cached || Date.now() - cached.at > CACHE_MS) {
				cached = { at: Date.now(), post: await fetchLatestPost() }
			}
			if (!cached.post) {
				res.statusCode = 204
				res.end()
				return
			}
			res.setHeader('Content-Type', 'application/json')
			res.end(JSON.stringify(cached.post))
		} catch (error) {
			console.error('[telegram-latest]', error)
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
