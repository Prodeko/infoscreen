import { getModeColor } from './hslApi'

// A line number in HSL's colour for its mode: orange metro, green tram, blue
// bus. Lines of an unknown mode keep a neutral grey.
const LineBadge = ({
	line,
	mode,
	className = '',
}: {
	line: string
	mode: string | null
	className?: string
}) => {
	const color = getModeColor(mode)
	return (
		<p
			className={`font-mono font-bold rounded text-center ${
				color ? 'text-white' : 'bg-stone-100'
			} ${className}`}
			style={color ? { backgroundColor: color } : undefined}
		>
			{line}
		</p>
	)
}

export default LineBadge
