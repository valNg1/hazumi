import { describe, it, expect } from 'vitest'
import {
  computeProgress,
  nextRessourceId,
  toggleCompleted,
  type ParcoursRessourceLink,
} from '../parcoursProgress'

const links: ParcoursRessourceLink[] = [
  { ressource_id: 'a', obligatoire: true },
  { ressource_id: 'b', obligatoire: true },
  { ressource_id: 'c', obligatoire: true },
  { ressource_id: 'd', obligatoire: false },
]

describe('computeProgress', () => {
  it('renvoie 0% quand rien n’est termine', () => {
    const p = computeProgress(links, [])
    expect(p).toEqual({ done: 0, total: 3, percent: 0, termine: false })
  })

  it('ne compte que les ressources obligatoires', () => {
    const p = computeProgress(links, ['d']) // d est optionnelle
    expect(p.done).toBe(0)
    expect(p.percent).toBe(0)
  })

  it('calcule un pourcentage arrondi', () => {
    const p = computeProgress(links, ['a'])
    expect(p.percent).toBe(33)
    expect(p.done).toBe(1)
    expect(p.total).toBe(3)
  })

  it('marque termine a 100%', () => {
    const p = computeProgress(links, ['a', 'b', 'c'])
    expect(p.percent).toBe(100)
    expect(p.termine).toBe(true)
  })

  it('retombe sur toutes les ressources si aucune obligatoire', () => {
    const opt: ParcoursRessourceLink[] = [
      { ressource_id: 'x', obligatoire: false },
      { ressource_id: 'y', obligatoire: false },
    ]
    expect(computeProgress(opt, ['x']).percent).toBe(50)
  })

  it('gere un parcours vide sans division par zero', () => {
    expect(computeProgress([], [])).toEqual({ done: 0, total: 0, percent: 0, termine: false })
  })
})

describe('nextRessourceId (bouton Reprendre)', () => {
  it('renvoie la premiere ressource non terminee dans l’ordre', () => {
    expect(nextRessourceId(['a', 'b', 'c'], ['a'])).toBe('b')
  })
  it('renvoie null quand tout est termine', () => {
    expect(nextRessourceId(['a', 'b'], ['a', 'b'])).toBeNull()
  })
  it('renvoie la premiere quand rien n’est fait', () => {
    expect(nextRessourceId(['a', 'b'], [])).toBe('a')
  })
})

describe('toggleCompleted', () => {
  it('ajoute puis retire une ressource', () => {
    expect(toggleCompleted([], 'a')).toEqual(['a'])
    expect(toggleCompleted(['a'], 'a')).toEqual([])
  })
})
