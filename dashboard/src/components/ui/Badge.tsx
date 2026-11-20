import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'

export type BadgeTone = 'neutral' | 'good' | 'bad' | 'warn' | 'info'

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: 'border-zinc-700 bg-zinc-800 text-zinc-300',
  good: 'border-emerald-700/60 bg-emerald-900/40 text-emerald-300',
  bad: 'border-rose-700/60 bg-rose-900/40 text-rose-300',
  warn: 'border-amber-600/60 bg-amber-900/30 text-amber-300',
  info: 'border-sky-700/60 bg-sky-900/30 text-sky-300',
}

interface BadgeProps {
  tone?: BadgeTone
  children: ReactNode
}

export function Badge({ tone = 'neutral', children }: BadgeProps) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide',
        TONE_CLASSES[tone],
      )}
    >
      {children}
    </span>
  )
}
