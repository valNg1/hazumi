import { describe, it, expect } from 'vitest'
import {
  pickPrincipal,
  roleLabel,
  mediaSegment,
  hasMultipleMedias,
  sortMedias,
  MEDIA_ROLES,
  type AssetMedia,
} from '../assetMedia'

const media = (over: Partial<AssetMedia> & { id: string; role: AssetMedia['role'] }): AssetMedia => ({
  sourceUrl: 'https://www.youtube.com/watch?v=bkhBZzE2HpM',
  segmentStart: null,
  segmentEnd: null,
  estPrincipal: false,
  ordre: 0,
  titre: null,
  ...over,
})

describe('pickPrincipal — le media ouvert par defaut', () => {
  it('retient le media marque principal', () => {
    const medias = [
      media({ id: 'a', role: 'ralenti', ordre: 0 }),
      media({ id: 'b', role: 'demonstration', ordre: 1, estPrincipal: true }),
    ]
    expect(pickPrincipal(medias)?.id).toBe('b')
  })

  it('a defaut de principal, prend le plus petit ordre', () => {
    const medias = [
      media({ id: 'a', role: 'ralenti', ordre: 2 }),
      media({ id: 'b', role: 'demonstration', ordre: 1 }),
    ]
    expect(pickPrincipal(medias)?.id).toBe('b')
  })

  it('renvoie null sur une collection vide', () => {
    expect(pickPrincipal([])).toBeNull()
  })

  it('gere un media unique', () => {
    expect(pickPrincipal([media({ id: 'a', role: 'complet' })])?.id).toBe('a')
  })
})

describe('sortMedias — le principal d’abord, puis par ordre', () => {
  it('place le principal en tete', () => {
    const medias = [
      media({ id: 'a', role: 'ralenti', ordre: 0 }),
      media({ id: 'b', role: 'demonstration', ordre: 1, estPrincipal: true }),
      media({ id: 'c', role: 'analyse', ordre: 2 }),
    ]
    expect(sortMedias(medias).map((m) => m.id)).toEqual(['b', 'a', 'c'])
  })

  it('ne mute pas la liste source', () => {
    const medias = [media({ id: 'a', role: 'ralenti', ordre: 1 }), media({ id: 'b', role: 'complet', ordre: 0 })]
    sortMedias(medias)
    expect(medias[0].id).toBe('a')
  })
})

describe('roleLabel', () => {
  it('donne un libelle lisible par role', () => {
    expect(roleLabel('demonstration')).toBe('Démonstration')
    expect(roleLabel('ralenti')).toBe('Ralenti')
    expect(roleLabel('vue_arriere')).toBe('Vue arrière')
    expect(roleLabel('erreur_frequente')).toBe('Erreur fréquente')
    expect(roleLabel('complet')).toBe('Démonstration complète')
  })

  it('les six roles ont un libelle', () => {
    MEDIA_ROLES.forEach((r) => expect(roleLabel(r).length).toBeGreaterThan(0))
  })
})

describe('mediaSegment', () => {
  it('expose les bornes au format attendu par segments.ts', () => {
    const m = media({ id: 'a', role: 'demonstration', segmentStart: 80, segmentEnd: 113 })
    expect(mediaSegment(m)).toEqual({ start: 80, end: 113 })
  })

  it('une video complete n’a pas de bornes', () => {
    expect(mediaSegment(media({ id: 'a', role: 'complet' }))).toEqual({ start: null, end: null })
  })
})

describe('hasMultipleMedias', () => {
  it('vrai des deux medias', () => {
    expect(hasMultipleMedias([media({ id: 'a', role: 'demonstration' }), media({ id: 'b', role: 'ralenti' })])).toBe(true)
  })

  it('faux avec un seul media', () => {
    expect(hasMultipleMedias([media({ id: 'a', role: 'demonstration' })])).toBe(false)
  })

  it('faux sur une collection vide', () => {
    expect(hasMultipleMedias([])).toBe(false)
  })
})
