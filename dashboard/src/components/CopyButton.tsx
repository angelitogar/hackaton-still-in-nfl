import { useState } from 'react'

type CopyStatus = 'idle' | 'copied' | 'failed'

const STATUS_TEXT: Record<CopyStatus, string> = {
  idle: '',
  copied: 'Resumen copiado.',
  failed: 'No se pudo copiar automáticamente. Selecciona el texto y cópialo a mano.',
}

export function CopyButton({ text, label }: { text: string; label: string }) {
  const [status, setStatus] = useState<CopyStatus>('idle')

  const copy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text)
      setStatus('copied')
    } catch {
      setStatus('failed')
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => void copy()}
        className="rounded border border-zinc-600 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800"
      >
        {label}
      </button>
      <span role="status" className="text-xs text-zinc-400">
        {STATUS_TEXT[status]}
      </span>
    </div>
  )
}
