import type { MethodId } from '../methods'
import { gprTheory } from './gpr'
import { magneticTheory } from './magnetic'
import { gravityTheory } from './gravity'
import { reflectionTheory } from './reflection'
import { refractionTheory } from './refraction'
import { resistivityTheory } from './resistivity'
import type { MethodTheory } from './types'

export type { MethodTheory, TheoryBlock, TheoryChapter } from './types'

export const theoryByMethod: Record<MethodId, MethodTheory> = {
  gpr: gprTheory,
  magnetic: magneticTheory,
  gravity: gravityTheory,
  reflection: reflectionTheory,
  refraction: refractionTheory,
  resistivity: resistivityTheory,
}

export const totalChapters = Object.values(theoryByMethod).reduce((sum, method) => sum + method.chapters.length, 0)
