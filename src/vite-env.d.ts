/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NEON_DATABASE_URL?: string
  readonly VITE_WEB3FORMS_ACCESS_KEY?: string
  readonly VITE_ADMIN_NOTIFICATION_EMAIL?: string
  readonly VITE_ADMIN_PASSWORD?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
