import type { ReactNode } from 'react'

interface MetricProps {
  label: string
  value: ReactNode
  hint?: string
}

export function Metric({ label, value, hint }: MetricProps) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-zinc-500">{label}</dt>
      <dd className="font-mono text-sm tabular-nums text-zinc-100">{value}</dd>
      {hint && <p className="text-[11px] text-zinc-500">{hint}</p>}
    </div>
  )
}
