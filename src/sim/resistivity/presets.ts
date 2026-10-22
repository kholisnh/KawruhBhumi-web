import type { VesArrayType, VesLayer } from './types'

export interface VesPreset {
  id: string
  array: VesArrayType
  layers: VesLayer[]
  spacingMinM: number
  spacingMaxM: number
  spacingCount: number
  mnHalfM: number
}

export const VES_PRESETS: VesPreset[] = [
  {
    id: 'two-layer-bedrock',
    array: 'wenner',
    layers: [
      { thicknessM: 6, resistivityOhmM: 60 },
      { thicknessM: null, resistivityOhmM: 600 },
    ],
    spacingMinM: 0.5,
    spacingMaxM: 300,
    spacingCount: 30,
    mnHalfM: 0.5,
  },
  {
    id: 'three-layer-clay',
    array: 'wenner',
    layers: [
      { thicknessM: 3, resistivityOhmM: 180 },
      { thicknessM: 12, resistivityOhmM: 12 },
      { thicknessM: null, resistivityOhmM: 420 },
    ],
    spacingMinM: 0.5,
    spacingMaxM: 300,
    spacingCount: 30,
    mnHalfM: 0.5,
  },
  {
    id: 'three-layer-aquifer',
    array: 'schlumberger',
    layers: [
      { thicknessM: 2, resistivityOhmM: 45 },
      { thicknessM: 18, resistivityOhmM: 160 },
      { thicknessM: null, resistivityOhmM: 900 },
    ],
    spacingMinM: 3,
    spacingMaxM: 300,
    spacingCount: 30,
    mnHalfM: 1,
  },
  {
    id: 'four-layer-saline',
    array: 'schlumberger',
    layers: [
      { thicknessM: 1.5, resistivityOhmM: 25 },
      { thicknessM: 8, resistivityOhmM: 3 },
      { thicknessM: 20, resistivityOhmM: 70 },
      { thicknessM: null, resistivityOhmM: 320 },
    ],
    spacingMinM: 1.5,
    spacingMaxM: 300,
    spacingCount: 32,
    mnHalfM: 0.5,
  },
  {
    id: 'five-layer-layered',
    array: 'wenner',
    layers: [
      { thicknessM: 1, resistivityOhmM: 250 },
      { thicknessM: 4, resistivityOhmM: 40 },
      { thicknessM: 10, resistivityOhmM: 320 },
      { thicknessM: 25, resistivityOhmM: 15 },
      { thicknessM: null, resistivityOhmM: 800 },
    ],
    spacingMinM: 0.4,
    spacingMaxM: 400,
    spacingCount: 34,
    mnHalfM: 0.5,
  },
]

export function getVesPreset(id: string): VesPreset {
  return VES_PRESETS.find((preset) => preset.id === id) ?? VES_PRESETS[0]
}
