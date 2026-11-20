import type { Diagnosis } from '../types/api'
import { PERSPECTIVE_LABELS } from '../lib/labels'
import { formatInteger, formatNumber, formatPercentile } from '../lib/format'
import { Metric } from './ui/Metric'
import { Panel } from './ui/Panel'

export function SummaryCard({ diagnosis }: { diagnosis: Diagnosis }) {
  const { summary, sample } = diagnosis
  return (
    <Panel
      title={`${diagnosis.team} · ${PERSPECTIVE_LABELS[diagnosis.perspective]}`}
      subtitle={`Muestra histórica ${diagnosis.season}. No describe la plantilla actual.`}
    >
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <Metric label="Jugadas" value={formatInteger(sample.plays)} />
        <Metric label="Juegos" value={formatInteger(sample.games)} />
        <Metric label="Media (yd)" value={formatNumber(summary.avgPlayResult)} hint="según playResult" />
        <Metric label="Mediana liga" value={formatNumber(summary.leagueMedian)} />
        <Metric label="Percentil" value={formatPercentile(summary.percentile)} />
      </dl>
    </Panel>
  )
}
