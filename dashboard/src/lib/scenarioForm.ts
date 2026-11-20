import { defaultFocus, positionAdvice, type Focus } from './positionAdvice'
import type { ManualRecord, ScenarioNeed, ScenarioRequest, Strategy } from '../types/api'
export interface ScenarioFormState { strategy: Strategy | ''; targetPosition: string; partnerTeam: string; includeRecord: boolean; recordSeason: string; wins: string; losses: string; ties: string; focus: Focus | '' }
export function createInitialForm(_season: number): ScenarioFormState { return { strategy: '', targetPosition: '', partnerTeam: '', includeRecord: true, recordSeason: String(new Date().getFullYear()), wins: '', losses: '', ties: '', focus: '' } }
function parseCount(text: string): number | null { return /^\d{1,4}$/.test(text.trim()) ? Number(text.trim()) : null }
export function buildRecord(form: ScenarioFormState): ManualRecord | undefined {
  if (!form.includeRecord) return undefined
  const season = parseCount(form.recordSeason), wins = parseCount(form.wins), losses = parseCount(form.losses), ties = form.ties.trim() === '' ? 0 : parseCount(form.ties)
  if (season === null || season < 1920 || season > 2100 || wins === null || losses === null || ties === null || wins + losses + ties > 17) return undefined
  return { season, wins, losses, ties }
}
export function strategyMix(record: ManualRecord): { compete: number; balanced: number; rebuild: number } | null {
  const games = record.wins + record.losses + (record.ties ?? 0)
  if (!games) return null
  const rate = (record.wins + (record.ties ?? 0) / 2) / games
  if (rate < 0.25) return { compete: 10, balanced: 25, rebuild: 65 }
  if (rate < 0.5) return { compete: 20, balanced: 45, rebuild: 35 }
  if (rate < 0.7) return { compete: 40, balanced: 45, rebuild: 15 }
  return { compete: 65, balanced: 25, rebuild: 10 }
}
export function validateScenarioForm(form: ScenarioFormState, need: ScenarioNeed | null): string[] {
  const errors: string[] = []
  if (!need) errors.push('Elige una necesidad detectada o un segmento desde el diagnóstico.')
  if (!form.strategy) errors.push('Elige una estrategia.')
  if (form.includeRecord && !buildRecord(form)) errors.push('Introduce una temporada válida y un récord de enteros no negativos con hasta 17 partidos.')
  return errors
}
export function buildScenarioRequest(team: string, form: ScenarioFormState, need: ScenarioNeed): ScenarioRequest | null {
  if (!form.strategy) return null
  const manualRecord = buildRecord(form)
  return { team, strategy: form.strategy, need, targetPosition: positionAdvice(form.focus || defaultFocus(need.perspective)).some((item) => item.position === form.targetPosition) ? form.targetPosition : positionAdvice(form.focus || defaultFocus(need.perspective))[0].position, ...(form.partnerTeam && { partnerTeam: form.partnerTeam }), ...(manualRecord && { manualRecord }) }
}
