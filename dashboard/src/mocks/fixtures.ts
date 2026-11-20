/**
 * DATOS DE DEMOSTRACIÓN. No provienen de data/*.csv ni son resultados reales.
 * Solo reproducen la forma de docs/CONTRATO_API.md para desarrollar la interfaz
 * antes de que existan los endpoints. Esta lógica NO forma parte del producto:
 * el análisis real vive en el backend.
 */
import type {
  Diagnosis,
  Dimension,
  Finding,
  Meta,
  OutcomeShare,
  PartnerProfile,
  Perspective,
  ScenarioPreview,
  ScenarioRequest,
  SliceMetric,
  Thresholds,
} from '../types/api'
import { randomFor } from './random'

export const MOCK_THRESHOLDS: Thresholds = { minDisplay: 20, minFinding: 50, explosiveYards: 20 }

const MOCK_TEAMS: string[] = [
  'ARI', 'ATL', 'BAL', 'BUF', 'CAR', 'CHI', 'CIN', 'CLE', 'DAL', 'DEN', 'DET', 'GB', 'HOU', 'IND', 'JAX', 'KC',
  'LA', 'LAC', 'LV', 'MIA', 'MIN', 'NE', 'NO', 'NYG', 'NYJ', 'PHI', 'PIT', 'SEA', 'SF', 'TB', 'TEN', 'WAS',
]

const MOCK_DIMENSIONS: Dimension[] = [
  'down', 'distanceBucket', 'quarter', 'clockWindow', 'fieldZone', 'offenseFormation', 'playAction', 'coverageType',
]

const MOCK_BUCKETS: Record<Dimension, string[]> = {
  down: ['1', '2', '3', '4'],
  distanceBucket: ['short', 'medium', 'long'],
  quarter: ['1', '2', '3', '4'],
  clockWindow: ['q4Last5', 'q4Full', 'rest'],
  fieldZone: ['ownTerritory', 'opponentTerritory', 'redZone'],
  offenseFormation: ['SHOTGUN', 'EMPTY', 'SINGLEBACK'],
  playAction: ['0', '1'],
  coverageType: ['Man', 'Zone', 'Other'],
}

export const MOCK_META: Meta = {
  season: 2021,
  weeks: { min: 1, max: 8 },
  teams: MOCK_TEAMS,
  positions: ['QB', 'RB', 'WR', 'TE', 'T', 'G', 'C', 'DE', 'DT', 'NT', 'OLB', 'CB', 'FS', 'SS'],
  dimensions: MOCK_DIMENSIONS,
  thresholds: MOCK_THRESHOLDS,
  dataset: { games: 122, plays: 8557, players: 1679 },
  limits: [
    'Sin contratos, salarios ni cap: no se puede evaluar costo ni encaje salarial.',
    'Sin rosters actuales ni profundidad real: el archivo de jugadores no indica equipo.',
    'Sin agentes libres, disponibilidad ni lesiones.',
    'Sin selecciones de draft, su propiedad ni su valor.',
    'Sin valor de mercado ni criterio de equidad para evaluar un trade.',
    'Sin datos de equipos especiales.',
    'Los códigos de resultado (C, I, S, R, IN) y los campos PFF no tienen diccionario: se muestran como etiquetas crudas.',
    'Muestra histórica de 2021, semanas 1 a 8: no describe la situación actual de ningún equipo.',
  ],
}

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value))

/** Devuelve null cuando la muestra es demasiado pequeña (el contrato no devuelve filas ocultas). */
function buildSliceRow(
  team: string,
  perspective: Perspective,
  dimension: Dimension,
  bucket: string,
): SliceMetric | null {
  const league = randomFor(`${perspective}|${dimension}|${bucket}`)
  const own = randomFor(`${team}|${perspective}|${dimension}|${bucket}`)
  const leagueMedian = 4.5 + league() * 2.5
  const n = 12 + Math.floor(own() * 150)
  if (n < MOCK_THRESHOLDS.minDisplay) return null

  const avgPlayResult = leagueMedian + (own() - 0.5) * 3.6
  const standardError = (6.5 + own() * 3) / Math.sqrt(n)
  const ci = { low: avgPlayResult - 1.96 * standardError, high: avgPlayResult + 1.96 * standardError }
  const diff = avgPlayResult - leagueMedian
  const excludesMedian = leagueMedian < ci.low || leagueMedian > ci.high
  const lowerIsWorse = perspective === 'offense'
  const isWorse = lowerIsWorse ? diff < 0 : diff > 0

  return {
    dimension,
    bucket,
    n,
    avgPlayResult,
    explosiveRate: 0.04 + own() * 0.12,
    negativeRate: 0.05 + own() * 0.15,
    ci,
    leagueMedian,
    diff,
    percentile: clamp(50 + (lowerIsWorse ? diff : -diff) * 18, 1, 99),
    sampleFlag: n < MOCK_THRESHOLDS.minFinding ? 'low' : 'ok',
    verdict: !excludesMedian ? 'inconclusive' : isWorse ? 'adverse' : 'favorable',
  }
}

export function buildSliceRows(team: string, perspective: Perspective, dimension: Dimension): SliceMetric[] {
  return MOCK_BUCKETS[dimension]
    .map((bucket) => buildSliceRow(team, perspective, dimension, bucket))
    .filter((row): row is SliceMetric => row !== null)
}

function toFinding(row: SliceMetric, rank: number): Finding {
  const explanation =
    row.verdict === 'adverse'
      ? 'Tendencia observada en la muestra 2021: el resultado queda por debajo de la referencia. No es una debilidad confirmada.'
      : 'Tendencia observada en la muestra 2021: el resultado queda por encima de la referencia. No implica profundidad de plantilla.'
  return { ...row, rank, explanation }
}

function pickFindings(rows: SliceMetric[], verdict: 'adverse' | 'favorable'): Finding[] {
  return rows
    .filter((row) => row.sampleFlag === 'ok' && row.verdict === verdict)
    .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
    .slice(0, 3)
    .map((row, index) => toFinding(row, index + 1))
}

const MOCK_OUTCOME_LEAGUE: Array<{ label: string; share: number }> = [
  { label: 'C', share: 0.54 },
  { label: 'I', share: 0.32 },
  { label: 'S', share: 0.063 },
  { label: 'R', share: 0.052 },
  { label: 'IN', share: 0.022 },
]

export function buildDiagnosis(team: string, perspective: Perspective): Diagnosis {
  const random = randomFor(`diagnosis|${team}|${perspective}`)
  const allRows = MOCK_DIMENSIONS.flatMap((dimension) => buildSliceRows(team, perspective, dimension))
  const plays = 230 + Math.floor(random() * 90)
  const outcomeMix: OutcomeShare[] = MOCK_OUTCOME_LEAGUE.map(({ label, share }) => ({
    label,
    share: clamp(share + (random() - 0.5) * 0.06, 0.005, 0.9),
    leagueMedian: share,
    n: plays,
  }))
  const leagueMedian = 5.6
  const avgPlayResult = leagueMedian + (random() - 0.5) * 2
  return {
    team,
    perspective,
    season: MOCK_META.season,
    sample: { plays, games: 6 + Math.floor(random() * 3) },
    summary: { avgPlayResult, leagueMedian, percentile: Math.round(clamp(50 + (avgPlayResult - leagueMedian) * 25, 1, 99)) },
    attention: pickFindings(allRows, 'adverse'),
    strengths: pickFindings(allRows, 'favorable'),
    outcomeMix,
    caveats: [
      'Datos de demostración: no son resultados reales.',
      'Los hallazgos son tendencias observadas en una muestra histórica de 2021, no debilidades confirmadas.',
      'Se revisaron muchos segmentos a la vez: algunas diferencias pueden deberse al azar.',
    ],
  }
}

const MOCK_MISSING: string[] = MOCK_META.limits.slice(0, 5)

const MOCK_DISCLAIMERS: string[] = [
  'Escenario hipotético: no es una recomendación de trade.',
  'No se afirma disponibilidad, valor de mercado, viabilidad ni aceptación de otro equipo.',
  'Los perfiles de equipos describen tendencias históricas de 2021, no interés ni necesidades reales.',
]

export function buildScenarioPreview(request: ScenarioRequest): ScenarioPreview {
  const { team, need, partnerTeam } = request
  const needRow = buildSliceRows(team, need.perspective, need.dimension).find((row) => row.bucket === need.bucket)
  const partnerPerspective: Perspective = need.perspective
  const partnerRow = (candidate: string): SliceMetric | undefined =>
    buildSliceRows(candidate, partnerPerspective, need.dimension).find((row) => row.bucket === need.bucket)

  const partnerProfiles: PartnerProfile[] = []
  if (partnerTeam) {
    const slice = partnerRow(partnerTeam)
    if (slice) {
      partnerProfiles.push({
        team: partnerTeam,
        slice,
        source: 'manual',
        note: 'Socio elegido por el usuario. Perfil histórico 2021; no implica interés ni disponibilidad.',
      })
    }
  } else {
    MOCK_TEAMS.filter((candidate) => candidate !== team)
      .flatMap((candidate) => {
        const slice = partnerRow(candidate)
        return slice && slice.sampleFlag === 'ok' && slice.verdict === 'favorable' ? [{ candidate, slice }] : []
      })
      .sort((a, b) => b.slice.percentile - a.slice.percentile)
      .slice(0, 3)
      .forEach(({ candidate, slice }) =>
        partnerProfiles.push({
          team: candidate,
          slice,
          source: 'computed',
          note: 'Perfil histórico 2021 con fortaleza relacionada; no implica interés ni disponibilidad.',
        }),
      )
  }

  const assumptions: string[] = ['Estrategia elegida por el usuario (dato manual, no verificado).']
  if (request.targetPosition) assumptions.push(`Posición objetivo: ${request.targetPosition} (dato manual, no verificado).`)
  if (partnerTeam) assumptions.push(`Socio elegido a mano: ${partnerTeam} (dato manual, no verificado).`)
  if (request.manualRecord) {
    const { season, wins, losses, ties } = request.manualRecord
    assumptions.push(`Récord ${wins}-${losses}${ties ? `-${ties}` : ''} de la temporada ${season} (dato manual, no verificado; no influye en los cálculos).`)
  }
  if (request.futureAssetNote) assumptions.push(`Activo futuro descrito por el usuario: «${request.futureAssetNote}» (dato manual, no verificado).`)

  return {
    evidence: needRow ? [needRow] : [],
    partnerProfiles,
    assumptions,
    missingData: MOCK_MISSING,
    disclaimers: MOCK_DISCLAIMERS,
  }
}
