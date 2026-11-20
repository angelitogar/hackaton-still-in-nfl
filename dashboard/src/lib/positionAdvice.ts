import type { Perspective } from '../types/api'
export type Focus = 'pass' | 'run' | 'coverage' | 'passRush' | 'runDefense'
export interface PositionAdvice { position: string; weight: number }
export const FOCUS_OPTIONS: Record<Perspective, { value: Focus; label: string }[]> = {
  offense: [{ value: 'pass', label: 'Ataque por pase' }, { value: 'run', label: 'Ataque terrestre (supuesto manual)' }],
  defense: [{ value: 'coverage', label: 'Cobertura de pase' }, { value: 'passRush', label: 'Presión al pasador' }, { value: 'runDefense', label: 'Defensa terrestre (supuesto manual)' }],
}
const ADVICE: Record<Focus, PositionAdvice[]> = {
  pass: [{ position: 'QB', weight: 40 }, { position: 'OL', weight: 35 }, { position: 'WR', weight: 20 }, { position: 'TE', weight: 5 }],
  run: [{ position: 'RB', weight: 75 }, { position: 'OL', weight: 20 }, { position: 'TE', weight: 5 }],
  coverage: [{ position: 'CB', weight: 60 }, { position: 'LB', weight: 25 }, { position: 'DE', weight: 15 }],
  passRush: [{ position: 'DE', weight: 65 }, { position: 'LB', weight: 25 }, { position: 'CB', weight: 10 }],
  runDefense: [{ position: 'LB', weight: 50 }, { position: 'DE', weight: 35 }, { position: 'CB', weight: 15 }],
}
export function positionAdvice(focus: Focus): PositionAdvice[] { return ADVICE[focus] }
export function defaultFocus(perspective: Perspective): Focus { return perspective === 'offense' ? 'pass' : 'coverage' }
