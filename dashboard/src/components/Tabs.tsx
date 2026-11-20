import { cx } from '../lib/cx'

export interface TabOption<T extends string> {
  id: T
  label: string
}

interface TabsProps<T extends string> {
  options: TabOption<T>[]
  active: T
  onChange: (id: T) => void
}

export function Tabs<T extends string>({ options, active, onChange }: TabsProps<T>) {
  return (
    <div role="tablist" className="flex gap-1 border-b border-zinc-800">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          role="tab"
          aria-selected={active === option.id}
          onClick={() => onChange(option.id)}
          className={cx(
            '-mb-px border-b-2 px-4 py-2 text-sm font-medium',
            active === option.id
              ? 'border-emerald-500 text-emerald-300'
              : 'border-transparent text-zinc-400 hover:text-zinc-200',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
