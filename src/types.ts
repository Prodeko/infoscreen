export interface Meal {
	title: string
	properties: string[]
}

export interface Menu {
	[date: string]: Meal[]
}

export interface Restaurant {
	id: number
	name: string
	url: string
	address: string
	latitude: number
	longitude: number
	openingHours: (string | null)[]
}

export interface Restaurants {
	[id: string]: Restaurant
}

export interface RestaurantDailyMenu {
	id: number
	name: string
	menu: Meal[] | null
	openingHours: string | null
}
