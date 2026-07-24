import { describe, it, expect } from 'vitest'
import {
  KIME_NO_KATA_CHAPITRES,
  KIME_NO_KATA_SOURCE,
} from '../../../scripts/data/chapitres-kime-no-kata'

// MVP 3e Dan — UV1 Kime-no-kata. Les bornes issues du pipeline d'extraction
// sont des candidats : ce test garantit qu'aucune n'est presentee comme validee
// sans l'etre, et que la structure reste exploitable par le seed.
describe('Chapitres candidats — Kime-no-kata', () => {
  it('source : video Kodokan 1-YAOozPQNU', () => {
    expect(KIME_NO_KATA_SOURCE.url).toContain('1-YAOozPQNU')
    expect(KIME_NO_KATA_SOURCE.dureeSeconds).toBe(2566)
  })

  it('couvre les deux sections du kata plus l’introduction', () => {
    expect(KIME_NO_KATA_CHAPITRES).toHaveLength(3)
    const titres = KIME_NO_KATA_CHAPITRES.map((c) => c.titre).join(' ')
    expect(titres).toMatch(/Idori/)
    expect(titres).toMatch(/Tachi-ai/)
  })

  it('les bornes incertaines sont explicitement marquées à valider', () => {
    const aValider = KIME_NO_KATA_CHAPITRES.filter((c) => !c.valide)
    expect(aValider.length).toBeGreaterThan(0)
    aValider.forEach((c) => expect(c.note).toMatch(/À VALIDER/))
  })

  it('seule la borne de début de vidéo est déclarée certaine', () => {
    const valides = KIME_NO_KATA_CHAPITRES.filter((c) => c.valide)
    expect(valides).toHaveLength(1)
    expect(valides[0].timestamp).toBe(0)
  })

  it('les ordres sont uniques et croissants', () => {
    const ordres = KIME_NO_KATA_CHAPITRES.map((c) => c.ordre)
    expect(new Set(ordres).size).toBe(ordres.length)
    expect([...ordres].sort((a, b) => a - b)).toEqual(ordres)
  })

  it('aucune borne ne dépasse la durée de la vidéo', () => {
    KIME_NO_KATA_CHAPITRES.forEach((c) => {
      expect(c.timestamp).toBeGreaterThanOrEqual(0)
      expect(c.timestamp).toBeLessThan(KIME_NO_KATA_SOURCE.dureeSeconds)
    })
  })
})
