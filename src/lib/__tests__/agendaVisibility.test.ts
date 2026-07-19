import { describe, it, expect } from 'vitest'
import { visibleItems, computeSeanceStats, type Annulable } from '../agendaVisibility'

const s = (id: string, statut: Annulable['statut'], date: string): Annulable & { date: string } =>
  ({ id, statut, date })

describe('visibleItems', () => {
  const items = [
    s('a', 'planifie', '2026-07-20'),
    s('b', 'annule', '2026-07-21'),
    s('c', 'fait', '2026-07-22'),
    s('d', 'annule', '2026-07-23'),
  ]

  it('masque les elements annules par defaut', () => {
    expect(visibleItems(items, false).map((i) => i.id)).toEqual(['a', 'c'])
  })

  it('les revele quand on demande a les afficher', () => {
    expect(visibleItems(items, true).map((i) => i.id)).toEqual(['a', 'b', 'c', 'd'])
  })

  it('ne mute pas la liste source', () => {
    visibleItems(items, false)
    expect(items).toHaveLength(4)
  })

  it('traite un statut absent comme planifie (donnees anciennes)', () => {
    const sansStatut = [{ id: 'x' } as Annulable & { id: string }]
    expect(visibleItems(sansStatut, false).map((i) => i.id)).toEqual(['x'])
  })

  it('renvoie une liste vide sans planter sur une entree vide', () => {
    expect(visibleItems([], false)).toEqual([])
  })
})

describe('computeSeanceStats', () => {
  it('sort les annulees du total et du taux de realisation', () => {
    const stats = computeSeanceStats([
      s('a', 'fait', '2026-07-20'),
      s('b', 'planifie', '2026-07-21'),
      s('c', 'annule', '2026-07-22'),
      s('d', 'annule', '2026-07-23'),
    ])
    expect(stats.total).toBe(2) // les 2 annulees ne comptent plus
    expect(stats.faites).toBe(1)
    expect(stats.annulees).toBe(2)
    expect(stats.tauxRealisation).toBe(50) // 1 / 2
  })

  it('renvoie un taux de 0 quand tout est annule (pas de division par zero)', () => {
    const stats = computeSeanceStats([s('a', 'annule', '2026-07-20')])
    expect(stats.total).toBe(0)
    expect(stats.tauxRealisation).toBe(0)
  })

  it('renvoie des compteurs a zero sur une liste vide', () => {
    expect(computeSeanceStats([])).toEqual({ total: 0, faites: 0, annulees: 0, tauxRealisation: 0 })
  })

  it('arrondit le taux a l entier', () => {
    const stats = computeSeanceStats([
      s('a', 'fait', '2026-07-20'),
      s('b', 'planifie', '2026-07-21'),
      s('c', 'planifie', '2026-07-22'),
    ])
    expect(stats.tauxRealisation).toBe(33) // 1/3
  })
})
