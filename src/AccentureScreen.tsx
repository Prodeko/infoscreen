import { useNightlyReload } from './useNightlyReload'
import { useReloadOnNewBuild } from './useReloadOnNewBuild'

// The whole screen is the Accenture logo. Only on the accenture-only branch;
// check out master and build to get the normal infoscreen back (the page
// reloads itself when the build changes).
const AccentureScreen = () => {
	useReloadOnNewBuild()
	useNightlyReload()

	return (
		<main className="h-screen w-screen bg-white flex items-center justify-center">
			<img src="/Accenture_logo.svg" alt="Accenture" className="w-1/2" />
		</main>
	)
}

export default AccentureScreen
