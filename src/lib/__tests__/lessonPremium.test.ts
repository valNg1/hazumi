import { describe, it, expect } from 'vitest'
import { getPremiumContent, NAGE_NO_KATA_RESSOURCE_ID, QUIZ_NIVEAUX } from '../lessonPremium'

describe('lessonPremium — Nage-no-kata', () => {
  const c = getPremiumContent(NAGE_NO_KATA_RESSOURCE_ID)!

  it('renvoie le contenu premium pour la bonne ressource, undefined sinon', () => {
    expect(c).toBeDefined()
    expect(getPremiumContent('inconnu')).toBeUndefined()
    expect(getPremiumContent(undefined)).toBeUndefined()
  })

  it('meta : temps de lecture, niveau, difficulté 3/5', () => {
    expect(c.meta.tempsLecture).toMatch(/15/)
    expect(c.meta.niveau).toMatch(/1er Dan/)
    expect(c.meta.difficulte).toBe(3)
  })

  it('5 principes, 5 séries de 3 techniques, timeline 3 étapes', () => {
    expect(c.principes).toHaveLength(5)
    expect(c.pointsCles.series).toHaveLength(5)
    c.pointsCles.series.forEach((s) => expect(s.techniques).toHaveLength(3))
    expect(c.pourquoi.timeline).toHaveLength(3)
  })

  it('sections à compléter vides (regard examinateur, conseils, à retenir=5)', () => {
    expect(c.regardExaminateur.filter((x) => x.trim())).toHaveLength(0)
    expect(c.conseils.filter((x) => x.trim())).toHaveLength(0)
    expect(c.aRetenir).toHaveLength(5)
  })

  it('quiz : 3 niveaux (Comprendre / Observer / Analyser) par tranches de 5', () => {
    expect(QUIZ_NIVEAUX.map((n) => n.start)).toEqual([0, 5, 10])
    expect(QUIZ_NIVEAUX[0].label).toMatch(/Comprendre/)
    expect(QUIZ_NIVEAUX[1].label).toMatch(/Observer/)
    expect(QUIZ_NIVEAUX[2].label).toMatch(/Analyser/)
  })
})
