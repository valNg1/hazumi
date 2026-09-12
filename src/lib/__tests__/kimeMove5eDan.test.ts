import { describe, it, expect } from 'vitest'
import { KIME_NO_KATA_META, KIME_NO_KATA_RESSOURCE_ID } from '../kimeNoKata'
import { PREMIUM_LESSONS } from '../lessonPremium'
import { titreParcoursAffiche, QUATRIEME_DAN_PARCOURS_TITRE } from '../quatriemeDanContent'

// Réglementation kata 2026-2027 : Kime-no-kata quitte le 4e Dan et rejoint le 5e Dan.
// C'est un CHANGEMENT DE RATTACHEMENT : le contenu, les IDs, la leçon et les
// approfondissements restent identiques ; seul le grade/dan affiché change.
describe('Kime-no-kata — passage au 5e Dan (changement de rattachement)', () => {
  it('le grade méta est « 5e dan » (plus « 4e dan »)', () => {
    expect(KIME_NO_KATA_META.grade).toBe('5e dan')
  })

  it('les tags reflètent le 5e dan (plus le 4e dan)', () => {
    expect(KIME_NO_KATA_META.tags).toContain('5e dan')
    expect(KIME_NO_KATA_META.tags).not.toContain('4e dan')
  })

  it('la fiche premium (approfondissements) affiche « 5e Dan » comme niveau', () => {
    const meta = PREMIUM_LESSONS[KIME_NO_KATA_RESSOURCE_ID].meta
    expect(meta.niveau).toMatch(/5e\s*Dan/i)
    expect(meta.niveau).not.toMatch(/4e\s*Dan/i)
  })

  it('la structure premium (séries + cartes) reste intacte (rien perdu)', () => {
    const c = PREMIUM_LESSONS[KIME_NO_KATA_RESSOURCE_ID]
    const nbCartes = c.series.reduce((n, s) => n + s.techniques.length, 0)
    expect(c.series).toHaveLength(7)
    expect(nbCartes).toBe(22) // 20 techniques officielles + ouverture + clôture
  })

  it('« Préparer le 5e Dan » n’est PAS capté par le landing 4e Dan (landing générique)', () => {
    // Le landing riche 4e Dan porte des faits d'examen spécifiques au 4e Dan ; il ne
    // doit pas s'appliquer au parcours 5e Dan.
    expect(QUATRIEME_DAN_PARCOURS_TITRE).not.toBe('Préparer le 5e Dan')
    expect(titreParcoursAffiche('Préparer le 5e Dan')).toBe('Préparer le 5e Dan')
  })
})
