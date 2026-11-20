import type { ManualRecord, ScenarioNeed, ScenarioRequest, Strategy } from '../types/api'

export const NOTE_MAX_LENGTH = 280

export interface ScenarioFormState {
  strategy: Strategy | ''
  targetPosition: string
  partnerTeam: string
  includeRecord: boolean
  recordSeason: string
  wins: string
  losses: string
  ties: string
  futureAssetNote: string
}

export function createInitialForm(season: number): ScenarioFormState {
  return {
    strategy: '',
    targetPosition: '',
    partnerTeam: '',
    includeRecord: false,
    recordSeason: String(season),
    wins: '',
    losses: '',
    ties: '',
    futureAssetNote: '',
  }
}

/** Entero no negativo escrito por el usuario, o null si no es válido. */
function parseCount(text: string): number | null {
  return /^\d{1,3}$/.test(text.trim()) ? Number(text.trim()) : null
}

export function validateScenarioForm(form: ScenarioFormState, need: ScenarioNeed | null): string[] {
  const errors: string[] = []
  if (!need) errors.push('Elige una necesidad: selecciona un hallazgo o un segmento del diagnóstico.')
  if (form.strategy === '') errors.push('Elige una estrategia: competir ahora o reconstruir.')
  if (form.futureAssetNote.length > NOTE_MAX_LENGTH) {
    errors.push(`La descripción del activo futuro no puede pasar de ${NOTE_MAX_LENGTH} caracteres.`)
  }
  if (form.includeRecord) {
    if (parseCount(form.recordSeason) === null) errors.push('La temporada del récord debe ser un número.')
    if (parseCount(form.wins) === null) errors.push('Las victorias deben ser un entero igual o mayor que 0.')
    if (parseCount(form.losses) === null) errors.push('Las derrotas deben ser un entero igual o mayor que 0.')
    if (form.ties.trim() !== '' && parseCount(form.ties) === null) {
      errors.push('Los empates deben ser un entero igual o mayor que 0.')
    }
  }
  return errors
}

function buildRecord(form: ScenarioFormState): ManualRecord | undefined {
  if (!form.includeRecord) return undefined
  const season = parseCount(form.recordSeason)
  const wins = parseCount(form.wins)
  const losses = parseCount(form.losses)
  if (season === null || wins === null || losses === null) return undefined
  const ties = parseCount(form.ties)
  return ties === null ? { season, wins, losses } : { season, wins, losses, ties }
}

/** Convierte un formulario ya validado en la petición del contrato. */
export function buildScenarioRequest(
  team: string,
  form: ScenarioFormState,
  need: ScenarioNeed,
): ScenarioRequest | null {
  if (form.strategy === '') return null
  const note = form.futureAssetNote.trim()
  const manualRecord = buildRecord(form)
  return {
    team,
    strategy: form.strategy,
    need,
    ...(form.targetPosition !== '' && { targetPosition: form.targetPosition }),
    ...(form.partnerTeam !== '' && { partnerTeam: form.partnerTeam }),
    ...(manualRecord !== undefined && { manualRecord }),
    ...(form.strategy === 'rebuild' && note !== '' && { futureAssetNote: note }),
  }
}
