import type { Plugin } from 'vite'

// Gives every build an id: it's compiled into the page as __BUILD_ID__ and
// written to dist/version.json. The page polls version.json and reloads when
// the id there differs from its own, i.e. when a newer build has replaced it
// (see src/useReloadOnNewBuild.ts). vite preview reads dist from disk on each
// request, so a rebuild is visible without restarting the service.
export const buildVersion = (): Plugin => {
	const id = new Date().toISOString()

	return {
		name: 'build-version',
		config: () => ({
			define: { __BUILD_ID__: JSON.stringify(id) },
		}),
		generateBundle() {
			this.emitFile({
				type: 'asset',
				fileName: 'version.json',
				source: JSON.stringify({ version: id }),
			})
		},
	}
}
