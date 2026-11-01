export interface ChallengeCurve {
  x: number[]
  y: number[]
  xTitle: string
  yTitle: string
  xType?: 'linear' | 'log'
  yType?: 'linear' | 'log'
}

export type ChallengeFeedback = 'excellent' | 'good' | 'close' | 'far'

export interface ChallengeCheck {
  score: number
  misfit: number
  curve: ChallengeCurve
  key: string
}
