import { describe, expect, it } from 'vitest'
import { caseStudies, figureMeta } from './cases'
import { METHODS } from './methods'
import { referenceById } from './references'

describe('case-study source and figure audit', () => {
  it('resolves every case source to a matching case reference', () => {
    for (const item of caseStudies) {
      const ref = referenceById(item.sourceId)
      expect(ref, item.sourceId).toBeDefined()
      expect(ref?.type).toBe('case')
      expect(ref?.methods).toContain(item.methodId)
      expect(ref?.year).toBe(item.year)
    }
  })

  it('covers every method with at least one case study', () => {
    for (const method of METHODS) {
      expect(caseStudies.some((item) => item.methodId === method.id)).toBe(true)
    }
  })

  it('keeps case studies inside the 2026 five-year audit window', () => {
    const auditYear = 2026
    for (const item of caseStudies) {
      expect(item.year).toBeGreaterThanOrEqual(auditYear - 5)
    }
  })

  it('does not claim unverified figure licences', () => {
    for (const meta of Object.values(figureMeta)) {
      expect(meta.caption.en).not.toMatch(/CC BY|Creative Commons|redrawn|simplified after|schematic after/i)
      expect(meta.caption.id).not.toMatch(/CC BY|Creative Commons|digambar ulang|disederhanakan setelah|skema setelah/i)
    }
  })
})
