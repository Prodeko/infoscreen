// A full-screen question to the guild room

// Through this day (local time) it is the only slide on the screen; after it
// the slide goes back to taking its turn in the rotation
const ONLY_SLIDE_UNTIL = '2026-11-17'

export const isOnlyBamskit = () =>
	new Date().toLocaleDateString('sv-SE') <= ONLY_SLIDE_UNTIL // YYYY-MM-DD

const Bamskit = (_props: { rotationInterval?: number }) => (
	<div className="flex items-center justify-center h-full p-8">
		<p
			className="text-[10rem] leading-tight font-bold text-center"
			style={{ fontFamily: '"Comic Sans MS", "Comic Neue", cursive' }}
		>
			Mis on kaikki bämskit??
		</p>
	</div>
)

export default Bamskit
