import { useMemo, useState } from 'react'
import { useI18n } from '../../../i18n'
import { runHvsrForward } from '../../../sim/hvsr/solver'
import type { HvsrInput, HvsrResult } from '../../../sim/hvsr/types'
import { Button } from '../../ui/Button'
import { Panel } from '../../ui/Card'
import { NumberField } from '../../ui/NumberField'
import { SelectField } from '../../ui/SelectField'
import { Stat } from '../../ui/Stat'
import { HvsrComparePlot, HvsrSweepPlot, type HvsrPinnedCurve, type HvsrSweepPoint } from './HvsrCharts'

type SweepParam = 'qs' | 'vsTop' | 'thicknessTop' | 'vsHalf'

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function sweepInput(input: HvsrInput, param: SweepParam, factor: number): { next: HvsrInput; value: number } {
  const next: HvsrInput = {
    model: { layers: input.model.layers.map((layer) => ({ ...layer })) },
    survey: { ...input.survey, noisePercent: 0 },
  }
  const first = next.model.layers[0]
  const last = next.model.layers[next.model.layers.length - 1]
  if (param === 'qs') {
    next.survey.qs = clamp(next.survey.qs * (1 + factor), 2, 200)
    return { next, value: next.survey.qs }
  }
  if (param === 'thicknessTop') {
    first.thickness = clamp(first.thickness * (1 + factor), 1, 500)
    return { next, value: first.thickness }
  }
  if (param === 'vsTop') {
    first.vs = clamp(first.vs * (1 + factor), 40, 4000)
    return { next, value: first.vs }
  }
  last.vs = clamp(last.vs * (1 + factor), 40, 4000)
  return { next, value: last.vs }
}

export function HvsrComparison({
  input,
  result,
  pinned,
  onPin,
  onClear,
}: {
  input: HvsrInput
  result: HvsrResult | null
  pinned: HvsrPinnedCurve | null
  onPin: (snapshot: HvsrPinnedCurve) => void
  onClear: () => void
}) {
  const { d } = useI18n()
  const t = d.hvsr
  const [param, setParam] = useState<SweepParam>('thicknessTop')
  const [range, setRange] = useState(40)
  const [steps, setSteps] = useState(9)

  const pin = () => {
    if (!result) return
    onPin({
      frequencies: [...result.frequencies],
      hvsr: [...result.hvsr],
      f0: result.diagnostics.f0,
      a0: result.diagnostics.a0,
    })
  }

  const sweep = useMemo<HvsrSweepPoint[] | null>(() => {
    if (!result) return null
    const count = Math.round(clamp(Number.isFinite(steps) ? steps : 9, 3, 15))
    const width = clamp(Number.isFinite(range) ? range : 40, 5, 80) / 100
    const points: HvsrSweepPoint[] = []
    for (let i = 0; i < count; i++) {
      const factor = count === 1 ? 0 : -width + (2 * width * i) / (count - 1)
      const { next, value } = sweepInput(input, param, factor)
      const curve = runHvsrForward(next)
      points.push({ value, f0: curve.diagnostics.f0, a0: curve.diagnostics.a0 })
    }
    return points
  }, [input, param, range, result, steps])

  const f0Delta = pinned ? result ? result.diagnostics.f0 - pinned.f0 : 0 : 0
  const a0Delta = pinned ? result ? result.diagnostics.a0 - pinned.a0 : 0 : 0
  const signed = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}`
  const paramOptions: Array<{ value: SweepParam; label: string }> = [
    { value: 'thicknessTop', label: t.sweepParams.thicknessTop },
    { value: 'vsTop', label: t.sweepParams.vsTop },
    { value: 'vsHalf', label: t.sweepParams.vsHalf },
    { value: 'qs', label: t.sweepParams.qs },
  ]

  return (
    <>
      <Panel
        title={t.compareTitle}
        actions={
          <Button variant="secondary" size="sm" onClick={pin} disabled={!result}>
            {pinned ? t.replacePin : t.pinResult}
          </Button>
        }
      >
        <p className="text-xs leading-relaxed text-gs-mist">{t.compareSub}</p>
        {!result ? (
          <p className="mt-3 text-xs leading-relaxed text-gs-mist">{t.pinPrompt}</p>
        ) : pinned ? (
          <div className="mt-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat label={t.pinnedA} value={pinned.f0.toFixed(3)} unit="Hz" />
              <Stat label={t.currentB} value={result.diagnostics.f0.toFixed(3)} unit="Hz" />
              <Stat label={t.f0Delta} value={signed(f0Delta)} unit="Hz" accent={f0Delta === 0 ? undefined : '#E85353'} />
              <Stat label={t.a0Delta} value={signed(a0Delta)} accent={a0Delta === 0 ? undefined : '#E85353'} />
            </div>
            <div className="mt-3">
              <HvsrComparePlot
                current={result}
                pinned={pinned}
                currentLabel={t.currentB}
                pinnedLabel={t.pinnedA}
                xTitle={t.freqAxis}
                yTitle={t.hAxis}
              />
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <p className="text-xs leading-relaxed text-gs-mist">{t.compareNote}</p>
              <Button variant="ghost" size="sm" onClick={onClear}>
                {t.clearPin}
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-xs leading-relaxed text-gs-mist">{t.compareEmpty}</p>
        )}
      </Panel>

      <Panel title={t.sweepTitle}>
        <p className="text-xs leading-relaxed text-gs-mist">{t.sweepSub}</p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SelectField label={t.sweepParam} value={param} onChange={setParam} options={paramOptions} />
          <NumberField label={t.sweepRange} value={range} onChange={setRange} unit="%" />
          <NumberField label={t.sweepSteps} value={steps} onChange={setSteps} />
        </div>
        {sweep ? (
          <div className="mt-3">
            <HvsrSweepPlot
              points={sweep}
              xTitle={paramOptions.find((option) => option.value === param)?.label ?? t.sweepParam}
              f0Label={t.sweepF0}
              a0Label={t.sweepA0}
            />
            <p className="mt-1 text-xs leading-relaxed text-gs-mist">{t.sweepNote}</p>
          </div>
        ) : (
          <p className="mt-3 text-xs leading-relaxed text-gs-mist">{t.sweepEmpty}</p>
        )}
      </Panel>
    </>
  )
}
