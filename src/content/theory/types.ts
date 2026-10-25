import type { MethodId } from '../methods'
import type { Bilingual } from '../site'
import type { FigureId } from '../cases'

export type TheoryBlock =
  | { kind: 'p'; text: Bilingual }
  | { kind: 'section'; title: Bilingual }
  | { kind: 'eq'; latex: string; caption?: Bilingual }
  | { kind: 'list'; items: Bilingual[] }
  | { kind: 'note'; title: Bilingual; text: Bilingual }
  | { kind: 'figure'; figureId: FigureId }

export interface TheoryChapter {
  id: string
  title: Bilingual
  summary: Bilingual
  minutes: number
  blocks: TheoryBlock[]
}

export interface MethodTheory {
  methodId: MethodId
  chapters: TheoryChapter[]
}

export const p = (en: string, id: string): TheoryBlock => ({ kind: 'p', text: { en, id } })
export const section = (en: string, id: string): TheoryBlock => ({ kind: 'section', title: { en, id } })
export const eq = (latex: string, en?: string, id?: string): TheoryBlock => ({
  kind: 'eq',
  latex,
  caption: en && id ? { en, id } : undefined,
})
export const list = (...items: Array<[string, string]>): TheoryBlock => ({
  kind: 'list',
  items: items.map(([en, id]) => ({ en, id })),
})
export const note = (titleEn: string, titleId: string, en: string, id: string): TheoryBlock => ({
  kind: 'note',
  title: { en: titleEn, id: titleId },
  text: { en, id },
})
export const figure = (figureId: FigureId): TheoryBlock => ({ kind: 'figure', figureId })
