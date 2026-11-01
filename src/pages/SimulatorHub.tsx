import { Link } from 'react-router-dom'
import { METHODS } from '../content/methods'
import { useI18n } from '../i18n'
import { MethodGlyph } from '../components/method/MethodGlyph'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card, Panel } from '../components/ui/Card'
import { SectionHeading } from '../components/ui/SectionHeading'
import { WorkspacePipeline } from '../components/workspace/gpr/GprPanels'

export function SimulatorHub() {
  const { d } = useI18n()
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <SectionHeading label={d.hub.label} title={d.hub.heading} subtitle={d.hub.sub} />

      <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {METHODS.map((meta) => {
          const info = d.methods.list[meta.id]
          return (
            <Card key={meta.id} hover accent={meta.accent} className="flex flex-col overflow-hidden">
              <div className="border-b border-black/8 px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-gs-ice">{info.name}</h3>
                    <p className="gs-number text-xs tracking-widest" style={{ color: meta.ink }}>
                      {info.abbr}
                    </p>
                  </div>
                  {meta.available ? (
                    <Badge color={meta.accent}>{d.hub.available}</Badge>
                  ) : (
                    <Badge soft>{d.hub.phase2}</Badge>
                  )}
                </div>
              </div>
              <div className="px-4 pt-3">
                <MethodGlyph id={meta.id} accent={meta.accent} className="h-24 w-full" />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <p className="flex-1 text-xs leading-relaxed text-gs-mist">{info.short}</p>
                <div className="mt-4">
                  {meta.available ? (
                    <Link to={meta.route}>
                      <Button variant="primary" size="sm" className="w-full">
                        {d.hub.open}
                      </Button>
                    </Link>
                  ) : (
                    <Link to={`/metode/${meta.id}`}>
                      <Button variant="secondary" size="sm" className="w-full">
                        {d.methods.theory}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        <Panel title={d.hub.pipelineTitle}>
          <WorkspacePipeline />
        </Panel>
        <Panel title={d.hub.transparencyTitle}>
          <p className="text-xs leading-relaxed text-gs-mist">{d.hub.transparencyBody}</p>
          <p className="mt-3 rounded-xl border border-gs-amber/25 bg-gs-amber/5 px-3 py-2 text-xs leading-relaxed text-gs-mist">
            {d.hub.gprNote}
          </p>
        </Panel>
      </div>
    </div>
  )
}
