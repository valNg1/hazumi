import { describe, it, expect } from 'vitest'
import { FD_JOURNEY_TEMPLATE } from '../_template'
import { FD_JOURNEYS } from '../index'
import { getMasterclassContent, getMasterclassChapitres } from '../../masterclass/lessons'

describe('Collection FD — template masterclass', () => {
  it('univers fixé à judo-ka', () => {
    expect(FD_JOURNEY_TEMPLATE.univers).toBe('judo-ka')
  })

  it('contient toutes les sections du Masterclass Blueprint, vides', () => {
    const c = FD_JOURNEY_TEMPLATE.content
    const sections = ['objectifs', 'prerequis', 'concepts', 'explications', 'erreurs', 'conseils', 'drills', 'aRetenir'] as const
    for (const k of sections) {
      expect(Array.isArray(c[k])).toBe(true)
      expect(c[k]).toHaveLength(0)
    }
    expect(FD_JOURNEY_TEMPLATE.chapitres).toHaveLength(0)
    expect(FD_JOURNEY_TEMPLATE.quiz).toHaveLength(0)
  })

  it('ne comporte AUCUN champ de section kata', () => {
    const c = FD_JOURNEY_TEMPLATE.content as Record<string, unknown>
    expect(c.pourquoi).toBeUndefined()
    expect(c.jury).toBeUndefined()
    expect(c.reperes).toBeUndefined()
  })

  it('getMasterclassContent renvoie undefined pour un id inconnu', () => {
    expect(getMasterclassContent('inexistant')).toBeUndefined()
    expect(getMasterclassContent(undefined)).toBeUndefined()
  })
})

describe('Collection FD — journey « Gaeshi »', () => {
  const gaeshi = FD_JOURNEYS.find((jj) => jj.slug === 'gaeshi-projet-excellence')

  it('est enregistré (1 vidéo = 1 journey)', () => {
    expect(gaeshi).toBeDefined()
    expect(gaeshi!.titre).toBe('Gaeshi — Projet Excellence Judo')
    expect(gaeshi!.univers).toBe('judo-ka') // contrainte héritée, non exposée
  })

  it('porte les 17 chapitres validés par le PO', () => {
    expect(gaeshi!.chapitres).toHaveLength(17)
    expect(gaeshi!.chapitres[0].titre).toBe('Tsubame-gaeshi')
    expect(gaeshi!.chapitres[0].timestampSeconds).toBe(17)
    expect(gaeshi!.chapitres.every((c) => c.titre.length > 0)).toBe(true)
    // horodatages strictement croissants
    const ts = gaeshi!.chapitres.map((c) => c.timestampSeconds)
    expect(ts).toEqual([...ts].sort((a, b) => a - b))
  })

  it('a un contenu masterclass rempli (pas de section kata)', () => {
    const c = gaeshi!.content
    expect(c.objectifs.length).toBeGreaterThan(0)
    expect(c.concepts.length).toBeGreaterThan(0)
    expect(c.explications.length).toBeGreaterThan(0)
    expect(c.erreurs.length).toBeGreaterThan(0)
    expect(c.conseils.length).toBeGreaterThan(0)
    expect(c.aRetenir.length).toBeGreaterThan(0)
    expect((c as Record<string, unknown>).jury).toBeUndefined()
  })

  it('a un quiz et est résolu par le registre masterclass', () => {
    expect(gaeshi!.quiz.length).toBeGreaterThanOrEqual(5)
    expect(getMasterclassContent(gaeshi!.ressourceId)).toBe(gaeshi!.content)
  })
})

describe('Collection FD — intégrité (8 journeys)', () => {
  it('compte 8 journeys (Gaeshi + 7 Projet Excellence)', () => {
    expect(FD_JOURNEYS).toHaveLength(8)
  })

  it('ids et slugs uniques ; univers judo-ka ; chapitres et vidéo présents', () => {
    const ids = new Set(FD_JOURNEYS.map((j) => j.ressourceId))
    const slugs = new Set(FD_JOURNEYS.map((j) => j.slug))
    expect(ids.size).toBe(8)
    expect(slugs.size).toBe(8)
    FD_JOURNEYS.forEach((j) => {
      expect(j.univers).toBe('judo-ka')
      expect(j.titre.length).toBeGreaterThan(0)
      expect(j.video.url).toMatch(/youtube\.com\/watch\?v=/)
      expect(j.video.dureeSeconds).toBeGreaterThan(0)
      expect(j.chapitres.length).toBeGreaterThan(0)
      expect(j.chapitres.every((c) => c.titre.length > 0 && c.timestampSeconds >= 0)).toBe(true)
      expect(getMasterclassContent(j.ressourceId)).toBe(j.content)
    })
  })
})

describe('Comprendre les techniques — transcript par chapitre (pilote)', () => {
  const PILOTE = 'edc5e596-56d0-4387-af33-9da673a82872' // systeme-attaque-kumikata
  const chapitres = getMasterclassChapitres(PILOTE)

  it('expose les chapitres avec transcript pour le journey pilote', () => {
    expect(chapitres).toHaveLength(8)
    expect(chapitres.every((c) => (c.transcript ?? '').trim().length > 40)).toBe(true)
  })

  it('les timestamps correspondent aux bornes de chapitres (mêmes que la vidéo)', () => {
    expect(chapitres.map((c) => c.timestampSeconds)).toEqual([0, 79, 220, 280, 458, 550, 653, 816])
  })

  it('signale les termes ASR incertains avec « [à vérifier] »', () => {
    const flags = chapitres.reduce((n, c) => n + ((c.transcript ?? '').match(/\[à vérifier\]/g)?.length ?? 0), 0)
    expect(flags).toBeGreaterThan(0)
  })

  it('les autres journeys n’ont pas encore de transcript (pilote uniquement)', () => {
    const gaeshi = getMasterclassChapitres('bf947eb3-f9e1-4b26-8994-90af73d81eac')
    expect(gaeshi.some((c) => c.transcript)).toBe(false)
  })
})
