import { describe, it, expect } from 'vitest'
import { getPremiumContent } from '../lessonPremium'
import { KIME_NO_KATA_RESSOURCE_ID, KIME_NO_KATA_TECHNIQUES } from '../kimeNoKata'

// Le Kime-no-kata suit la même structure premium que le Nage-no-kata.
describe('Kime-no-kata — contenu premium', () => {
  const content = getPremiumContent(KIME_NO_KATA_RESSOURCE_ID)

  it('est enregistré et rendu via getPremiumContent', () => {
    expect(content).toBeDefined()
  })

  it('reprend les 7 sections de la structure Nage (pourquoi → à retenir)', () => {
    expect(content!.pourquoi.timeline.length).toBeGreaterThan(0)
    expect(content!.jury.length).toBeGreaterThanOrEqual(3)
    expect(content!.reperes.length).toBeGreaterThanOrEqual(3)
    expect(content!.regardExaminateur.length).toBeGreaterThan(0)
    expect(content!.aRetenir.length).toBeGreaterThan(0)
    expect(content!.seriesTitre).toBe('Les séries du kata')
  })

  it('les 5 séries portent les 20 techniques officielles', () => {
    expect(content!.series).toHaveLength(5)
    const total = content!.series.reduce((n, s) => n + s.techniques.length, 0)
    expect(total).toBe(KIME_NO_KATA_TECHNIQUES.length)
    expect(total).toBe(20)
  })

  it('chaque technique ouvre une fiche « Comprendre cette technique »', () => {
    content!.series.forEach((s) => {
      s.techniques.forEach((t) => {
        expect(t.detail?.fiche).toBeDefined()
        expect(t.detail!.fiche!.length).toBeGreaterThanOrEqual(6)
        t.detail!.fiche!.forEach((f) => {
          expect(f.label.length).toBeGreaterThan(0)
          expect(f.texte.length).toBeGreaterThan(0)
        })
      })
    })
  })
})
