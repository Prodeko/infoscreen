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
  id: number
  title: string
  description: string
  highlight: boolean
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
  openingHours: Record<string, unknown>
  menus: Menu[]
}

interface Stop {
  name: string
  vehicleMode: string
  __typename: 'Stop'
}

interface Route {
  longName: string
  shortName: string
  __typename: 'Route'
}

interface Trip {
  route: Route
  __typename: 'Trip'
}

interface Stoptime {
  headsign: string
  realtime: boolean
  realtimeDeparture: number
  scheduledDeparture: number
  serviceDay: number
  trip: Trip
  __typename: 'Stoptime'
}

interface BusPlace {
  stoptimes: Stoptime[]
  stop: Stop
  __typename: 'DepartureRow'
}

interface BikePlace {
  bikesAvailable: number
  name: string
  spacesAvailable: number
  __typename: 'BikeRentalStation'
}

export type Place = BikePlace | BusPlace

export function isBikePlace(
  busOrBikePlace: Place,
): busOrBikePlace is BikePlace {
  if ((busOrBikePlace as BikePlace).__typename === 'BikeRentalStation') {
    return true
  }
  return false
}
