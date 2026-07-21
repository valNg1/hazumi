import { describe, it, expect } from 'vitest'
import { NAGE_NO_KATA_TECHNIQUES, totalDansSerie, NAGE_NO_KATA_SOURCE } from '../nageNoKata'
import { techniqueCard, decodeCard, canonicalTechniqueName } from '../techniqueCards'

describe('roster Nage-no-kata', () => {
  it('compte neuf techniques', () => {
    expect(NAGE_NO_KATA_TECHNIQUES).toHaveLength(9)
  })

  it('trois séries de trois techniques', () => {
    expect(totalDansSerie('Te-waza')).toBe(3)
    expect(totalDansSerie('Koshi-waza')).toBe(3)
    expect(totalDansSerie('Ashi-waza')).toBe(3)
  })

  it('utilise les noms canoniques validés (D2)', () => {
    const noms = NAGE_NO_KATA_TECHNIQUES.map((t) => t.nom)
    expect(noms).toContain('Seoi-nage')
    expect(noms).toContain('Tsurikomi-goshi')
    expect(noms).not.toContain('Ippon-seoi-nage')
    expect(noms).not.toContain('Tsuri-komi-goshi')
  })

  it('chaque nom est déjà canonique', () => {
    NAGE_NO_KATA_TECHNIQUES.forEach((t) => {
      expect(canonicalTechniqueName(t.nom)).toBe(t.nom)
    })
  })

  it('la source pointe la vidéo Kodokan', () => {
    expect(NAGE_NO_KATA_SOURCE.url).toContain('bkhBZzE2HpM')
    expect(NAGE_NO_KATA_SOURCE.dureeSeconds).toBe(1765)
  })
})

// Les neuf cartes typographiques definitives, generees depuis le roster.
describe('cartes typographiques des neuf techniques', () => {
  it('produit neuf cartes distinctes', () => {
    const cartes = NAGE_NO_KATA_TECHNIQUES.map((t) =>
      techniqueCard({ nom: t.nom, famille: t.famille, ordre: t.ordre, total: totalDansSerie(t.famille) })
    )
    expect(new Set(cartes).size).toBe(9)
  })

  it('chaque carte porte nom, famille, ordre et parcours parent', () => {
    NAGE_NO_KATA_TECHNIQUES.forEach((t) => {
      const svg = decodeCard(
        techniqueCard({ nom: t.nom, famille: t.famille, ordre: t.ordre, total: totalDansSerie(t.famille) })
      )
      expect(svg).toContain(t.nom)
      expect(svg).toContain(t.famille)
      expect(svg).toContain(`${t.ordre}/3`)
      expect(svg).toContain('Nage-no-kata')
    })
  })
})
