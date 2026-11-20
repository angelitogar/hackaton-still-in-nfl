import type { ReactNode } from 'react'
import type { AsyncState } from '../../hooks/useAsyncData'
import { ErrorState, LoadingState } from './StateViews'

interface AsyncViewProps<T> {
  state: AsyncState<T>
  onRetry: () => void
  loadingLabel?: string
  children: (data: T) => ReactNode
}

export function AsyncView<T>({ state, onRetry, loadingLabel, children }: AsyncViewProps<T>) {
  if (state.status === 'loading') return <LoadingState label={loadingLabel} />
  if (state.status === 'error') return <ErrorState message={state.error.message} onRetry={onRetry} />
  return <>{children(state.data)}</>
}
