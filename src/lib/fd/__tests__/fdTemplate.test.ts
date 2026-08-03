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

  it('registre FD vide par défaut (aucune source encore fournie)', () => {
    expect(FD_JOURNEYS).toHaveLength(0)
  })

  it('getMasterclassContent renvoie undefined pour un id inconnu', () => {
    expect(getMasterclassContent('inexistant')).toBeUndefined()
    expect(getMasterclassContent(undefined)).toBeUndefined()
  })
})
