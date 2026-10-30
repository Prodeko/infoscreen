/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{js,jsx,ts,tsx}', './index.html'],
	theme: {
		extend: {
			fontFamily: {
				mono: ['IBM Plex Mono', 'Noto Color Emoji', 'monospace'],
				sans: ['IBM Plex Sans', 'Noto Color Emoji', 'sans-serif'],
			},
		},
	},
	plugins: [],
}
