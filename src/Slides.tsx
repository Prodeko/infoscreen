import QrLink from './QrLink'
import type { Slide } from './types'

// Slides edited at prodeko.org/admin (Infoscreen), published as
// prodeko.org/fi/infoscreen.json. Shows one slide per rotator round, like
// Tiedote.
const Slides = ({
	slides,
	rotation,
}: {
	slides: Slide[]
	rotation?: number
	rotationInterval?: number
}) => {
	const slide = slides[(rotation || 0) % slides.length]

	return (
		<div
			className={`relative flex flex-col h-full p-8 rounded-lg ${
				slide.highlight ? 'border-8 border-blue-800' : ''
			}`}
		>
			<h1 className="text-5xl font-bold mb-6">{slide.title}</h1>
			{slide.image && (
				<img
					src={slide.image}
					alt=""
					className="min-h-0 flex-1 object-contain mb-6"
				/>
			)}
			<div
				className="text-2xl space-y-4"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: rendered from Markdown edited in the prodeko.org admin
				dangerouslySetInnerHTML={{ __html: slide.description }}
			/>
			{slide.link && <QrLink url={slide.link} />}
		</div>
	)
}

export default Slides
