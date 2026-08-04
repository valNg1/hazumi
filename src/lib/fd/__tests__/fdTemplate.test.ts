import { describe, it, expect } from 'vitest'
import { FD_JOURNEY_TEMPLATE } from '../_template'
import { FD_JOURNEYS } from '../index'
import { getMasterclassContent } from '../../masterclass/lessons'

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
