/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 'false' usa la API real; cualquier otro valor (o ausencia) usa datos de demostración. */
  readonly VITE_USE_MOCKS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
