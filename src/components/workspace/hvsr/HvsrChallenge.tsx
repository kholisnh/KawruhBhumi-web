import { useState } from 'react'
import { useI18n } from '../../../i18n'
import { runHvsrForward, modelCurve } from '../../../sim/hvsr/solver'
import type { HvsrInput, HvsrResult } from '../../../sim/hvsr/types'
import { Button } from '../../ui/Button'
import { Panel } from '../../ui/Card'
import { Stat } from '../../ui/Stat'
import { HvsrChallengePlot } from './HvsrCharts'

function mulberry32(seed: number): () => number {
  let t = seed >>> 0
  return () => {
    t |= 0
    t = (t + 0x6d2b79f5) | 0
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function perturbedTarget(input: HvsrInput): HvsrResult {
  const random = mulberry32(Date.now() % 2147483647)
  const layers = input.model.layers.map((layer, index) => {
    const isHalf = index === input.model.layers.length - 1
    return {
      ...layer,
      thickness: isHalf ? 0 : clamp(layer.thickness * (0.65 + random() * 0.7), 1, 120),
      vs: clamp(layer.vs * (0.7 + random() * 0.6), isHalf ? 250 : 60, isHalf ? 3200 : 1800),
    }
  })
  return runHvsrForward({
    model: { layers },
    survey: { ...input.survey, noisePercent: 0 },
  })
}

interface Checked {
  curve: number[]
  misfit: number
  score: number
  modelKey: string
}

export function HvsrChallenge({ input }: { input: HvsrInput }) {
  const { d } = useI18n()
  const t = d.hvsr
  const [target, setTarget] = useState<HvsrResult | null>(null)
  const [checked, setChecked] = useState<Checked | null>(null)
  const modelKey = JSON.stringify(input.model)

  const start = () => {
    setTarget(perturbedTarget(input))
    setChecked(null)
  }

  const check = () => {
    if (!target) return
    const curve = modelCurve(input.model, target.frequencies, target.survey.qs)
    let sum = 0
    for (let i = 0; i < curve.length; i++) {
      const ratio = Math.log(Math.max(curve[i], 1e-6)) - Math.log(Math.max(target.hvsr[i], 1e-6))
      sum += ratio * ratio
    }
    const misfit = 100 * Math.sqrt(sum / Math.max(1, curve.length))
    const score = Math.round(Math.max(0, Math.min(100, 100 - 3.5 * misfit)))
    setChecked({ curve, misfit, score, modelKey })
  }

  const active = checked?.modelKey === modelKey ? checked : null
  const feedback = active
    ? active.misfit <= 5
      ? t.challengeExcellent
      : active.misfit <= 10
        ? t.challengeGood
        : active.misfit <= 20
          ? t.challengeClose
          : t.challengeFar
    : null

  return (
    <Panel
      title={t.challengeTitle}
      actions={
        <Button variant="secondary" size="sm" onClick={start}>
          {target ? t.challengeNew : t.challengeStart}
        </Button>
      }
    >
      <p className="text-xs leading-relaxed text-gs-mist">{t.challengeSub}</p>
      {!target ? (
        <p className="mt-3 rounded-lg border border-black/8 bg-gs-deep/45 px-3 py-2 text-xs leading-relaxed text-gs-mist">
          {t.challengeEmpty}
        </p>
      ) : (
        <div className="mt-3">
          <HvsrChallengePlot
            target={target}
            current={active?.curve ?? null}
            targetLabel={t.challengeTarget}
            currentLabel={t.challengeCurrent}
            xTitle={t.freqAxis}
            yTitle={t.hAxis}
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={check}>
              {t.challengeCheck}
            </Button>
            {active && (
              <>
                <Stat label={t.challengeScore} value={`${active.score} / 100`} />
                <Stat label={t.challengeMismatch} value={active.misfit.toFixed(1)} unit="%" />
              </>
            )}
          </div>
          {feedback && <p className="mt-2 text-xs leading-relaxed text-gs-mist">{feedback}</p>}
          <p className="mt-2 text-xs leading-relaxed text-gs-mist">{t.challengeNote}</p>
        </div>
      )}
    </Panel>
  )
}
