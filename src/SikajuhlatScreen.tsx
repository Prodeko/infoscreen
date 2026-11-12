import qrcode from 'qrcode-generator'
import { useMemo } from 'react'
import { useNightlyReload } from './useNightlyReload'
import { useReloadOnNewBuild } from './useReloadOnNewBuild'

// The whole screen is sikajuhlat.com and a QR code to it. Only on the
// sikajuhlat-only branch; check out master and build to get the normal
// infoscreen back (the page reloads itself when the build changes). The site
// forbids being framed, so it can't be shown itself.
const SITE_URL = 'https://sikajuhlat.com'

const SikajuhlatScreen = () => {
	useReloadOnNewBuild()
	useNightlyReload()

	const qr = useMemo(() => {
		const code = qrcode(0, 'M')
		code.addData(SITE_URL)
		code.make()
		return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
			code.createSvgTag({ cellSize: 4, margin: 2, scalable: true }),
		)}`
	}, [])

	return (
		<main className="h-screen w-screen bg-white flex flex-col items-center justify-center gap-16">
			<p className="text-[11rem] leading-none font-bold">sikajuhlat.com</p>
			<img src={qr} alt="" className="w-96 h-96" />
		</main>
	)
}

export default SikajuhlatScreen
