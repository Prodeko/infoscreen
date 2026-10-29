// A small grey note for data that has stopped updating, so a source that
// breaks shows up on the screen instead of silently showing old information.
const StaleNote = ({
	updatedAt,
	isStale,
	className = '',
}: {
	updatedAt: Date | null
	isStale: boolean
	className?: string
}) => {
	if (!isStale) {
		return null
	}

	const time = updatedAt?.toLocaleTimeString('fi-FI', {
		hour: '2-digit',
		minute: '2-digit',
	})

	return (
		<p className={`text-sm text-stone-400 ${className}`}>
			⚠ {time ? `Tiedot päivitetty viimeksi klo ${time}` : 'Tietoja ei saatu'}
		</p>
	)
}

export default StaleNote
