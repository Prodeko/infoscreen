import { useState, useEffect, useSyncExternalStore } from 'react'
import {
  FETCH_SLIDES_INTERVAL,
  FETCH_MENUS_INTERVAL,
  TIME_ZONE,
} from '../lib/config'
import { RestaurantData, Slide } from '../types'

// Calls `load` now and then every `interval` ms. A failed load keeps the
// previous data, so a network blip doesn't blank the screen.
const usePolling = <T>(load: () => Promise<T>, interval: number): T | null => {
  const [data, setData] = useState<T | null>(null)

  useEffect(() => {
    let cancelled = false
    const run = (): void => {
      load()
        .then((d) => {
          if (!cancelled) setData(d)
        })
        .catch((err) => console.error(err))
    }
    run()
    const id = setInterval(run, interval)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [load, interval])

  return data
}

const fetchJson = async <T>(url: string): Promise<T> => {
  const res = await fetch(url, { headers: { accept: 'application/json' } })
  if (!res.ok) throw new Error(`${url}: ${res.status}`)
  return res.json()
}

// YYYY-MM-DD in Helsinki time
export const today = (): string =>
  new Intl.DateTimeFormat('sv-SE', { timeZone: TIME_ZONE }).format(new Date())

const subscribeToSeconds = (onTick: () => void): (() => void) => {
  const id = setInterval(onTick, 1000)
  return () => clearInterval(id)
}

// Null on the server, so the clock doesn't cause a hydration mismatch
export const useClock = (): { time: string; date: string } | null => {
  const seconds = useSyncExternalStore(
    subscribeToSeconds,
    () => Math.floor(Date.now() / 1000),
    () => null,
  )

  if (seconds === null) return null
  const now = new Date(seconds * 1000)
  return {
    time: now.toLocaleTimeString('fi-FI', {
      timeZone: TIME_ZONE,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    date: now.toLocaleDateString('fi-FI', {
      timeZone: TIME_ZONE,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }),
  }
}

const restaurants = [
  { id: 2, name: 'T-talo' },
  { id: 7, name: 'TUAS' },
  { id: 52, name: 'A Bloc' },
]

const loadMenus = (): Promise<RestaurantData[]> =>
  Promise.all(
    restaurants.map((r) =>
      fetchJson<RestaurantData>(`/api/restaurants/${r.id}/menu?day=${today()}`),
    ),
  )

export const useRestaurantData = (): RestaurantData[] | null =>
  usePolling(loadMenus, FETCH_MENUS_INTERVAL)

const defaultSlides: Slide[] = [
  {
    id: -1,
    title: '',
    description:
      "<div style='position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); font-size: 100px;'>🌈🦄</div>",
    highlight: false,
  },
]

const loadSlides = (): Promise<Slide[]> => fetchJson<Slide[]>('/api/slides')

export const useSlides = (): Slide[] => {
  const data = usePolling(loadSlides, FETCH_SLIDES_INTERVAL)
  return data && data.length > 0 ? data : defaultSlides
}
