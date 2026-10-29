import {
	HSL_ENDPOINT,
	HSL_QUERY,
	HSL_VARIABLES,
	type HSLData,
	type HSLResponse,
} from './hslApi'
import { usePolling } from './usePolling'

const loadHsl = async (): Promise<HSLData | null> => {
	const response = await fetch(HSL_ENDPOINT, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			query: HSL_QUERY,
			variables: HSL_VARIABLES,
		}),
	})

	if (!response.ok) {
		throw new Error(`HSL request failed with status ${response.status}`)
	}

	const data = (await response.json()) as HSLResponse
	if (data.errors && data.errors.length > 0) {
		console.error('HSL GraphQL errors:', data.errors)
	}
	return data.data || null
}

export const useAutoRefreshingHsl = (refreshIntervalMS: number = 60 * 1000) =>
	usePolling(loadHsl, refreshIntervalMS)
