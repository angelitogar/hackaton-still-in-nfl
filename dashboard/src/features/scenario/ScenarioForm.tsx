import type { Finding, Meta, Perspective, ScenarioNeed, Strategy } from '../../types/api'
import { NOTE_MAX_LENGTH, type ScenarioFormState } from '../../lib/scenarioForm'
import { PERSPECTIVE_LABELS, STRATEGY_LABELS, segmentLabel } from '../../lib/labels'
import { cx } from '../../lib/cx'
import { CONTROL_CLASSES, Field } from '../../components/ui/Field'

interface ScenarioFormProps {
  team: string
  perspective: Perspective
  meta: Meta
  attention: Finding[]
  need: ScenarioNeed | null
  form: ScenarioFormState
  errors: string[]
  submitting: boolean
  onNeedChange: (need: ScenarioNeed) => void
  onChange: (patch: Partial<ScenarioFormState>) => void
  onSubmit: () => void
}

const STRATEGIES: Strategy[] = ['compete', 'rebuild']
const needKey = (need: ScenarioNeed): string => `${need.dimension}|${need.bucket}`

export function ScenarioForm({
  team, perspective, meta, attention, need, form, errors, submitting, onNeedChange, onChange, onSubmit,
}: ScenarioFormProps) {
  const needOptions: ScenarioNeed[] = attention.map(({ dimension, bucket }) => ({
    dimension,
    bucket,
    perspective,
  }))
  const currentIsListed = need !== null && needOptions.some((option) => needKey(option) === needKey(need))
  const partnerOptions = meta.teams.filter((abbr) => abbr !== team)

  const handleNeedSelect = (key: string): void => {
    const selected = needOptions.find((option) => needKey(option) === key)
    if (selected) onNeedChange(selected)
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <fieldset>
        <legend className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
          Estrategia (la eliges tú, no se calcula)
        </legend>
        <div className="flex gap-2">
          {STRATEGIES.map((option) => (
            <label
              key={option}
              className={cx(
                'flex cursor-pointer items-center gap-2 rounded border px-3 py-1.5 text-sm',
                form.strategy === option ? 'border-emerald-500 bg-emerald-900/30 text-emerald-200' : 'border-zinc-700 text-zinc-300',
              )}
            >
              <input
                type="radio"
                name="strategy"
                value={option}
                checked={form.strategy === option}
                onChange={() => onChange({ strategy: option })}
                className="accent-emerald-500"
              />
              {STRATEGY_LABELS[option]}
            </label>
          ))}
        </div>
      </fieldset>

      <Field label="Necesidad" htmlFor="need-select" hint="Sale de un hallazgo del diagnóstico o de un segmento que elegiste en la tabla.">
        <select
          id="need-select"
          value={need ? needKey(need) : ''}
          onChange={(event) => handleNeedSelect(event.target.value)}
          className={CONTROL_CLASSES}
        >
          {!need && <option value="">Elige una necesidad…</option>}
          {need && !currentIsListed && (
            <option value={needKey(need)}>
              {segmentLabel(need.dimension, need.bucket)} ({PERSPECTIVE_LABELS[need.perspective]}, elegido en la tabla)
            </option>
          )}
          {needOptions.map((option) => (
            <option key={needKey(option)} value={needKey(option)}>
              {segmentLabel(option.dimension, option.bucket)}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Posición objetivo (opcional)" htmlFor="position-select" hint="Dato manual: los datos no permiten atribuir la necesidad a una posición.">
          <select
            id="position-select"
            value={form.targetPosition}
            onChange={(event) => onChange({ targetPosition: event.target.value })}
            className={CONTROL_CLASSES}
          >
            <option value="">Sin especificar</option>
            {meta.positions.map((position) => (
              <option key={position} value={position}>{position}</option>
            ))}
          </select>
        </Field>
        <Field label="Equipo socio" htmlFor="partner-select" hint="Calculado: perfiles con fortaleza relacionada. Manual: eliges el equipo.">
          <select
            id="partner-select"
            value={form.partnerTeam}
            onChange={(event) => onChange({ partnerTeam: event.target.value })}
            className={CONTROL_CLASSES}
          >
            <option value="">Calcular perfiles (automático)</option>
            {partnerOptions.map((abbr) => (
              <option key={abbr} value={abbr}>{abbr}</option>
            ))}
          </select>
        </Field>
      </div>

      {form.strategy === 'rebuild' && (
        <Field
          label="Activo futuro (opcional, texto libre)"
          htmlFor="asset-note"
          hint={`Dato manual, no verificado. No se asume que ningún equipo posea esa selección. ${form.futureAssetNote.length}/${NOTE_MAX_LENGTH}`}
        >
          <textarea
            id="asset-note"
            rows={2}
            value={form.futureAssetNote}
            onChange={(event) => onChange({ futureAssetNote: event.target.value })}
            className={CONTROL_CLASSES}
          />
        </Field>
      )}

      <fieldset className="rounded border border-zinc-800 p-3">
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={form.includeRecord}
            onChange={(event) => onChange({ includeRecord: event.target.checked })}
            className="accent-emerald-500"
          />
          Agregar récord (opcional)
        </label>
        <p className="mt-1 text-[11px] text-zinc-500">
          Dato manual, no verificado. Solo da contexto a tu escenario: no influye en ningún cálculo.
        </p>
        {form.includeRecord && (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field label="Temporada" htmlFor="record-season">
              <input id="record-season" inputMode="numeric" value={form.recordSeason} onChange={(event) => onChange({ recordSeason: event.target.value })} className={CONTROL_CLASSES} />
            </Field>
            <Field label="Victorias" htmlFor="record-wins">
              <input id="record-wins" inputMode="numeric" value={form.wins} onChange={(event) => onChange({ wins: event.target.value })} className={CONTROL_CLASSES} />
            </Field>
            <Field label="Derrotas" htmlFor="record-losses">
              <input id="record-losses" inputMode="numeric" value={form.losses} onChange={(event) => onChange({ losses: event.target.value })} className={CONTROL_CLASSES} />
            </Field>
            <Field label="Empates" htmlFor="record-ties">
              <input id="record-ties" inputMode="numeric" value={form.ties} onChange={(event) => onChange({ ties: event.target.value })} className={CONTROL_CLASSES} />
            </Field>
          </div>
        )}
      </fieldset>

      {errors.length > 0 && (
        <ul role="alert" className="list-disc space-y-1 rounded border border-rose-800/70 bg-rose-950/40 p-3 pl-7 text-xs text-rose-200">
          {errors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-emerald-600 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-500 disabled:opacity-50"
      >
        {submitting ? 'Generando…' : 'Generar escenario hipotético'}
      </button>
    </form>
  )
}
