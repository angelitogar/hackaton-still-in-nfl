import { Panel } from './ui/Panel'

interface NoticeListProps {
  title: string
  subtitle?: string
  items: string[]
  tone?: 'warn' | 'neutral'
}

export function NoticeList({ title, subtitle, items, tone = 'neutral' }: NoticeListProps) {
  const border = tone === 'warn' ? 'border-amber-700/50 bg-amber-950/20' : ''
  return (
    <Panel title={title} subtitle={subtitle} className={border}>
      <ul className="list-disc space-y-1.5 pl-4 text-xs text-zinc-300">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </Panel>
  )
}
