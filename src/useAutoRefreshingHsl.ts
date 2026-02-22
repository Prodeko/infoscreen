import { useEffect, useState } from 'react'
import {
	HSL_ENDPOINT,
	HSL_QUERY,
	HSL_VARIABLES,
	type HSLData,
	type HSLResponse,
} from './hsl'

export const useAutoRefreshingHsl = (
	refreshIntervalMS: number = 60 * 1000,
) => {
	const [hslData, setHslData] = useState<HSLData | null>(null)

	const fetchHsl = async () => {
		try {
			if (!import.meta.env.VITE_HSL_SUBSCRIPTION_KEY) {
				console.error('VITE_HSL_SUBSCRIPTION_KEY is not set.')
				return
			}

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
			setHslData(data.data || null)
		} catch (error) {
			console.error('Failed to fetch HSL data. Maybe the server is down?', error)
		}
	}

	useEffect(() => {
		fetchHsl()
		const interval = setInterval(fetchHsl, refreshIntervalMS)
		return () => clearInterval(interval)
	}, [refreshIntervalMS])

	return hslData
}
