import {
	Children,
	Fragment,
	isValidElement,
	type ReactElement,
	type ReactNode,
} from 'react'

// Full-screen one-liners to the guild room, in Comic Sans (Comic Neue on the
// Pi, see index.css). Every 4th slide in the rotation is one of these.

const PHRASES: ReactNode[] = [
	'Mis on kaikki bämskit??',
	'Mitä tekee hallitus?',
	<>
		Morjesta <span className="emoji">🗿</span>
	</>,
	'(tirsk)',
]

// Regular slides between two of these
const EVERY = 3

const Bamskit = ({
	slot,
	slots,
	rotation = 0,
}: {
	// Which of the round's `slots` bämskit slides this is
	slot: number
	slots: number
	rotation?: number
	rotationInterval?: number
}) => (
	<div className="flex items-center justify-center h-full p-8">
		<p
			className="text-[10rem] leading-tight font-bold text-center"
			style={{ fontFamily: '"Comic Sans MS", "Comic Neue", cursive' }}
		>
			{/* Each slot and each round moves on to the next phrase */}
			{PHRASES[(slot + rotation * slots) % PHRASES.length]}
		</p>
	</div>
)

// The rotation's slides, given as a fragment, with a bämskit slide after
// every EVERY of them (and one at the end when there are fewer)
export const withBamskits = (slides: ReactNode) => {
	const inner =
		isValidElement<{ children?: ReactNode }>(slides) && slides.type === Fragment
			? slides.props.children
			: slides
	const regular = Children.toArray(inner) as ReactElement[]
	const slots = Math.max(1, Math.floor(regular.length / EVERY))
	const result: ReactElement[] = []
	let slot = 0
	regular.forEach((slide, index) => {
		result.push(slide)
		if (slot < slots && (index + 1) % EVERY === 0) {
			result.push(
				<Bamskit
					key={`bamskit-${slot}`}
					slot={slot}
					slots={slots}
					rotationInterval={10000}
				/>,
			)
			slot++
		}
	})
	if (slot === 0) {
		result.push(
			<Bamskit key="bamskit-0" slot={0} slots={1} rotationInterval={10000} />,
		)
	}
	return result
}
