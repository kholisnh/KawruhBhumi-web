import { useI18n } from '../../i18n'
import { Panel } from '../ui/Card'
import { Button } from '../ui/Button'

export function ReportPanel() {
  const { d } = useI18n()
  return (
    <Panel title={d.wshared.reportTitle}>
      <p className="max-w-3xl text-xs leading-relaxed text-gs-mist">{d.wshared.reportBody}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" onClick={() => window.print()}>
          {d.wshared.printReport}
        </Button>
        <span className="no-print text-xs text-gs-mist">{d.wshared.printHint}</span>
      </div>
      <div className="mt-4 grid gap-2 text-xs leading-relaxed text-gs-mist sm:grid-cols-3">
        {d.wshared.reportQuestions.map((q, i) => (
          <div key={q} className="rounded-lg border border-black/10 bg-gs-deep/50 p-3">
            <span className="font-semibold text-gs-ice">{i + 1}. </span>
            {q}
          </div>
        ))}
      </div>
      <div className="mt-4 hidden grid-cols-2 gap-4 text-xs text-gs-mist print:grid">
        <div className="border-b border-black/20 pb-1">{d.wshared.reportName}</div>
        <div className="border-b border-black/20 pb-1">{d.wshared.reportDate}</div>
      </div>
    </Panel>
  )
}
