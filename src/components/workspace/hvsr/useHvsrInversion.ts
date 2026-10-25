import { useCallback, useEffect, useRef, useState } from 'react'
import type { HvsrInversionResult, HvsrInversionSettings, HvsrModel } from '../../../sim/hvsr/types'
import type { HvsrWorkerRequest, HvsrWorkerResponse } from '../../../sim/hvsr/inversion.worker'
import HvsrInversionWorker from '../../../sim/hvsr/inversion.worker?worker&inline'

interface InversionState {
  running: boolean
  progress: number
  result: HvsrInversionResult | null
  error: string | null
}

export function useHvsrInversion() {
  const [state, setState] = useState<InversionState>({ running: false, progress: 0, result: null, error: null })
  const workerRef = useRef<Worker | null>(null)

  const cancel = useCallback(() => {
    workerRef.current?.terminate()
    workerRef.current = null
    setState((s) => ({ ...s, running: false }))
  }, [])

  const reset = useCallback(() => {
    workerRef.current?.terminate()
    workerRef.current = null
    setState({ running: false, progress: 0, result: null, error: null })
  }, [])

  const run = useCallback(
    (request: { observed: number[]; frequencies: number[]; qs: number; settings: HvsrInversionSettings; initialModel?: HvsrModel }) => {
      workerRef.current?.terminate()
      const worker = new HvsrInversionWorker()
      workerRef.current = worker
      setState({ running: true, progress: 0, result: null, error: null })
      worker.onmessage = (event: MessageEvent<HvsrWorkerResponse>) => {
        const message = event.data
        if (message.type === 'progress') setState((s) => ({ ...s, progress: message.value }))
        if (message.type === 'done') {
          setState({ running: false, progress: 1, result: message.result, error: null })
          worker.terminate()
          workerRef.current = null
        }
        if (message.type === 'error') {
          setState({ running: false, progress: 0, result: null, error: message.message })
          worker.terminate()
          workerRef.current = null
        }
      }
      worker.onerror = (event) => {
        setState({ running: false, progress: 0, result: null, error: event.message || 'Worker error' })
        worker.terminate()
        workerRef.current = null
      }
      worker.postMessage(request satisfies HvsrWorkerRequest)
    },
    [],
  )

  useEffect(() => () => workerRef.current?.terminate(), [])

  return { ...state, run, cancel, reset }
}
