import { useState } from 'react'
import { getDiagnosis } from '../api/endpoints'
import { AppHeader } from '../components/AppHeader'
import { MockBanner } from '../components/MockBanner'
import { Tabs, type TabOption } from '../components/Tabs'
import { TeamControls } from '../components/TeamControls'
import { AsyncView } from '../components/ui/AsyncView'
import { useAsyncData } from '../hooks/useAsyncData'
import type { Meta, Perspective, ScenarioNeed } from '../types/api'
import { DiagnosisView } from './diagnosis/DiagnosisView'
import { ScenarioLab } from './scenario/ScenarioLab'

type TabId = 'diagnosis' | 'lab'

const TABS: TabOption<TabId>[] = [
  { id: 'diagnosis', label: 'Diagnóstico' },
  { id: 'lab', label: 'Laboratorio de escenario' },
]

export function Dashboard({ meta }: { meta: Meta }) {
  const [team, setTeam] = useState<string>(meta.teams[0] ?? '')
  const [perspective, setPerspective] = useState<Perspective>('offense')
  const [tab, setTab] = useState<TabId>('diagnosis')
  const [need, setNeed] = useState<ScenarioNeed | null>(null)
  const { state, reload } = useAsyncData(() => getDiagnosis(team, perspective), [team, perspective])

  const resetNeed = (): void => setNeed(null)

  const handleSelectNeed = (selected: ScenarioNeed): void => {
    setNeed(selected)
    setTab('lab')
  }

  return (
    <div className="min-h-screen">
      <MockBanner />
      <AppHeader meta={meta} />
      <div className="mx-auto max-w-[1400px] px-6 py-5">
        <main className="min-w-0 space-y-4">
          <TeamControls
            teams={meta.teams}
            team={team}
            perspective={perspective}
            onTeamChange={(next) => {
              setTeam(next)
              resetNeed()
            }}
            onPerspectiveChange={(next) => {
              setPerspective(next)
              resetNeed()
            }}
          />
          <Tabs options={TABS} active={tab} onChange={setTab} />
          {tab === 'diagnosis' && (
            <AsyncView state={state} onRetry={reload} loadingLabel="Cargando diagnóstico…">
              {(diagnosis) => <DiagnosisView diagnosis={diagnosis} meta={meta} onSelectNeed={handleSelectNeed} />}
            </AsyncView>
          )}
          {tab === 'lab' && (
            <ScenarioLab
              key={`${team}-${perspective}`}
              meta={meta}
              diagnosis={state.status === 'success' && state.data.team === team && state.data.perspective === perspective ? state.data : null}
              need={need}
              onNeedChange={setNeed}
            />
          )}
        </main>
      </div>
    </div>
  )
}
