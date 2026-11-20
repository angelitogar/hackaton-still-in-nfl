import { useEffect, useState } from 'react'
import type { Meta } from '../types/api'

export function AppHeader({ meta }: { meta: Meta }) {
  const [light, setLight] = useState(() => localStorage.getItem('nfl-theme') === 'light')
  useEffect(() => { document.documentElement.dataset.theme = light ? 'light' : 'dark'; localStorage.setItem('nfl-theme', light ? 'light' : 'dark') }, [light])
  return (
    <header className="brand-header border-b border-zinc-800 bg-zinc-950 px-6 py-3">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src="brands/nfl.png" alt="NFL" className="h-11 w-11 object-contain" />
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Análisis y simulación</p><h1 className="text-lg font-bold tracking-widest text-emerald-400">NFL TRADE BOWL</h1></div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <p className="text-xs text-zinc-500">Muestra {meta.season} · semanas {meta.weeks.min} a {meta.weeks.max} · {meta.dataset.plays.toLocaleString('es-MX')} jugadas</p>
          <span className="rounded bg-white px-2 py-1"><img src="brands/aws.png" alt="Powered by AWS" className="h-7 w-auto object-contain" /></span>
          <button type="button" onClick={() => setLight(!light)} className="theme-button rounded border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-100" aria-label={light ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}>{light ? '☾ Oscuro' : '☀ Claro'}</button>
        </div>
      </div>
    </header>
  )
}
