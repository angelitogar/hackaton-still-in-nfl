import type {
  Diagnosis,
  Dimension,
  Meta,
  Perspective,
  ScenarioPreview,
  ScenarioRequest,
  SliceTable,
} from '../types/api'
import { mockApi } from '../mocks/mockApi'
import { USE_MOCKS } from './config'
import { apiGet, apiPost } from './client'

const teamPath = (team: string): string => `api/teams/${encodeURIComponent(team)}`

export function getMeta(): Promise<Meta> {
  return USE_MOCKS ? mockApi.getMeta() : apiGet<Meta>('api/meta')
}

export function getDiagnosis(team: string, perspective: Perspective): Promise<Diagnosis> {
  return USE_MOCKS
    ? mockApi.getDiagnosis(team, perspective)
    : apiGet<Diagnosis>(`${teamPath(team)}/diagnosis`, { perspective })
}

export function getSlices(team: string, dimension: Dimension, perspective: Perspective): Promise<SliceTable> {
  return USE_MOCKS
    ? mockApi.getSlices(team, dimension, perspective)
    : apiGet<SliceTable>(`${teamPath(team)}/slices`, { dimension, perspective })
}

export function previewScenario(request: ScenarioRequest): Promise<ScenarioPreview> {
  return USE_MOCKS
    ? mockApi.previewScenario(request)
    : apiPost<ScenarioPreview, ScenarioRequest>('api/scenarios/preview', request)
}
