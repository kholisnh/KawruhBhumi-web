import { useI18n } from '../../i18n'
import type { MethodId } from '../../content/methods'
import { experimentsByMethod } from '../../content/experiments'
import { Panel } from '../ui/Card'

export function GuidedExperiments({ methodId }: { methodId: MethodId }) {
  const { d, lang } = useI18n()
  const experiments = experimentsByMethod[methodId]
  return (
    <Panel title={d.learning.guidedTitle}>
      <p className="max-w-3xl text-xs leading-relaxed text-gs-mist">{d.learning.guidedSub}</p>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {experiments.map((exp, index) => (
          <article key={exp.id} className="flex flex-col rounded-xl border border-black/10 bg-gs-deep/45 p-3.5">
            <span className="gs-number text-xs font-semibold text-gs-cyan">
              {d.learning.experiment} {index + 1}
            </span>
            <h3 className="mt-1 text-sm font-semibold text-gs-ice">{exp.title[lang]}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-gs-mist">{exp.question[lang]}</p>
            <ol className="mt-2 space-y-1 text-xs leading-relaxed text-gs-mist">
              {exp.steps.map((step, i) => (
                <li key={step.en}>
                  <span className="gs-number mr-1 font-semibold text-gs-ice">{i + 1}.</span>
                  {step[lang]}
                </li>
              ))}
            </ol>
            <p className="mt-auto pt-2 text-xs leading-relaxed text-gs-mist">
              <span className="font-semibold text-gs-amber">{d.learning.observeLabel}: </span>
              {exp.observe[lang]}
            </p>
          </article>
        ))}
      </div>
    </Panel>
  )
}
