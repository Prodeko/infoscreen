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

export type TiedoteMessage = {
	id: number
	category: string
	tags: string[]
	is_new: boolean
	header: string
	pub_date: string
	start_date: string
	end_date: string
	deadline_date: string
	show_deadline: boolean
	visible: boolean
	content: string
}

export type TiedoteCategory = {
	id: number
	title: string
	order: number
	messages: TiedoteMessage[]
}

export type TiedoteMessageWithCategory = TiedoteMessage & { categoryTitle: string }
