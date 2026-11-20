import type { Finding, Perspective, ScenarioNeed, Thresholds } from '../types/api'
import { FindingCard } from './FindingCard'
import { Panel } from './ui/Panel'
import { EmptyState } from './ui/StateViews'

interface FindingsPanelProps {
  title: string
  subtitle: string
  findings: Finding[]
  perspective: Perspective
  thresholds: Thresholds
  onSelectNeed?: (need: ScenarioNeed) => void
}

export function FindingsPanel({ title, subtitle, findings, perspective, thresholds, onSelectNeed }: FindingsPanelProps) {
  return (
    <Panel title={title} subtitle={subtitle}>
      {findings.length === 0 ? (
        <EmptyState
          message={`Ningún segmento con n ≥ ${thresholds.minFinding} se separa de la referencia con claridad en esta muestra.`}
        />
      ) : (
        <div className="space-y-3">
          {findings.map((finding) => (
            <FindingCard
              key={`${finding.dimension}-${finding.bucket}`}
              finding={finding}
              perspective={perspective}
              onSelectNeed={onSelectNeed}
            />
          ))}
        </div>
      )}
    </Panel>
  )
}
