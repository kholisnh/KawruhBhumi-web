import { useState } from 'react'
import type { MethodId } from '../../content/methods'
import { copyText, scenarioUrl } from '../../lib/permalink'
import { useI18n } from '../../i18n'
import { Button } from './Button'

export function ShareButton({ methodId, scenarioId, input }: { methodId: MethodId; scenarioId: string; input: unknown }) {
  const { d } = useI18n()
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')

  const share = async () => {
    const url = scenarioUrl(methodId, scenarioId, input)
    const ok = await copyText(url)
    setState(ok ? 'copied' : 'failed')
    window.setTimeout(() => setState('idle'), 2200)
  }

  return (
    <Button variant="secondary" size="sm" onClick={share} title={d.wshared.shareHint}>
      {state === 'copied' ? d.wshared.copied : state === 'failed' ? d.wshared.shareFailed : d.wshared.share}
    </Button>
  )
}
