import type { Finding, Meta, Perspective, ScenarioNeed, Strategy } from '../../types/api'
import { buildRecord, strategyMix, type ScenarioFormState } from '../../lib/scenarioForm'
import { PERSPECTIVE_LABELS, STRATEGY_LABELS, segmentLabel } from '../../lib/labels'
import { defaultFocus, FOCUS_OPTIONS, positionAdvice, type Focus } from '../../lib/positionAdvice'
import { CONTROL_CLASSES, Field } from '../../components/ui/Field'
interface Props { team: string; perspective: Perspective; meta: Meta; attention: Finding[]; need: ScenarioNeed | null; form: ScenarioFormState; errors: string[]; submitting: boolean; onNeedChange: (need: ScenarioNeed) => void; onChange: (patch: Partial<ScenarioFormState>) => void; onSubmit: () => void }
const STRATEGIES: Strategy[] = ['compete', 'balanced', 'rebuild']
const key = (need: ScenarioNeed): string => `${need.dimension}|${need.bucket}`
export function ScenarioForm({ team, perspective, meta, attention, need, form, errors, submitting, onNeedChange, onChange, onSubmit }: Props) {
  const options = attention.map(({ dimension, bucket }) => ({ dimension, bucket, perspective }))
  const currentListed = need !== null && options.some((option) => key(option) === key(need))
  const record = buildRecord(form), mix = record ? strategyMix(record) : null
  const focus = form.focus || defaultFocus(perspective)
  const advice = positionAdvice(focus)
  const selectedPosition = advice.some((item) => item.position === form.targetPosition) ? form.targetPosition : advice[0].position
  return (
    <form className="space-y-5" onSubmit={(event) => { event.preventDefault(); onSubmit() }}>
      <fieldset className="rounded border border-zinc-700 bg-zinc-950/50 p-3">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-emerald-400">1 · Récord del equipo</legend>
        <p className="mb-3 text-xs text-zinc-400">Introduce el récord de {team}; orienta la estrategia sin modificar el análisis histórico.</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Field label="Temporada" htmlFor="record-season"><input id="record-season" inputMode="numeric" value={form.recordSeason} onChange={(e) => onChange({ recordSeason: e.target.value })} className={CONTROL_CLASSES} /></Field>
          <Field label="Victorias" htmlFor="record-wins"><input id="record-wins" inputMode="numeric" value={form.wins} onChange={(e) => onChange({ wins: e.target.value })} className={CONTROL_CLASSES} /></Field>
          <Field label="Derrotas" htmlFor="record-losses"><input id="record-losses" inputMode="numeric" value={form.losses} onChange={(e) => onChange({ losses: e.target.value })} className={CONTROL_CLASSES} /></Field>
          <Field label="Empates" htmlFor="record-ties"><input id="record-ties" inputMode="numeric" value={form.ties} onChange={(e) => onChange({ ties: e.target.value })} className={CONTROL_CLASSES} /></Field>
        </div>
        {mix ? <div className="mt-3 rounded bg-emerald-950/30 p-3 text-sm text-emerald-200">Orientación simulada: competir {mix.compete}% · equilibrar {mix.balanced}% · reconstruir {mix.rebuild}%<p className="mt-1 text-xs text-zinc-400">Reparto orientativo basado solo en el récord; no es probabilidad de Super Bowl ni de obtener el pick 1. Puedes elegir otra estrategia.</p></div> : <p className="mt-3 text-xs text-zinc-500">Captura victorias y derrotas para ver una orientación. Un 0-6 favorece reconstruir, pero no significa eliminación matemática.</p>}
      </fieldset>
      <fieldset><legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">2 · Elige tu estrategia</legend><div className="flex flex-wrap gap-2">{STRATEGIES.map((option) => <label key={option} className={`flex cursor-pointer items-center gap-2 rounded border px-3 py-2 text-sm ${form.strategy === option ? 'border-emerald-500 bg-emerald-900/30 text-emerald-200' : 'border-zinc-700 text-zinc-300'}`}><input type="radio" name="strategy" checked={form.strategy === option} onChange={() => onChange({ strategy: option })} className="accent-emerald-500" />{STRATEGY_LABELS[option]}</label>)}</div></fieldset>
      <Field label={`3 · Necesidad de ${team}`} htmlFor="need-select" hint="Tendencias adversas del equipo y perspectiva. También puedes elegir un segmento desde Diagnóstico."><select id="need-select" value={need ? key(need) : ''} onChange={(e) => { const selected = options.find((option) => key(option) === e.target.value); if (selected) onNeedChange(selected) }} className={CONTROL_CLASSES}>
        {!need && <option value="">{options.length ? 'Elige una necesidad…' : 'Sin necesidades detectadas en esta muestra'}</option>}
        {need && !currentListed && <option value={key(need)}>{segmentLabel(need.dimension, need.bucket)} ({PERSPECTIVE_LABELS[need.perspective]}, elegido en el diagnóstico)</option>}
        {options.map((option) => <option key={key(option)} value={key(option)}>{segmentLabel(option.dimension, option.bucket)}</option>)}
      </select></Field>
      {options.length === 0 && !need && <p className="rounded border border-amber-800/50 bg-amber-950/20 p-3 text-xs text-amber-200">No hay una tendencia adversa con suficiente evidencia para {team}. En Diagnóstico puedes elegir un segmento manualmente.</p>}
      <Field label="Área a reforzar" htmlFor="focus-select" hint="Elige el área como supuesto: el conjunto disponible no permite atribuir la necesidad a una posición ni diagnosticar carreras."><select id="focus-select" value={focus} onChange={(e) => onChange({ focus: e.target.value as Focus, targetPosition: '' })} className={CONTROL_CLASSES}>{FOCUS_OPTIONS[perspective].map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></Field>
      <Field label="Posición a buscar" htmlFor="position-select" hint="Prioridades orientativas definidas por reglas, no probabilidades ni resultados estadísticos."><select id="position-select" value={selectedPosition} onChange={(e) => onChange({ targetPosition: e.target.value })} className={CONTROL_CLASSES}>{advice.map((item) => <option key={item.position} value={item.position}>{item.position} · {item.weight}% de prioridad</option>)}</select></Field>
      <p className="text-xs text-zinc-400">Prioridades simuladas: {advice.map((item) => `${item.position} ${item.weight}%`).join(' · ')}. Selecciona una para buscar socios.</p>
      <p className="text-xs text-zinc-400">Al generar el escenario verás todos los socios ordenados por encaje y su explicación.</p>
      <p className="rounded border border-zinc-700 p-3 text-xs text-zinc-400">Simulación: jugadores y necesidades por posición ficticios; cada equipo tiene una selección por ronda. No son rosters, activos ni trades reales.</p>
      {errors.length > 0 && <ul role="alert" className="list-disc rounded border border-rose-800 bg-rose-950/40 p-3 pl-7 text-xs text-rose-200">{errors.map((error) => <li key={error}>{error}</li>)}</ul>}
      <button type="submit" disabled={submitting} className="rounded bg-emerald-600 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-500 disabled:opacity-50">{submitting ? 'Generando…' : 'Generar escenario hipotético'}</button>
    </form>
  )
}
