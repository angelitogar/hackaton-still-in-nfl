import type { Perspective, ScenarioNeed, SliceMetric } from '../types/api'
import { bucketLabel } from '../lib/labels'
import {
  formatInteger,
  formatInterval,
  formatNumber,
  formatPercentile,
  formatShare,
  formatSigned,
} from '../lib/format'
import { SampleBadge, VerdictBadge } from './StatusBadges'

interface SliceTableProps {
  rows: SliceMetric[]
  perspective: Perspective
  onSelectNeed?: (need: ScenarioNeed) => void
}

const HEADERS = ['Segmento', 'n', 'Media', 'Mediana liga', 'Dif.', 'IC 95 %', 'Perc.', 'Explos.', 'Neg.', 'Muestra', 'Veredicto', '']

export function SliceTable({ rows, perspective, onSelectNeed }: SliceTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-left text-xs">
        <thead>
          <tr className="border-b border-zinc-800 text-[11px] uppercase tracking-wide text-zinc-500">
            {HEADERS.map((header) => (
              <th key={header} className="px-2 py-1.5 font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="font-mono tabular-nums text-zinc-200">
          {rows.map((row) => (
            <tr key={`${row.dimension}-${row.bucket}`} className="border-b border-zinc-800/60">
              <td className="px-2 py-1.5 font-sans">{bucketLabel(row.dimension, row.bucket)}</td>
              <td className="px-2 py-1.5">{formatInteger(row.n)}</td>
              <td className="px-2 py-1.5">{formatNumber(row.avgPlayResult)}</td>
              <td className="px-2 py-1.5">{formatNumber(row.leagueMedian)}</td>
              <td className="px-2 py-1.5">{formatSigned(row.diff)}</td>
              <td className="px-2 py-1.5">{formatInterval(row.ci)}</td>
              <td className="px-2 py-1.5">{formatPercentile(row.percentile)}</td>
              <td className="px-2 py-1.5">{formatShare(row.explosiveRate)}</td>
              <td className="px-2 py-1.5">{formatShare(row.negativeRate)}</td>
              <td className="px-2 py-1.5 font-sans"><SampleBadge flag={row.sampleFlag} /></td>
              <td className="px-2 py-1.5 font-sans"><VerdictBadge verdict={row.verdict} /></td>
              <td className="px-2 py-1.5 font-sans">
                {onSelectNeed && row.sampleFlag === 'ok' && (
                  <button
                    type="button"
                    onClick={() => onSelectNeed({ dimension: row.dimension, bucket: row.bucket, perspective })}
                    className="rounded border border-emerald-700 px-2 py-0.5 text-[11px] text-emerald-300 hover:bg-emerald-900/40"
                  >
                    Usar como necesidad
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
