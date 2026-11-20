import type { Diagnosis, Meta, ScenarioNeed } from '../../types/api'
import { FindingsPanel } from '../../components/FindingsPanel'
import { NoticeList } from '../../components/NoticeList'
import { OutcomeMix } from '../../components/OutcomeMix'
import { SummaryCard } from '../../components/SummaryCard'
import { SegmentExplorer } from './SegmentExplorer'

interface DiagnosisViewProps {
  diagnosis: Diagnosis
  meta: Meta
  onSelectNeed: (need: ScenarioNeed) => void
}

export function DiagnosisView({ diagnosis, meta, onSelectNeed }: DiagnosisViewProps) {
  const { team, perspective } = diagnosis
  return (
    <div className="space-y-4">
      <SummaryCard diagnosis={diagnosis} />
      <div className="grid gap-4 xl:grid-cols-2">
        <FindingsPanel
          title="Áreas de atención"
          subtitle="Tendencias observadas en la muestra, no debilidades confirmadas."
          findings={diagnosis.attention}
          perspective={perspective}
          thresholds={meta.thresholds}
          onSelectNeed={onSelectNeed}
        />
        <FindingsPanel
          title="Fortalezas"
          subtitle="Tendencias observadas. No demuestran que alguien sea prescindible."
          findings={diagnosis.strengths}
          perspective={perspective}
          thresholds={meta.thresholds}
        />
      </div>
      <SegmentExplorer
        key={`${team}-${perspective}`}
        team={team}
        perspective={perspective}
        dimensions={meta.dimensions}
        onSelectNeed={onSelectNeed}
      />
      <OutcomeMix items={diagnosis.outcomeMix} />
      <NoticeList title="Advertencias del diagnóstico" items={diagnosis.caveats} />
    </div>
  )
}
