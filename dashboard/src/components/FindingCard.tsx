import type { Finding, ScenarioNeed, Perspective } from '../types/api'
import { segmentLabel } from '../lib/labels'
import { SampleBadge, VerdictBadge } from './StatusBadges'
import { SliceFigures } from './SliceFigures'

interface FindingCardProps {
  finding: Finding
  perspective: Perspective
  onSelectNeed?: (need: ScenarioNeed) => void
}

export function FindingCard({ finding, perspective, onSelectNeed }: FindingCardProps) {
  return (
    <article className="rounded-md border border-zinc-800 bg-zinc-950/60 p-3">
      <header className="mb-2 flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-zinc-500">#{finding.rank}</span>
        <h3 className="text-sm font-semibold text-zinc-100">{segmentLabel(finding.dimension, finding.bucket)}</h3>
        {finding.fallback ? <span className="rounded bg-amber-950/40 px-2 py-1 text-xs text-amber-200">Prioridad relativa · evidencia limitada</span> : <VerdictBadge verdict={finding.verdict} />}
        <SampleBadge flag={finding.sampleFlag} />
      </header>
      <SliceFigures slice={finding} />
      <p className="mt-2 text-xs text-zinc-400">{finding.explanation}</p>
      {onSelectNeed && (
        <button
          type="button"
          onClick={() => onSelectNeed({ dimension: finding.dimension, bucket: finding.bucket, perspective })}
          className="mt-3 rounded border border-emerald-700 px-2.5 py-1 text-xs font-medium text-emerald-300 hover:bg-emerald-900/40"
        >
          Usar como necesidad en el laboratorio
        </button>
      )}
    </article>
  )
}
