import { useCallback, useEffect, useState } from 'react'
import { ApiRequestError } from '../api/client'

export interface AsyncErrorInfo {
  code: string
  message: string
}

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: AsyncErrorInfo }
  | { status: 'success'; data: T }

export function toErrorInfo(error: unknown): AsyncErrorInfo {
  if (error instanceof ApiRequestError) return { code: error.code, message: error.message }
  if (error instanceof Error) return { code: 'UNEXPECTED_ERROR', message: error.message }
  return { code: 'UNEXPECTED_ERROR', message: 'Ocurrió un error inesperado.' }
}

/** Carga datos al montar y cada vez que cambian las dependencias. */
export function useAsyncData<T>(
  load: () => Promise<T>,
  deps: readonly unknown[],
): { state: AsyncState<T>; reload: () => void } {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' })
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let active = true
    setState({ status: 'loading' })
    load().then(
      (data) => {
        if (active) setState({ status: 'success', data })
      },
      (error: unknown) => {
        if (active) setState({ status: 'error', error: toErrorInfo(error) })
      },
    )
    return () => {
      active = false
    }
    // `load` se recrea en cada render; las dependencias reales se pasan en `deps`.
  }, [...deps, reloadToken])

  const reload = useCallback(() => setReloadToken((token) => token + 1), [])
  return { state, reload }
}
