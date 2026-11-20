import type { ReactNode } from 'react'

interface FieldProps {
  label: string
  htmlFor: string
  hint?: string
  children: ReactNode
}

export function Field({ label, htmlFor, hint, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-400">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-zinc-500">{hint}</p>}
    </div>
  )
}

export const CONTROL_CLASSES =
  'w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none'
