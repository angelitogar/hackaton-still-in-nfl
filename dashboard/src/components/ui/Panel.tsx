import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'

interface PanelProps {
  title?: string
  subtitle?: string
  actions?: ReactNode
  className?: string
  children: ReactNode
}

export function Panel({ title, subtitle, actions, className, children }: PanelProps) {
  return (
    <section className={cx('rounded-lg border border-zinc-800 bg-zinc-900/60 p-4', className)}>
      {(title || actions) && (
        <header className="mb-3 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-200">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p>}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  )
}
