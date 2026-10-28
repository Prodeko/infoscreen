export interface Theme {
  blueLight: string
  blueMedium: string
  blueDark: string
  highlightColor: string
  textColor: string
  sidebarWidth: string
  slideWidth: string
  borderRadius: string
  contentPadding: string
  contentBackgroundColor: string
  contentBoxShadow: string
  textShadow: string
}

export interface Slide {
  id: string | number
  title: string
  // HTML, rendered from the slide's Markdown body
  description: string
  highlight: boolean
  // Absolute URL
  image?: string
}

export interface Course {
  title: string
}

export interface Menu {
  courses: Course[]
}

export interface RestaurantData {
  name: string
  openingHours: (string | null)[]
  menus: Menu[]
}
