import type { SliceMetric } from '../types/api'
import {
  formatInteger,
  formatInterval,
  formatNumber,
  formatPercentile,
  formatShare,
  formatSigned,
} from '../lib/format'
import { Metric } from './ui/Metric'

/** Cifras de un segmento tal como las entrega la API (sin recalcular nada). */
export function SliceFigures({ slice }: { slice: SliceMetric }) {
  return (
    <dl className="grid grid-cols-3 gap-x-4 gap-y-2 sm:grid-cols-4">
      <Metric label="Jugadas (n)" value={formatInteger(slice.n)} />
      <Metric label="Media (yd)" value={formatNumber(slice.avgPlayResult)} hint="según playResult" />
      <Metric label="Mediana liga" value={formatNumber(slice.leagueMedian)} />
      <Metric label="Diferencia" value={formatSigned(slice.diff)} />
      <Metric label="IC 95 %" value={formatInterval(slice.ci)} />
      <Metric label="Percentil" value={formatPercentile(slice.percentile)} />
      <Metric label="Explosivas" value={formatShare(slice.explosiveRate)} />
      <Metric label="Negativas" value={formatShare(slice.negativeRate)} />
    </dl>
  )
}
