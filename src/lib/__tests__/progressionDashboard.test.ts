import { describe, it, expect } from 'vitest'
import {
  buildDashboard,
  playlistProgress,
  type ParcoursEnCours,
  type PlaylistEnCours,
} from '../progressionDashboard'

const parcours = (id: string, nom: string, done: number, total: number, maj: string): ParcoursEnCours => ({
  id, nom, done, total, derniereActivite: maj,
})

const playlist = (id: string, nom: string, univers: 'kyu' | 'shiai' | 'judo-ka', done: number, total: number, maj: string): PlaylistEnCours => ({
  id, nom, univers, done, total, derniereActivite: maj,
})

describe('buildDashboard — ce que le judoka etait en train d’apprendre', () => {
  it('ne retient que les parcours et playlists commences', () => {
    const d = buildDashboard(
      [parcours('p1', 'Préparer le 1er Dan', 3, 10, '2026-07-18'), parcours('p2', 'Non commencé', 0, 8, '2026-07-01')],
      [playlist('l1', 'Mes projections', 'kyu', 2, 5, '2026-07-19')]
    )
    expect(d.enCours.map((x) => x.id)).toEqual(['l1', 'p1'])
    expect(d.enCours.some((x) => x.id === 'p2')).toBe(false)
  })

  it('classe par activite la plus recente : reprendre est immediat', () => {
    const d = buildDashboard(
      [parcours('p1', 'A', 1, 4, '2026-07-10'), parcours('p2', 'B', 2, 4, '2026-07-19')],
      []
    )
    expect(d.enCours.map((x) => x.id)).toEqual(['p2', 'p1'])
  })

  it('distingue un parcours Hazumi d’une playlist personnelle', () => {
    const d = buildDashboard([parcours('p1', 'A', 1, 4, '2026-07-10')], [playlist('l1', 'B', 'shiai', 1, 2, '2026-07-11')])
    expect(d.enCours.find((x) => x.id === 'p1')!.origine).toBe('hazumi')
    expect(d.enCours.find((x) => x.id === 'l1')!.origine).toBe('playlist')
  })

  it('calcule un pourcentage de progression', () => {
    const d = buildDashboard([parcours('p1', 'A', 3, 12, '2026-07-10')], [])
    expect(d.enCours[0].percent).toBe(25)
  })

  it('separe les elements termines de ceux en cours', () => {
    const d = buildDashboard(
      [parcours('p1', 'Fini', 4, 4, '2026-07-10'), parcours('p2', 'En cours', 1, 4, '2026-07-11')],
      []
    )
    expect(d.enCours.map((x) => x.id)).toEqual(['p2'])
    expect(d.termines.map((x) => x.id)).toEqual(['p1'])
  })

  it('expose un compteur global', () => {
    const d = buildDashboard(
      [parcours('p1', 'A', 1, 4, '2026-07-10'), parcours('p2', 'B', 4, 4, '2026-07-11')],
      [playlist('l1', 'C', 'kyu', 2, 5, '2026-07-12')]
    )
    expect(d.total).toBe(3)
    expect(d.nbEnCours).toBe(2)
    expect(d.nbTermines).toBe(1)
  })

  it('renvoie un tableau de bord vide sans rien planter', () => {
    const d = buildDashboard([], [])
    expect(d.enCours).toEqual([])
    expect(d.termines).toEqual([])
    expect(d.total).toBe(0)
  })

  it('ignore un parcours vide (aucune ressource) plutot que de diviser par zero', () => {
    const d = buildDashboard([parcours('p1', 'Vide', 0, 0, '2026-07-10')], [])
    expect(d.enCours).toEqual([])
    expect(d.termines).toEqual([])
  })

  it('conserve l’univers d’une playlist pour l’affichage', () => {
    const d = buildDashboard([], [playlist('l1', 'C', 'judo-ka', 1, 3, '2026-07-12')])
    expect(d.enCours[0].univers).toBe('judo-ka')
  })
})

describe('playlistProgress — une playlist est un filtre par tags', () => {
  const items = [
    { id: 'a', tags: ['hanche'] },
    { id: 'b', tags: ['Hanche', 'projection'] },
    { id: 'c', tags: ['jambe'] },
  ]

  it('compte les ressources correspondant aux tags de la playlist', () => {
    expect(playlistProgress(items, ['hanche'], []).total).toBe(2)
  })

  it('ignore la casse et les accents des tags', () => {
    expect(playlistProgress(items, ['HANCHE'], []).total).toBe(2)
  })

  it('compte les ressources terminees', () => {
    expect(playlistProgress(items, ['hanche'], ['a']).done).toBe(1)
  })

  it('renvoie zero sans tag', () => {
    expect(playlistProgress(items, [], []).total).toBe(0)
  })
})
