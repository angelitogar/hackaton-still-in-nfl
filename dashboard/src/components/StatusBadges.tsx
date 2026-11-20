import type { SampleFlag, Verdict } from '../types/api'
import { SAMPLE_FLAG_LABELS, VERDICT_LABELS } from '../lib/labels'
import { Badge, type BadgeTone } from './ui/Badge'

const VERDICT_TONES: Record<Verdict, BadgeTone> = {
  favorable: 'good',
  adverse: 'bad',
  inconclusive: 'neutral',
}

const SAMPLE_TONES: Record<SampleFlag, BadgeTone> = {
  ok: 'info',
  low: 'warn',
  hidden: 'neutral',
}

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  return <Badge tone={VERDICT_TONES[verdict]}>{VERDICT_LABELS[verdict]}</Badge>
}

export function SampleBadge({ flag }: { flag: SampleFlag }) {
  return <Badge tone={SAMPLE_TONES[flag]}>{SAMPLE_FLAG_LABELS[flag]}</Badge>
}
