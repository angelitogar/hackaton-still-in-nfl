import type { ScenarioPreview, ScenarioRequest } from '../../types/api'
import { buildScenarioSummary } from '../../lib/scenarioSummary'
import { segmentLabel } from '../../lib/labels'
import { CopyButton } from '../../components/CopyButton'
import { NoticeList } from '../../components/NoticeList'
import { SliceFigures } from '../../components/SliceFigures'
import { SampleBadge, VerdictBadge } from '../../components/StatusBadges'
import { Badge } from '../../components/ui/Badge'
import { Panel } from '../../components/ui/Panel'
import { EmptyState } from '../../components/ui/StateViews'

interface ScenarioResultProps {
  request: ScenarioRequest
  preview: ScenarioPreview
  season: number
}

export function ScenarioResult({ request, preview, season }: ScenarioResultProps) {
  const summary = buildScenarioSummary(request, preview, season)
  return (
    <div className="space-y-4">
      <Panel title="Evidencia calculada" subtitle={`Proviene de la muestra histórica ${season}.`}>
        {preview.evidence.length === 0 ? (
          <EmptyState message="No hay evidencia calculada para esta necesidad." />
        ) : (
          <div className="space-y-3">
            {preview.evidence.map((slice) => (
              <article key={`${slice.dimension}-${slice.bucket}`} className="rounded-md border border-zinc-800 bg-zinc-950/60 p-3">
                <header className="mb-2 flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-zinc-100">{segmentLabel(slice.dimension, slice.bucket)}</h3>
                  <VerdictBadge verdict={slice.verdict} />
                  <SampleBadge flag={slice.sampleFlag} />
                </header>
                <SliceFigures slice={slice} />
              </article>
            ))}
          </div>
        )}
      </Panel>

      <Panel
        title="Perfiles históricos de equipos"
        subtitle="Describen tendencias de 2021. No indican interés, necesidad real ni disponibilidad."
      >
        {preview.partnerProfiles.length === 0 ? (
          <EmptyState message="No hay equipos con evidencia suficiente. Puedes elegir un socio a mano en el formulario." />
        ) : (
          <div className="space-y-3">
            {preview.partnerProfiles.map((profile) => (
              <article key={profile.team} className="rounded-md border border-zinc-800 bg-zinc-950/60 p-3">
                <header className="mb-2 flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-zinc-100">{profile.team}</h3>
                  <Badge tone={profile.source === 'manual' ? 'warn' : 'info'}>
                    {profile.source === 'manual' ? 'Elegido a mano' : 'Calculado'}
                  </Badge>
                  <VerdictBadge verdict={profile.slice.verdict} />
                  <SampleBadge flag={profile.slice.sampleFlag} />
                </header>
                <SliceFigures slice={profile.slice} />
                <p className="mt-2 text-xs text-zinc-400">{profile.note}</p>
              </article>
            ))}
          </div>
        )}
      </Panel>

      {preview.assumptions.length > 0 && (
        <NoticeList title="Supuestos del usuario" subtitle="Datos manuales, no verificados." items={preview.assumptions} />
      )}
      <NoticeList title="Datos que faltan para evaluar un trade real" items={preview.missingData} tone="warn" />
      <NoticeList title="Avisos" items={preview.disclaimers} tone="warn" />

      <Panel title="Resumen para copiar">
        <pre className="mb-3 max-h-64 overflow-auto whitespace-pre-wrap rounded bg-zinc-950 p-3 text-xs text-zinc-300">{summary}</pre>
        <CopyButton text={summary} label="Copiar resumen" />
      </Panel>
    </div>
  )
}
