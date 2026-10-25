import { useI18n } from '../../i18n'
import type { MethodId } from '../../content/methods'
import { Panel } from '../ui/Card'

export function ReadResultCard({ methodId }: { methodId: MethodId }) {
  const { d } = useI18n()
  const points = d.wshared.reading[methodId]
  return (
    <Panel title={d.wshared.readingTitle}>
      <p className="text-xs leading-relaxed text-gs-mist">{d.wshared.readingSub}</p>
      <ul className="mt-3 space-y-2">
        {points.map((point, index) => (
          <li key={point} className="flex gap-2 text-xs leading-relaxed text-gs-mist">
            <span className="gs-number mt-px shrink-0 text-gs-cyan">{index + 1}.</span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
