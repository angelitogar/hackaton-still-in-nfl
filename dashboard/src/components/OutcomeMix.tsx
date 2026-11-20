import type { OutcomeShare } from '../types/api'
import { formatInteger, formatShare } from '../lib/format'
import { Panel } from './ui/Panel'

/** Ancho de barra en porcentaje del contenedor (solo presentación). */
const barWidth = (share: number): string => `${Math.min(100, Math.max(0, share * 100))}%`

export function OutcomeMix({ items }: { items: OutcomeShare[] }) {
  return (
    <Panel
      title="Mezcla de resultados"
      subtitle="Etiquetas crudas de passResult, sin interpretar. La marca vertical es la mediana de la liga."
    >
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.label} className="grid grid-cols-[3rem_1fr_9rem] items-center gap-3 text-xs">
            <span className="font-mono font-semibold text-zinc-200">{item.label}</span>
            <div className="relative h-3 rounded bg-zinc-800">
              <div className="h-3 rounded bg-emerald-500/80" style={{ width: barWidth(item.share) }} />
              <div className="absolute top-[-2px] h-4 w-0.5 bg-amber-400" style={{ left: barWidth(item.leagueMedian) }} />
            </div>
            <span className="text-right font-mono tabular-nums text-zinc-400">
              {formatShare(item.share)} · n={formatInteger(item.n)}
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
