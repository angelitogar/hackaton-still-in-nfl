import type { OutcomeShare } from '../types/api'
import { formatInteger, formatShare } from '../lib/format'
import { Panel } from './ui/Panel'

/** Ancho de barra en porcentaje del contenedor (solo presentación). */
const barWidth = (share: number): string => `${Math.min(100, Math.max(0, share * 100))}%`

const OUTCOME_LABELS: Record<string, string> = { C: 'Pase completo', I: 'Pase incompleto', IN: 'Intercepción', S: 'Captura del QB', R: 'Scramble del QB' }

export function OutcomeMix({ items }: { items: OutcomeShare[] }) {
  return (
    <Panel
      title="Mezcla de resultados"
      subtitle="Distribución de resultados en las jugadas disponibles. La barra es el porcentaje del equipo; la marca vertical representa la mediana de los equipos de la muestra."
    >
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.label} className="grid grid-cols-[minmax(7rem,10rem)_1fr_6rem] items-center gap-3 text-xs">
            <span className="font-mono font-semibold text-zinc-200">{OUTCOME_LABELS[item.label] ?? item.label} <span className="text-zinc-500">({item.label})</span></span>
            <div className="relative h-3 rounded bg-zinc-800">
              <div className="h-3 rounded bg-emerald-500/80" style={{ width: barWidth(item.share) }} />
              <div className="absolute top-[-2px] h-4 w-0.5 bg-amber-400" style={{ left: barWidth(item.leagueMedian) }} />
            </div>
            <span className="text-right font-mono tabular-nums text-zinc-400">
              {formatShare(item.share)}
            </span>
          </li>
        ))}
      </ul>
      {items[0] && <p className="mt-3 text-xs text-zinc-400">Total de jugadas en la muestra del equipo: {formatInteger(items[0].n)}. En defensa, los resultados corresponden a las jugadas del rival.</p>}
    </Panel>
  )
}
