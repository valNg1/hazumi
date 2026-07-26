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

  it('7 cartes : cérémonie d’ouverture, 5 groupes (20 techniques), cérémonie de clôture', () => {
    expect(content!.series).toHaveLength(7)
    expect(content!.series[0].nom).toBe('Cérémonie d’ouverture')
    expect(content!.series[6].nom).toBe('Cérémonie de clôture')
    const groupes = content!.series.slice(1, 6)
    const total = groupes.reduce((n, s) => n + s.techniques.length, 0)
    expect(total).toBe(KIME_NO_KATA_TECHNIQUES.length)
    expect(total).toBe(20)
  })

  it('chaque entrée ouvre une fiche « Comprendre » non vide', () => {
    content!.series.forEach((s) => {
      s.techniques.forEach((t) => {
        expect(t.detail?.fiche).toBeDefined()
        expect(t.detail!.fiche!.length).toBeGreaterThanOrEqual(4)
        t.detail!.fiche!.forEach((f) => {
          expect(f.label.length).toBeGreaterThan(0)
          expect(f.texte.length).toBeGreaterThan(0)
        })
      })
    })
  })

  it('les cérémonies portent le protocole (ouverture et clôture)', () => {
    expect(content!.series[0].techniques[0].detail!.fiche!.some((f) => /salut/i.test(f.texte))).toBe(true)
    expect(content!.series[6].techniques[0].detail!.fiche!.some((f) => /Kiri-oroshi/i.test(f.texte))).toBe(true)
  })
})
