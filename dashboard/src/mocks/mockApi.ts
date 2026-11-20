import { ApiRequestError } from '../api/client'
import type {
  Diagnosis,
  Dimension,
  Meta,
  Perspective,
  ScenarioPreview,
  ScenarioRequest,
  SliceTable,
} from '../types/api'
import {
  MOCK_META,
  buildDiagnosis,
  buildScenarioPreview,
  buildSliceRows,
} from './fixtures'

const LATENCY_MS = 250

function withLatency<T>(produce: () => T): Promise<T> {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      try {
        resolve(produce())
      } catch (error) {
        reject(error)
      }
    }, LATENCY_MS)
  })
}

function assertKnownTeam(team: string): void {
  if (!MOCK_META.teams.includes(team)) {
    throw new ApiRequestError('TEAM_NOT_FOUND', `El equipo ${team} no existe en la muestra.`, 404, { team })
  }
}

/** Misma firma y mismos errores que la API real del contrato. */
export const mockApi = {
  getMeta: (): Promise<Meta> => withLatency(() => MOCK_META),

  getDiagnosis: (team: string, perspective: Perspective): Promise<Diagnosis> =>
    withLatency(() => {
      assertKnownTeam(team)
      return buildDiagnosis(team, perspective)
    }),

  getSlices: (team: string, dimension: Dimension, perspective: Perspective): Promise<SliceTable> =>
    withLatency(() => {
      assertKnownTeam(team)
      return { dimension, rows: buildSliceRows(team, perspective, dimension) }
    }),

  previewScenario: (request: ScenarioRequest): Promise<ScenarioPreview> =>
    withLatency(() => {
      assertKnownTeam(request.team)
      const preview = buildScenarioPreview(request)
      const needRow = preview.evidence[0]
      if (!needRow || needRow.sampleFlag !== 'ok') {
        throw new ApiRequestError(
          'INSUFFICIENT_SAMPLE',
          'La necesidad elegida no tiene muestra suficiente para generar un escenario.',
          422,
          { need: request.need },
        )
      }
      return preview
    }),
}
