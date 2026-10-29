import { useEffect, useRef, useState } from 'react'

export type Polled<T> = {
	data: T | null
	// When `load` last succeeded
	updatedAt: Date | null
	// True when the last success is older than `staleAfterMS`, or nothing has
	// loaded yet and the first attempt failed
	isStale: boolean
}

// Calls `load` on mount and every `intervalMS`. A failed load keeps the last
// data, so a network blip doesn't blank a slide; `isStale` says when the data
// shown is older than it should be.
export const usePolling = <T>(
	load: () => Promise<T>,
	intervalMS: number,
	// Default: three missed refreshes, but never less than ten minutes
	staleAfterMS: number = Math.max(3 * intervalMS, 10 * 60 * 1000),
): Polled<T> => {
	const [data, setData] = useState<T | null>(null)
	const [updatedAt, setUpdatedAt] = useState<Date | null>(null)
	const [failed, setFailed] = useState(false)
	const [now, setNow] = useState(() => Date.now())
	const loadRef = useRef(load)
	loadRef.current = load

	useEffect(() => {
		let cancelled = false
		const run = async () => {
			try {
				const next = await loadRef.current()
				if (!cancelled) {
					setData(next)
					setUpdatedAt(new Date())
					setFailed(false)
				}
			} catch (error) {
				console.error(error)
				if (!cancelled) setFailed(true)
			}
			if (!cancelled) setNow(Date.now())
		}

		run()
		const interval = setInterval(run, intervalMS)
		return () => {
			cancelled = true
			clearInterval(interval)
		}
	}, [intervalMS])

	const isStale = updatedAt ? now - updatedAt.getTime() > staleAfterMS : failed

	return { data, updatedAt, isStale }
}

export const fetchJson = async <T>(url: string): Promise<T> => {
	const response = await fetch(url)
	if (!response.ok) {
		throw new Error(`${url} failed with status ${response.status}`)
	}
	return (await response.json()) as T
}
