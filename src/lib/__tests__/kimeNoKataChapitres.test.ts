import { describe, it, expect } from 'vitest'
import {
  KIME_NO_KATA_CHAPITRES,
  KIME_NO_KATA_SERIES,
  KIME_NO_KATA_SOURCE,
} from '../../../scripts/data/chapitres-kime-no-kata'

// UV1 Kime-no-kata. Les 7 bornes macro sont fournies par le Directeur Technique
// et fixes ; les 26 bornes fines ne sont pas determinables sur cette source et
// doivent rester marquees a valider — aucune ne doit etre inventee.
describe('Chapitrage Kime-no-kata', () => {
  it('source : video Kodokan Hsvx-zNDEUo', () => {
    expect(KIME_NO_KATA_SOURCE.url).toContain('Hsvx-zNDEUo')
    expect(KIME_NO_KATA_SOURCE.dureeSeconds).toBe(757)
  })

  it('les 7 bornes macro sont conformes au referentiel technique', () => {
    expect(KIME_NO_KATA_SERIES.map((s) => s.timestamp)).toEqual([0, 64, 200, 363, 507, 590, 673])
    expect(KIME_NO_KATA_SERIES.map((s) => s.titre)).toEqual([
      'Opening',
      'Series 1 — Idori (Unarmed)',
      'Series 2 — Idori (Knife)',
      'Series 3 — Tachi-ai (Unarmed)',
      'Series 4 — Tachi-ai (Knife)',
      'Series 5 — Tachi-ai (Sword)',
      'Closing',
    ])
  })

  it('26 techniques reparties 8 / 4 / 7 / 4 / 3', () => {
    const parSerie = KIME_NO_KATA_SERIES.map((s) => s.techniques.length)
    expect(parSerie).toEqual([0, 8, 4, 7, 4, 3, 0])
    expect(parSerie.reduce((a, b) => a + b, 0)).toBe(26)
  })

  it('respecte l ordre officiel des techniques', () => {
    expect(KIME_NO_KATA_SERIES[1].techniques).toEqual([
      'Ryote-dori', 'Sode-tori', 'Tsukkake', 'Tsuki-age', 'Suri-age', 'Yoko-uchi', 'Ke-age', 'Ushiro-dori',
    ])
    expect(KIME_NO_KATA_SERIES[2].techniques).toEqual(['Tsukkake', 'Choku-zuki', 'Naname-zuki', 'Kiri-komi'])
    expect(KIME_NO_KATA_SERIES[5].techniques).toEqual(['Kiri-oroshi', 'Morote-zuki', 'Nukiuchi'])
  })

  it('33 chapitres : 7 macro validees + 26 techniques a valider', () => {
    expect(KIME_NO_KATA_CHAPITRES).toHaveLength(33)
    expect(KIME_NO_KATA_CHAPITRES.filter((c) => c.valide)).toHaveLength(7)
    expect(KIME_NO_KATA_CHAPITRES.filter((c) => !c.valide)).toHaveLength(26)
  })

  it('aucune borne fine inventee : les 26 sont marquees a valider', () => {
    KIME_NO_KATA_CHAPITRES.filter((c) => !c.valide).forEach((c) => {
      expect(c.note).toMatch(/À VALIDER/)
    })
  })

  it('les bornes validees correspondent aux bornes macro', () => {
    expect(KIME_NO_KATA_CHAPITRES.filter((c) => c.valide).map((c) => c.timestamp))
      .toEqual([0, 64, 200, 363, 507, 590, 673])
  })

  it('chaque technique est ancree sur le debut de sa serie', () => {
    KIME_NO_KATA_SERIES.forEach((s) => {
      KIME_NO_KATA_CHAPITRES
        .filter((c) => c.titre.startsWith(`${s.titre} · `))
        .forEach((c) => expect(c.timestamp).toBe(s.timestamp))
    })
  })

  it('ordres uniques, croissants, bornes dans la duree', () => {
    const ordres = KIME_NO_KATA_CHAPITRES.map((c) => c.ordre)
    expect(new Set(ordres).size).toBe(ordres.length)
    expect([...ordres].sort((a, b) => a - b)).toEqual(ordres)
    KIME_NO_KATA_CHAPITRES.forEach((c) => {
      expect(c.timestamp).toBeGreaterThanOrEqual(0)
      expect(c.timestamp).toBeLessThan(KIME_NO_KATA_SOURCE.dureeSeconds)
    })
  })
})
