import { describe, it, expect } from 'vitest'
import { NAV } from '../Layout'

// Ce fichier testait la navigation par univers. L'ADR-001 puis le WP 1.1 ont
// remplace cette organisation par une navigation par usage : les assertions
// d'origine codaient en dur une decision produit desormais caduque.
// La composition detaillee est couverte par Layout.nav.wp11.test.ts.
describe('Navigation principale élève', () => {
  it('expose l’entrée "Parcours" au premier niveau', () => {
    expect(NAV.eleve.some((i) => i.label === 'Parcours')).toBe(true)
    expect(NAV.eleve.some((i) => i.to === '/parcours')).toBe(true)
  })

  it('n’expose plus les univers SHIAI / KYU / JUDO-KÂ', () => {
    const labels = NAV.eleve.map((i) => i.label)
    expect(labels).not.toContain('Shiai')
    expect(labels).not.toContain('Kyu')
    expect(labels).not.toContain('Judo-Ka')
  })
})
