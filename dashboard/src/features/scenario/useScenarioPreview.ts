import { useCallback, useRef, useState } from 'react'
import { previewScenario } from '../../api/endpoints'
import { toErrorInfo, type AsyncErrorInfo } from '../../hooks/useAsyncData'
import type { ScenarioPreview, ScenarioRequest } from '../../types/api'

export type PreviewState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; error: AsyncErrorInfo }
  | { status: 'success'; request: ScenarioRequest; data: ScenarioPreview }

export function useScenarioPreview(): { state: PreviewState; run: (request: ScenarioRequest) => void } {
  const [state, setState] = useState<PreviewState>({ status: 'idle' })
  const latestCall = useRef(0)

  const run = useCallback((request: ScenarioRequest) => {
    latestCall.current += 1
    const callId = latestCall.current
    setState({ status: 'loading' })
    previewScenario(request).then(
      (data) => {
        if (callId === latestCall.current) setState({ status: 'success', request, data })
      },
      (error: unknown) => {
        if (callId === latestCall.current) setState({ status: 'error', error: toErrorInfo(error) })
      },
    )
  }, [])

  return { state, run }
}
