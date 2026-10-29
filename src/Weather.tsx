import StaleNote from './StaleNote'
import { fetchJson, usePolling } from './usePolling'

// Otaniemi, from Open-Meteo (no key needed)
const WEATHER_URL =
	'/weatherproxy/v1/forecast?latitude=60.1867&longitude=24.8277' +
	'&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m' +
	'&hourly=temperature_2m,precipitation_probability,weather_code' +
	'&forecast_hours=7&timezone=Europe%2FHelsinki&wind_speed_unit=ms'

type OpenMeteoResponse = {
	current: {
		temperature_2m: number
		apparent_temperature: number
		weather_code: number
		wind_speed_10m: number
	}
	hourly: {
		time: string[]
		temperature_2m: number[]
		precipitation_probability: number[]
		weather_code: number[]
	}
}

// WMO weather codes, grouped
const describe = (code: number): { icon: string; text: string } => {
	if (code === 0) return { icon: '☀️', text: 'Selkeää' }
	if (code <= 2) return { icon: '⛅', text: 'Puolipilvistä' }
	if (code === 3) return { icon: '☁️', text: 'Pilvistä' }
	if (code <= 48) return { icon: '🌫️', text: 'Sumua' }
	if (code <= 57) return { icon: '🌦️', text: 'Tihkua' }
	if (code <= 67) return { icon: '🌧️', text: 'Sadetta' }
	if (code <= 77) return { icon: '🌨️', text: 'Lumisadetta' }
	if (code <= 82) return { icon: '🌧️', text: 'Sadekuuroja' }
	if (code <= 86) return { icon: '🌨️', text: 'Lumikuuroja' }
	return { icon: '⛈️', text: 'Ukkosta' }
}

const loadWeather = () => fetchJson<OpenMeteoResponse>(WEATHER_URL)

const Weather = () => {
	const { data, updatedAt, isStale } = usePolling(loadWeather, 15 * 60 * 1000)

	if (!data) {
		return null
	}

	const now = describe(data.current.weather_code)
	// The next six hours, skipping the current one
	const hours = data.hourly.time.slice(1, 7).map((time, i) => ({
		time: time.slice(11, 13),
		temperature: data.hourly.temperature_2m[i + 1],
		rain: data.hourly.precipitation_probability[i + 1],
		icon: describe(data.hourly.weather_code[i + 1]).icon,
	}))

	return (
		<div className="bg-white rounded-lg shadow-md p-3 text-left">
			<div className="flex items-center gap-2">
				<span className="text-4xl emoji">{now.icon}</span>
				<div>
					<p className="text-3xl font-bold">
						{Math.round(data.current.temperature_2m)}°
					</p>
					<p className="text-sm text-stone-500">
						{now.text}, tuntuu {Math.round(data.current.apparent_temperature)}°,{' '}
						{Math.round(data.current.wind_speed_10m)} m/s
					</p>
				</div>
			</div>
			<div className="grid grid-cols-6 text-center text-sm mt-2">
				{hours.map((hour) => (
					<div key={hour.time}>
						<p className="text-stone-500">{hour.time}</p>
						<p className="emoji">{hour.icon}</p>
						<p className="font-semibold">{Math.round(hour.temperature)}°</p>
						<p className="text-xs text-sky-700">
							{hour.rain > 0 ? `${hour.rain}%` : ''}
						</p>
					</div>
				))}
			</div>
			<StaleNote updatedAt={updatedAt} isStale={isStale} className="mt-1" />
		</div>
	)
}

export default Weather
