import { describe, it, expect } from 'vitest'
import { buildUserGrowthData } from '../adminStats'

describe('buildUserGrowthData', () => {
  it('retourne [] si aucun judoka', () => {
    expect(buildUserGrowthData([], new Date('2026-03-31T00:00:00Z'))).toEqual([])
  })

  it('calcule le cumul mensuel des comptes créés (croissant)', () => {
    const judokas = [
      { created_at: '2026-01-15T10:00:00Z' },
      { created_at: '2026-01-20T10:00:00Z' },
      { created_at: '2026-03-05T10:00:00Z' },
    ]
    const data = buildUserGrowthData(judokas, new Date('2026-03-31T00:00:00Z'))
    // janvier, février, mars
    expect(data).toHaveLength(3)
    expect(data.map((d) => d.total)).toEqual([2, 2, 3])
  })

  it('le cumul ne décroît jamais', () => {
    const judokas = [
      { created_at: '2026-01-05T00:00:00Z' },
      { created_at: '2026-02-05T00:00:00Z' },
      { created_at: '2026-02-25T00:00:00Z' },
      { created_at: '2026-04-01T00:00:00Z' },
    ]
    const data = buildUserGrowthData(judokas, new Date('2026-04-15T00:00:00Z'))
    const totals = data.map((d) => d.total)
    for (let i = 1; i < totals.length; i++) {
      expect(totals[i]).toBeGreaterThanOrEqual(totals[i - 1])
    }
    // dernier point = total de tous les comptes
    expect(totals[totals.length - 1]).toBe(4)
  })

  it('chaque point porte un label de mois non vide', () => {
    const data = buildUserGrowthData([{ created_at: '2026-01-15T00:00:00Z' }], new Date('2026-02-15T00:00:00Z'))
    expect(data.length).toBeGreaterThan(0)
    for (const p of data) expect(p.label.length).toBeGreaterThan(0)
  })
})
