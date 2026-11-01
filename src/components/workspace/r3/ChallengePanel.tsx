import { useI18n } from '../../../i18n'
import { Button } from '../../ui/Button'
import { Panel } from '../../ui/Card'
import { Stat } from '../../ui/Stat'
import { ChallengePlot } from './ChallengePlot'
import { feedbackFor } from './metrics'
import type { ChallengeCheck, ChallengeCurve } from './types'

export function ChallengePanel({
  target,
  active,
  stale,
  canStart,
  canCheck,
  onStart,
  onCheck,
  onReset,
}: {
  target: ChallengeCurve | null
  active: ChallengeCheck | null
  stale: boolean
  canStart: boolean
  canCheck: boolean
  onStart: () => void
  onCheck: () => void
  onReset: () => void
}) {
  const { d } = useI18n()
  const r = d.wshared.r3
  const feedback = active
    ? {
        excellent: r.challengeExcellent,
        good: r.challengeGood,
        close: r.challengeClose,
        far: r.challengeFar,
      }[feedbackFor(active.misfit)]
    : null

  return (
    <Panel
      data-r3-panel="challenge"
      title={r.challengeTitle}
      actions={
        <Button variant="secondary" size="sm" onClick={onStart} disabled={!canStart}>
          {target ? r.challengeNew : r.challengeStart}
        </Button>
      }
    >
      <p className="text-xs leading-relaxed text-gs-mist">{r.challengeSub}</p>
      {!target ? (
        <p className="mt-3 rounded-lg border border-black/8 bg-gs-deep/45 px-3 py-2 text-xs leading-relaxed text-gs-mist">
          {r.challengeEmpty}
        </p>
      ) : (
        <div className="mt-3">
          <ChallengePlot target={target} current={active?.curve ?? null} targetLabel={r.challengeTarget} currentLabel={r.challengeCurrent} />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={onCheck} disabled={!canCheck}>
              {r.challengeCheck}
            </Button>
            <Button variant="secondary" size="sm" onClick={onReset}>
              {r.challengeReset}
            </Button>
            {active && (
              <div className="flex flex-wrap items-center gap-2" data-r3-challenge-score>
                <Stat label={r.challengeScore} value={`${active.score} / 100`} />
                <Stat label={r.challengeMismatch} value={active.misfit.toFixed(1)} unit="%" />
              </div>
            )}
          </div>
          {feedback && <p className="mt-2 text-xs leading-relaxed text-gs-mist">{feedback}</p>}
          {stale && <p className="mt-2 text-xs leading-relaxed text-gs-amber">{r.challengeStale}</p>}
          <p className="mt-2 text-xs leading-relaxed text-gs-mist">{r.challengeNote}</p>
        </div>
      )}
    </Panel>
  )
}
