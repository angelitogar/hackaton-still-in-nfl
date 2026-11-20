import type { ApiError, ApiErrorCode } from '../types/api'

export type RequestErrorCode = ApiErrorCode | 'NETWORK_ERROR' | 'UNEXPECTED_RESPONSE'

export class ApiRequestError extends Error {
  readonly code: RequestErrorCode
  readonly status: number | null
  readonly details: Record<string, unknown>

  constructor(
    code: RequestErrorCode,
    message: string,
    status: number | null = null,
    details: Record<string, unknown> = {},
  ) {
    super(message)
    this.name = 'ApiRequestError'
    this.code = code
    this.status = status
    this.details = details
  }
}

const API_ERROR_CODES: readonly string[] = [
  'TEAM_NOT_FOUND',
  'INVALID_PARAMETER',
  'INSUFFICIENT_SAMPLE',
  'DATA_UNAVAILABLE',
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isApiError(value: unknown): value is ApiError {
  if (!isRecord(value) || !isRecord(value.error)) return false
  const { code, message } = value.error
  return typeof code === 'string' && API_ERROR_CODES.includes(code) && typeof message === 'string'
}

/** Las rutas deben ser relativas y sin diagonal inicial para funcionar en una subruta. */
function assertRelativePath(path: string): void {
  if (path.startsWith('/') || path.includes('://')) {
    throw new Error(`Ruta de API no válida (debe ser relativa, sin diagonal inicial): ${path}`)
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  assertRelativePath(path)
  let response: Response
  try {
    response = await fetch(path, init)
  } catch {
    throw new ApiRequestError('NETWORK_ERROR', 'No se pudo contactar con el servidor.')
  }
  const payload: unknown = await response.json().catch((): null => null)
  if (!response.ok) {
    if (isApiError(payload)) {
      const { code, message, details } = payload.error
      throw new ApiRequestError(code, message, response.status, details)
    }
    throw new ApiRequestError(
      'UNEXPECTED_RESPONSE',
      `El servidor respondió con un error inesperado (${response.status}).`,
      response.status,
    )
  }
  if (payload === null) {
    throw new ApiRequestError('UNEXPECTED_RESPONSE', 'El servidor devolvió una respuesta vacía.', response.status)
  }
  return payload as T
}

export function apiGet<T>(path: string, query?: Record<string, string>): Promise<T> {
  const search = query ? `?${new URLSearchParams(query).toString()}` : ''
  return request<T>(`${path}${search}`)
}

export function apiPost<T, B>(path: string, body: B): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
