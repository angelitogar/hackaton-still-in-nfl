import { getMeta } from './api/endpoints'
import { AsyncView } from './components/ui/AsyncView'
import { Dashboard } from './features/Dashboard'
import { useAsyncData } from './hooks/useAsyncData'

export default function App() {
  const { state, reload } = useAsyncData(getMeta, [])
  return (
    <AsyncView state={state} onRetry={reload} loadingLabel="Cargando datos de la muestra…">
      {(meta) => <Dashboard meta={meta} />}
    </AsyncView>
  )
}
