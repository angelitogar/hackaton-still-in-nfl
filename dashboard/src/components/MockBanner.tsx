import { USE_MOCKS } from '../api/config'

export function MockBanner() {
  if (!USE_MOCKS) return null
  return (
    <div role="note" className="border-b border-amber-700/60 bg-amber-950/40 px-6 py-1.5 text-center text-xs text-amber-300">
      Modo demostración: las cifras son datos de ejemplo con la forma de la API, no resultados reales.
    </div>
  )
}
