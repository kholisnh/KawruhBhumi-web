import type { ReactNode } from 'react'

export type PresetDifficulty = 'easy' | 'medium' | 'advanced'

export interface PresetCardItem {
  id: string
  label: string
  difficulty: string
  level: PresetDifficulty
  expected: string
  thumbnail: ReactNode
}

export interface CompareMetric {
  id: string
  label: string
  unit?: string
  value: number
  format?: (value: number) => string
}

export interface CompareSeries {
  name: string
  x: number[]
  y: number[]
}

export interface ComparePlotSpec {
  xTitle: string
  yTitle: string
  xType?: 'linear' | 'log'
  yType?: 'linear' | 'log'
}

export interface ComparisonSnapshot {
  scenarioLabel: string
  metrics: CompareMetric[]
  series: CompareSeries[]
  plot: ComparePlotSpec | null
}

export interface SweepParameter<TInput> {
  id: string
  label: string
  unit?: string
  min: number
  max: number
  get: (input: TInput) => number
  apply: (input: TInput, value: number) => TInput
}

export interface SweepMetric<TResult> {
  id: string
  label: string
  unit?: string
  get: (result: TResult) => number
  format?: (value: number) => string
}
