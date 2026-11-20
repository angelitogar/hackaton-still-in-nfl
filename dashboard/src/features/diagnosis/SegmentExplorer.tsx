import { useState } from 'react'
import { getSlices } from '../../api/endpoints'
import { useAsyncData } from '../../hooks/useAsyncData'
import { DIMENSION_LABELS } from '../../lib/labels'
import type { Dimension, Perspective, ScenarioNeed } from '../../types/api'
import { SliceChart } from '../../components/SliceChart'
import { SliceTable } from '../../components/SliceTable'
import { AsyncView } from '../../components/ui/AsyncView'
import { CONTROL_CLASSES, Field } from '../../components/ui/Field'
import { Panel } from '../../components/ui/Panel'
import { EmptyState } from '../../components/ui/StateViews'

interface SegmentExplorerProps {
  team: string
  perspective: Perspective
  dimensions: Dimension[]
  onSelectNeed: (need: ScenarioNeed) => void
}

export function SegmentExplorer({ team, perspective, dimensions, onSelectNeed }: SegmentExplorerProps) {
  const [dimension, setDimension] = useState<Dimension>(dimensions[0] ?? 'down')
  const { state, reload } = useAsyncData(() => getSlices(team, dimension, perspective), [team, dimension, perspective])

  return (
    <Panel
      title="Explorador de segmentos"
      subtitle="Compara el equipo con la mediana de la liga. Las filas con muestra baja no pueden ser hallazgos."
      actions={
        <div className="w-56">
          <Field label="Segmento" htmlFor="dimension-select">
            <select
              id="dimension-select"
              value={dimension}
              onChange={(event) => setDimension(event.target.value as Dimension)}
              className={CONTROL_CLASSES}
            >
              {dimensions.map((option) => (
                <option key={option} value={option}>{DIMENSION_LABELS[option]}</option>
              ))}
            </select>
          </Field>
        </div>
      }
    >
      <AsyncView state={state} onRetry={reload} loadingLabel="Cargando segmentos…">
        {(table) =>
          table.rows.length === 0 ? (
            <EmptyState message="Este segmento no tiene muestra suficiente para mostrarse." />
          ) : (
            <div className="space-y-4">
              <SliceChart rows={table.rows} teamLabel={team} />
              <SliceTable rows={table.rows} perspective={perspective} onSelectNeed={onSelectNeed} />
            </div>
          )
        }
      </AsyncView>
    </Panel>
  )
}
