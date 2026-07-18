/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_PROXY_TARGET: string
  readonly VITE_DEBUG_AUTH: string
  readonly VITE_PLATFORM_SHARED_FROM: string
  readonly VITE_PLATFORM_SHARED_DOMAINS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
