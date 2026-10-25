import { runHvsrInversion } from './inversion'
import type { HvsrInversionResult, HvsrInversionSettings, HvsrModel } from './types'

export interface HvsrWorkerRequest {
  observed: number[]
  frequencies: number[]
  qs: number
  settings: HvsrInversionSettings
  initialModel?: HvsrModel
}

export type HvsrWorkerResponse =
  | { type: 'progress'; value: number }
  | { type: 'done'; result: HvsrInversionResult }
  | { type: 'error'; message: string }

const ctx = self as unknown as {
  onmessage: ((event: MessageEvent<HvsrWorkerRequest>) => void) | null
  postMessage: (message: HvsrWorkerResponse) => void
}

ctx.onmessage = (event: MessageEvent<HvsrWorkerRequest>) => {
  const request = event.data
  try {
    const result = runHvsrInversion({
      ...request.settings,
      observed: request.observed,
      frequencies: request.frequencies,
      qs: request.qs,
      initialModel: request.initialModel,
      onProgress: (value) => ctx.postMessage({ type: 'progress', value } satisfies HvsrWorkerResponse),
    })
    ctx.postMessage({ type: 'done', result } satisfies HvsrWorkerResponse)
  } catch (error) {
    ctx.postMessage({
      type: 'error',
      message: error instanceof Error ? error.message : 'Inversion failed',
    } satisfies HvsrWorkerResponse)
  }
}
