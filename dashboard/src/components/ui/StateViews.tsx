interface LoadingStateProps {
  label?: string
}

export function LoadingState({ label = 'Cargando…' }: LoadingStateProps) {
  return (
    <div role="status" className="animate-pulse rounded-md border border-zinc-800 bg-zinc-900/40 p-6 text-sm text-zinc-400">
      {label}
    </div>
  )
}

interface ErrorStateProps {
  message: string
  onRetry?: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className="rounded-md border border-rose-800/70 bg-rose-950/40 p-4 text-sm text-rose-200">
      <p>{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded border border-rose-700 px-3 py-1 text-xs font-medium text-rose-100 hover:bg-rose-900/60"
        >
          Reintentar
        </button>
      )}
    </div>
  )
}

interface EmptyStateProps {
  message: string
}

export function EmptyState({ message }: EmptyStateProps) {
  return <p className="rounded-md border border-dashed border-zinc-700 p-4 text-sm text-zinc-500">{message}</p>
}
