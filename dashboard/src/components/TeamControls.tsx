import type { Perspective } from '../types/api'
import { PERSPECTIVE_LABELS } from '../lib/labels'
import { cx } from '../lib/cx'
import { TeamLogo } from './TeamLogo'
import { CONTROL_CLASSES, Field } from './ui/Field'

interface TeamControlsProps {
  teams: string[]
  team: string
  perspective: Perspective
  onTeamChange: (team: string) => void
  onPerspectiveChange: (perspective: Perspective) => void
}

const PERSPECTIVES: Perspective[] = ['offense', 'defense']

export function TeamControls({ teams, team, perspective, onTeamChange, onPerspectiveChange }: TeamControlsProps) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <TeamLogo team={team} className="h-12 w-12" />
      <div className="w-40">
        <Field label="Equipo" htmlFor="team-select">
          <select
            id="team-select"
            value={team}
            onChange={(event) => onTeamChange(event.target.value)}
            className={CONTROL_CLASSES}
          >
            {teams.map((abbr) => (
              <option key={abbr} value={abbr}>
                {abbr}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div role="group" aria-label="Perspectiva" className="flex overflow-hidden rounded border border-zinc-700">
        {PERSPECTIVES.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={perspective === option}
            onClick={() => onPerspectiveChange(option)}
            className={cx(
              'px-4 py-1.5 text-sm font-medium',
              perspective === option ? 'bg-emerald-600 text-zinc-950' : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800',
            )}
          >
            {PERSPECTIVE_LABELS[option]}
          </button>
        ))}
      </div>
    </div>
  )
}
