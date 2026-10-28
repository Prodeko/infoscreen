const dev = process.env.NODE_ENV !== 'production'

export const SLIDE_CHANGE_INTERVAL = dev ? 5000 : 18000
export const FETCH_SLIDES_INTERVAL = dev ? 10000 : 300000
export const FETCH_MENUS_INTERVAL = 3600000

export const TIME_ZONE = 'Europe/Helsinki'
