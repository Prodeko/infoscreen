/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_KILTISKAMERA_ON_AIR_PASSWORD: string
	readonly VITE_HSL_SUBSCRIPTION_KEY: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
