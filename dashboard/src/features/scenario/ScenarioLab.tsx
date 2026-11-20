import { useMemo, useState } from 'react'
import type { Diagnosis, Meta, ScenarioNeed } from '../../types/api'
import {
  buildScenarioRequest,
  createInitialForm,
  validateScenarioForm,
  type ScenarioFormState,
} from '../../lib/scenarioForm'
import { ErrorState } from '../../components/ui/StateViews'
import { Panel } from '../../components/ui/Panel'
import { ScenarioForm } from './ScenarioForm'
import { ScenarioResult } from './ScenarioResult'
import { useScenarioPreview } from './useScenarioPreview'

interface ScenarioLabProps {
  meta: Meta
  diagnosis: Diagnosis | null
  need: ScenarioNeed | null
  onNeedChange: (need: ScenarioNeed) => void
}

export function ScenarioLab({ meta, diagnosis, need, onNeedChange }: ScenarioLabProps) {
  const [form, setForm] = useState<ScenarioFormState>(() => createInitialForm(meta.season))
  const [showErrors, setShowErrors] = useState(false)
  const { state, run } = useScenarioPreview()

  const team = diagnosis?.team ?? ''
  const errors = useMemo(() => validateScenarioForm(form, need), [form, need])

  const handleSubmit = (): void => {
    setShowErrors(true)
    if (errors.length > 0 || need === null) return
    const request = buildScenarioRequest(team, form, need)
    if (request) run(request)
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-4">
        <Panel
          title="Laboratorio de escenario"
          subtitle="Escenario hipotético: no es una recomendación de trade ni afirma disponibilidad, valor o viabilidad."
        >
          {diagnosis === null ? (
            <p className="text-sm text-zinc-500">Espera a que cargue el diagnóstico del equipo para armar un escenario.</p>
          ) : (
            <ScenarioForm
              team={team}
              perspective={diagnosis.perspective}
              meta={meta}
              attention={diagnosis.attention}
              need={need}
              form={form}
              errors={showErrors ? errors : []}
              submitting={state.status === 'loading'}
              onNeedChange={onNeedChange}
              onChange={(patch) => setForm((current) => ({ ...current, ...patch }))}
              onSubmit={handleSubmit}
            />
          )}
        </Panel>
      </div>
      <div>
        {state.status === 'idle' && (
          <p className="rounded-md border border-dashed border-zinc-700 p-4 text-sm text-zinc-500">
            El resultado aparecerá aquí, separando evidencia calculada, supuestos tuyos y datos que faltan.
          </p>
        )}
        {state.status === 'loading' && (
          <p role="status" className="animate-pulse rounded-md border border-zinc-800 p-4 text-sm text-zinc-400">
            Generando escenario…
          </p>
        )}
        {state.status === 'error' && <ErrorState message={state.error.message} />}
        {state.status === 'success' && (
          <ScenarioResult request={state.request} preview={state.data} season={meta.season} />
        )}
      </div>
    </div>
  )
}
