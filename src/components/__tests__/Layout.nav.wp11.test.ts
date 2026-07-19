import { describe, it, expect } from 'vitest'
import { NAV } from '../Layout'
import { isNavActive } from '../../lib/navigation'

// WP 1.1 — la navigation decrit ce que l'utilisateur veut faire, pas la facon
// dont Hazumi est organise en interne (ADR-001).
describe('WP 1.1 — navigation principale judoka', () => {
  it('ACC-01 : expose exactement quatre entrees', () => {
    expect(NAV.eleve).toHaveLength(4)
  })

  it('ACC-01 : les libelles sont Accueil, Parcours, Bibliotheque, Mon espace', () => {
    expect(NAV.eleve.map((i) => i.label)).toEqual([
      'Accueil',
      'Parcours',
      'Bibliothèque',
      'Mon espace',
    ])
  })

  it('ACC-01 : les destinations respectent la convention validee (D1)', () => {
    expect(NAV.eleve.map((i) => i.to)).toEqual([
      '/',
      '/parcours',
      '/bibliotheque',
      '/mon-espace',
    ])
  })

  it('ACC-02 : aucune entree ne reference KYU, SHIAI ou JUDO-KA', () => {
    const cible = /shiai|kyu|judo-?ka/i
    NAV.eleve.forEach((item) => {
      expect(cible.test(item.label), `libelle : ${item.label}`).toBe(false)
      expect(cible.test(item.to), `url : ${item.to}`).toBe(false)
    })
  })

  it('ACC-02 : les anciennes entrees d’univers ont disparu', () => {
    const labels = NAV.eleve.map((i) => i.label)
    expect(labels).not.toContain('Shiai')
    expect(labels).not.toContain('Kyu')
    expect(labels).not.toContain('Judo-Ka')
  })

  it('la navigation club n’est pas touchee par ce WP', () => {
    expect(NAV.club.length).toBeGreaterThan(0)
    expect(NAV.club.some((i) => i.to.startsWith('/club/'))).toBe(true)
  })
})

// ACC-04 — l'entree active doit rester identifiable meme quand SmartRedirect
// a deplace l'utilisateur de "/" vers "/eleve/accueil".
describe('WP 1.1 — etat actif de la navigation', () => {
  const accueil = NAV.eleve[0]
  const parcours = NAV.eleve[1]

  it('Accueil est actif sur "/"', () => {
    expect(isNavActive(accueil, '/')).toBe(true)
  })

  it('Accueil reste actif apres la redirection vers /eleve/accueil', () => {
    expect(isNavActive(accueil, '/eleve/accueil')).toBe(true)
  })

  it('Accueil n’est pas actif sur une autre section', () => {
    expect(isNavActive(accueil, '/parcours')).toBe(false)
    expect(isNavActive(accueil, '/bibliotheque')).toBe(false)
  })

  it('Parcours est actif sur sa route et sur l’URL historique', () => {
    expect(isNavActive(parcours, '/parcours')).toBe(true)
    expect(isNavActive(parcours, '/eleve/parcours')).toBe(true)
  })

  it('une section est active sur ses sous-routes', () => {
    expect(isNavActive(parcours, '/parcours/quelque-chose')).toBe(true)
  })

  it('"/" ne rend pas toutes les entrees actives', () => {
    expect(isNavActive(parcours, '/')).toBe(false)
    expect(isNavActive(NAV.eleve[3], '/')).toBe(false)
  })
})
