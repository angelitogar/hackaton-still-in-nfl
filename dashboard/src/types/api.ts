// Espejo en TypeScript de docs/CONTRATO_API.md. Se cambia solo junto con el contrato.

export type Perspective = 'offense' | 'defense'
export type Strategy = 'compete' | 'rebuild'
export type Dimension =
  | 'down'
  | 'distanceBucket'
  | 'quarter'
  | 'clockWindow'
  | 'fieldZone'
  | 'offenseFormation'
  | 'playAction'
  | 'coverageType'
export type SampleFlag = 'ok' | 'low' | 'hidden'
export type Verdict = 'favorable' | 'adverse' | 'inconclusive'

export interface ConfidenceInterval {
  low: number
  high: number
}

export interface SliceMetric {
  dimension: Dimension
  bucket: string
  n: number
  avgPlayResult: number
  explosiveRate: number
  negativeRate: number
  ci: ConfidenceInterval
  leagueMedian: number
  diff: number
  percentile: number
  sampleFlag: SampleFlag
  verdict: Verdict
}

export interface Finding extends SliceMetric {
  rank: number
  explanation: string
}

export interface OutcomeShare {
  label: string
  share: number
  leagueMedian: number
  n: number
}

export interface Thresholds {
  minDisplay: number
  minFinding: number
  explosiveYards: number
}

export interface Meta {
  season: number
  weeks: { min: number; max: number }
  teams: string[]
  positions: string[]
  dimensions: Dimension[]
  thresholds: Thresholds
  dataset: { games: number; plays: number; players: number }
  limits: string[]
}

export interface Diagnosis {
  team: string
  perspective: Perspective
  season: number
  sample: { plays: number; games: number }
  summary: { avgPlayResult: number; leagueMedian: number; percentile: number }
  attention: Finding[]
  strengths: Finding[]
  outcomeMix: OutcomeShare[]
  caveats: string[]
}

export interface SliceTable {
  dimension: Dimension
  rows: SliceMetric[]
}

export interface ScenarioNeed {
  dimension: Dimension
  bucket: string
  perspective: Perspective
}

export interface ManualRecord {
  season: number
  wins: number
  losses: number
  ties?: number
}

export interface ScenarioRequest {
  team: string
  strategy: Strategy
  need: ScenarioNeed
  targetPosition?: string
  partnerTeam?: string | null
  manualRecord?: ManualRecord
  futureAssetNote?: string
}

export interface PartnerProfile {
  team: string
  slice: SliceMetric
  source: 'computed' | 'manual'
  note: string
}

export interface ScenarioPreview {
  evidence: SliceMetric[]
  partnerProfiles: PartnerProfile[]
  assumptions: string[]
  missingData: string[]
  disclaimers: string[]
}

export type ApiErrorCode =
  | 'TEAM_NOT_FOUND'
  | 'INVALID_PARAMETER'
  | 'INSUFFICIENT_SAMPLE'
  | 'DATA_UNAVAILABLE'

export interface ApiError {
  error: {
    code: ApiErrorCode
    message: string
    details: Record<string, unknown>
  }
}
