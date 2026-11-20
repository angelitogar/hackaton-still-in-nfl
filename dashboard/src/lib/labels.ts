import type { Dimension, Perspective, SampleFlag, Strategy, Verdict } from '../types/api'

export const DIMENSION_LABELS: Record<Dimension, string> = {
  down: 'Down',
  distanceBucket: 'Distancia por cubrir',
  quarter: 'Cuarto',
  clockWindow: 'Ventana de reloj',
  fieldZone: 'Zona de campo',
  offenseFormation: 'Formación ofensiva',
  playAction: 'Play action',
  coverageType: 'Tipo de cobertura (PFF)',
}

/**
 * Etiquetas legibles para los valores de `bucket` conocidos. Los valores exactos los define
 * el backend (pendiente en el contrato); cualquier valor desconocido se muestra tal cual.
 */
const BUCKET_LABELS: Partial<Record<Dimension, Record<string, string>>> = {
  down: { '1': '1.º down', '2': '2.º down', '3': '3.er down', '4': '4.º down' },
  distanceBucket: { short: 'Distancia corta', medium: 'Distancia media', long: 'Distancia larga' },
  quarter: { '1': 'Cuarto 1', '2': 'Cuarto 2', '3': 'Cuarto 3', '4': 'Cuarto 4', '5': 'Cuarto 5' },
  clockWindow: {
    q4Last5: 'Cuarto 4, últimos 5 min',
    q4Full: 'Cuarto 4, antes de los últimos 5 min',
    rest: 'Resto del juego',
  },
  fieldZone: {
    ownTerritory: 'Campo propio',
    opponentTerritory: 'Campo rival',
    redZone: 'Zona roja',
  },
  playAction: { '0': 'Sin play action', '1': 'Con play action' },
}

export function bucketLabel(dimension: Dimension, bucket: string): string {
  return BUCKET_LABELS[dimension]?.[bucket] ?? bucket
}

export function segmentLabel(dimension: Dimension, bucket: string): string {
  return `${DIMENSION_LABELS[dimension]}: ${bucketLabel(dimension, bucket)}`
}

export const PERSPECTIVE_LABELS: Record<Perspective, string> = {
  offense: 'Ataque',
  defense: 'Defensa',
}

export const STRATEGY_LABELS: Record<Strategy, string> = {
  compete: 'Competir ahora',
  balanced: 'Competir y construir',
  rebuild: 'Reconstruir',
}

export const VERDICT_LABELS: Record<Verdict, string> = {
  favorable: 'Favorable',
  adverse: 'Adverso',
  inconclusive: 'No concluyente',
}

export const SAMPLE_FLAG_LABELS: Record<SampleFlag, string> = {
  ok: 'Muestra suficiente',
  low: 'Muestra baja',
  hidden: 'Oculto',
}
