import { describe, it, expect } from 'vitest'
import { getPremiumContent, techniqueLookupTitles, NAGE_NO_KATA_RESSOURCE_ID, QUIZ_NIVEAUX } from '../lessonPremium'

describe('lessonPremium — Nage-no-kata', () => {
  const c = getPremiumContent(NAGE_NO_KATA_RESSOURCE_ID)!

  it('renvoie le contenu premium pour la bonne ressource, undefined sinon', () => {
    expect(c).toBeDefined()
    expect(getPremiumContent('inconnu')).toBeUndefined()
    expect(getPremiumContent(undefined)).toBeUndefined()
  })

  it('objectif : intro + 4 capacités visées', () => {
    expect(c.objectifIntro).toMatch(/tu seras capable/i)
    expect(c.objectifs).toHaveLength(4)
  })

  it('"Pourquoi ce kata" est étoffé : 5 blocs + principes illustrés par une technique', () => {
    expect(c.pourquoi.blocs).toHaveLength(5)
    c.pourquoi.blocs.forEach((b) => expect(b.texte.length).toBeGreaterThan(300)) // ~5-7 lignes
    expect(c.pourquoi.principes).toHaveLength(5)
    c.pourquoi.principes.forEach((p) => expect(p.technique.trim().length).toBeGreaterThan(0))
  })

  it('jury : chaque critère a un exemple + rôle de Tori et de Uke', () => {
    expect(c.jury.length).toBeGreaterThanOrEqual(6)
    c.jury.forEach((j) => {
      expect(j.exemple.trim().length).toBeGreaterThan(0)
      expect(j.tori.trim().length).toBeGreaterThan(0)
      expect(j.uke.trim().length).toBeGreaterThan(0)
    })
  })

  it('repères sur le tatami : Joséki, distances, déplacements, orientation, placements, cérémonial', () => {
    const titres = c.reperes.map((r) => r.titre.toLowerCase())
    expect(titres).toEqual(expect.arrayContaining(['joséki', 'distances', 'déplacements', 'orientation', 'placements', 'cérémonial']))
  })

  it('trois séries seulement (Te / Koshi / Ashi), 3 techniques chacune', () => {
    expect(c.series).toHaveLength(3)
    expect(c.series.map((s) => s.nom).join(' ')).toMatch(/Te-waza.*Koshi-waza.*Ashi-waza/)
    c.series.forEach((s) => {
      expect(s.techniques).toHaveLength(3)
      expect(s.apprend.trim().length).toBeGreaterThan(0)
    })
  })

  it('synthèses : regard de l’examinateur (5-8), à retenir (5), conseil expert vide', () => {
    expect(c.regardExaminateur.length).toBeGreaterThanOrEqual(5)
    expect(c.regardExaminateur.length).toBeLessThanOrEqual(8)
    expect(c.aRetenir).toHaveLength(5)
    c.aRetenir.forEach((a) => expect(a.trim().length).toBeGreaterThan(0))
    expect(c.conseilExpert.filter((x) => x.trim())).toHaveLength(0)
  })

  it('techniqueLookupTitles renvoie les 9 titres à chercher au catalogue', () => {
    const titles = techniqueLookupTitles(c)
    expect(titles).toHaveLength(9)
    expect(titles).toContain('Harai-goshi')
    expect(titles).toContain('Okuri-ashi-barai') // titre catalogue (variante barai)
  })

  it('quiz : 3 niveaux par tranches de 5', () => {
    expect(QUIZ_NIVEAUX.map((n) => n.start)).toEqual([0, 5, 10])
  })
})
