import type { TiedoteMessageWithCategory } from './types'

const Tiedote = ({
	messages,
	rotation,
}: {
	messages: TiedoteMessageWithCategory[] | undefined
	rotation?: number
	rotationInterval?: number
}) => {
	if (!messages || messages.length === 0) {
		return (
			<div className="flex items-center justify-center h-full">
				<p className="text-2xl">Loading tiedote...</p>
			</div>
		)
	}
    console.log(rotation, messages)

	const message = messages[(rotation || 0) % messages.length]

	if (!message) {
		return (
			<div className="flex items-center justify-center h-full">
				<p className="text-2xl">No message to display.</p>
			</div>
		)
	}

	return (
		<div className="p-8">
			<h1 className="text-4xl font-bold mb-4">{message.categoryTitle}</h1>
			<h2 className="text-3xl font-semibold mb-4">{message.header}</h2>
			<div
				className="prose prose-xl"
				dangerouslySetInnerHTML={{ __html: message.content }}
			/>
		</div>
	)
}

Tiedote.displayName = 'Tiedote'

export default Tiedote
