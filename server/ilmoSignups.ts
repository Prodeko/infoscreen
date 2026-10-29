import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'

// Serves /api/ilmo-signups: events on ilmo.prodeko.org whose sign-up is open
// or opening soon, trimmed to what the screen shows.
//
// Ilmo only answers GraphQL queries its own frontend ships with ("persisted
// operations"), and a POST needs a session cookie plus a CSRF token. So this
// runs on the server: it loads Ilmo's front page for the cookies, then asks
// for the persisted query behind that page. If Ilmo changes that query its
// hash changes, this returns an error, and the Signups slide hides itself
// until HOME_PAGE_QUERY is updated (see Ilmo's
// @app/graphql/.persisted_operations/ for the HomePage query).

const ILMO_URL = 'https://ilmo.prodeko.org'
const HOME_PAGE_QUERY =
	'301da0928db49b18b443128fd731b8815df9fd05a090c4f6e648837bc2436754'
const CACHE_MS = 2 * 60 * 1000

type Translated = { fi?: string; en?: string }

type IlmoEvent = {
	name: Translated
	slug: string
	location: string | null
	eventStartTime: string
	registrationStartTime: string
	registrationEndTime: string
	isHighlighted: boolean
	headerImageFile: string | null
	ownerOrganization: { name: string; color: string | null } | null
	registrations: { totalCount: number } | null
	quotas: { nodes: Array<{ size: number }> } | null
	openQuotaSize: number | null
}

type IlmoHomePage = {
	data?: {
		signupOpenEvents?: { nodes: IlmoEvent[] }
		signupUpcomingEvents?: { nodes: IlmoEvent[] }
	}
	errors?: Array<{ message: string }>
}

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
	// Quota places plus the open quota; null when Ilmo doesn't say
	places: number | null
}

export type SignupsResponse = { open: Signup[]; upcoming: Signup[] }

const toSignup = (event: IlmoEvent): Signup => {
	const quotaPlaces = (event.quotas?.nodes ?? []).reduce(
		(sum, quota) => sum + quota.size,
		0,
	)
	const places = quotaPlaces + (event.openQuotaSize ?? 0)
	return {
		name: event.name.fi || event.name.en || '',
		url: `${ILMO_URL}/event/${event.slug}`,
		location: event.location,
		organization: event.ownerOrganization?.name ?? null,
		color: event.ownerOrganization?.color ?? null,
		image: event.headerImageFile,
		eventStart: event.eventStartTime,
		signupStart: event.registrationStartTime,
		signupEnd: event.registrationEndTime,
		registrations: event.registrations?.totalCount ?? 0,
		places: places > 0 ? places : null,
	}
}

const fetchSignups = async (): Promise<SignupsResponse> => {
	const page = await fetch(`${ILMO_URL}/`)
	const cookies = page.headers
		.getSetCookie()
		.map((cookie) => cookie.split(';')[0])
	const csrfToken = cookies
		.find((cookie) => cookie.startsWith('csrfToken='))
		?.slice('csrfToken='.length)
	if (!csrfToken) {
		throw new Error('Ilmo did not hand out a CSRF token')
	}

	const response = await fetch(`${ILMO_URL}/graphql`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Cookie: cookies.join('; '),
			'csrf-token': decodeURIComponent(csrfToken),
		},
		body: JSON.stringify({
			extensions: {
				persistedQuery: { version: 1, sha256Hash: HOME_PAGE_QUERY },
			},
			variables: { language: 'fi' },
		}),
	})
	const body = (await response.json()) as IlmoHomePage
	if (!response.ok || body.errors?.length || !body.data) {
		throw new Error(
			`Ilmo answered ${response.status}: ${body.errors?.[0]?.message ?? 'no data'}`,
		)
	}

	return {
		open: (body.data.signupOpenEvents?.nodes ?? []).map(toSignup),
		upcoming: (body.data.signupUpcomingEvents?.nodes ?? []).map(toSignup),
	}
}

export const ilmoSignups = (): Plugin => {
	let cached: { at: number; body: string } | null = null

	const middleware = async (
		req: IncomingMessage,
		res: ServerResponse,
		next: () => void,
	) => {
		if (req.url?.split('?')[0] !== '/api/ilmo-signups') {
			next()
			return
		}
		try {
			if (!cached || Date.now() - cached.at > CACHE_MS) {
				cached = { at: Date.now(), body: JSON.stringify(await fetchSignups()) }
			}
			res.setHeader('Content-Type', 'application/json')
			res.end(cached.body)
		} catch (error) {
			console.error('[ilmo-signups]', error)
			res.statusCode = 502
			res.setHeader('Content-Type', 'application/json')
			res.end(JSON.stringify({ error: String(error) }))
		}
	}

	return {
		name: 'ilmo-signups',
		configureServer: (server) => {
			server.middlewares.use(middleware)
		},
		configurePreviewServer: (server) => {
			server.middlewares.use(middleware)
		},
	}
}
