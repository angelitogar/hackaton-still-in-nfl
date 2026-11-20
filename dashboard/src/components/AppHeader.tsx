import type { Meta } from '../types/api'

export function AppHeader({ meta }: { meta: Meta }) {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950 px-6 py-3">
      <div className="mx-auto flex max-w-[1400px] items-baseline justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold tracking-widest text-emerald-400">NFL TRADE BOWL</h1>
          <p className="text-xs text-zinc-500">Diagnóstico histórico y escenarios hipotéticos</p>
        </div>
        <p className="text-xs text-zinc-500">
          Muestra {meta.season} · semanas {meta.weeks.min} a {meta.weeks.max} · {meta.dataset.plays.toLocaleString('es-MX')} jugadas
        </p>
      </div>
    </header>
  )
}
