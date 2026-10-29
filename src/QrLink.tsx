import qrcode from 'qrcode-generator'
import { useMemo } from 'react'

// A QR code in the slide's bottom right corner that opens `url` on a phone.
// It is an <img>, so night mode inverts it back (index.css) and it stays dark
// on light, which every scanner reads. The slide's root must be `relative`.
const QrLink = ({ url }: { url: string }) => {
	const src = useMemo(() => {
		const code = qrcode(0, 'M')
		code.addData(url)
		code.make()
		return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
			code.createSvgTag({ cellSize: 4, margin: 2, scalable: true }),
		)}`
	}, [url])

	return (
		<div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-md p-2 flex flex-col items-center gap-1">
			<img src={src} alt="" className="w-32 h-32" />
			<p className="text-sm font-semibold">Go to the page</p>
		</div>
	)
}

export default QrLink
