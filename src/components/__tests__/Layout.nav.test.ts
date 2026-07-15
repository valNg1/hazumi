import { describe, it, expect } from 'vitest'
import { NAV } from '../Layout'

describe('Navigation principale élève', () => {
  it('ne contient plus l’entrée "Parcours"', () => {
    expect(NAV.eleve.some((i) => i.label === 'Parcours')).toBe(false)
    expect(NAV.eleve.some((i) => i.to === '/eleve/parcours')).toBe(false)
  })

  it('expose les trois univers SHIAI / KYU / JUDO-KÂ', () => {
    const labels = NAV.eleve.map((i) => i.label)
    expect(labels).toContain('Shiai')
    expect(labels).toContain('Kyu')
    expect(labels).toContain('Judo-Ka')
  })
})
