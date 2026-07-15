import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Shiai from '../eleve/Shiai'

const h = vi.hoisted(() => ({
  store: {
    userId: 'u1',
    judokas: [{ id: 'j1', user_id: 'u1' }] as any[],
    parcours: [] as any[],
    parcours_univers: [] as any[],
    parcours_ressources: [] as any[],
    catalogue_hazumi: [] as any[],
    lesson: [] as any[],
    user_parcours: [] as any[],
  },
}))

vi.mock('../../lib/supabase', () => {
  const { store } = h
  function from(table: string) {
    const filters: Record<string, unknown> = {}
    let inFilter: { col: string; vals: unknown[] } | null = null
    function rows() {
      return ((store as any)[table] ?? []).filter(
        (r: any) => Object.entries(filters).every(([k, v]) => r[k] === v) && (inFilter ? inFilter.vals.includes(r[inFilter.col]) : true)
      )
    }
    const builder: any = {
      select: () => builder,
      eq: (c: string, v: unknown) => { filters[c] = v; return builder },
      in: (c: string, v: unknown[]) => { inFilter = { col: c, vals: v }; return builder },
      order: () => Promise.resolve({ data: rows(), error: null }),
      single: () => Promise.resolve({ data: rows()[0] ?? null, error: null }),
      maybeSingle: () => Promise.resolve({ data: rows()[0] ?? null, error: null }),
      then: (res: any) => res({ data: rows(), error: null }),
    }
    return builder
  }
  return { supabase: { auth: { getUser: () => Promise.resolve({ data: { user: { id: h.store.userId } } }) }, from } }
})

beforeEach(() => {
  h.store.parcours = []
  h.store.parcours_univers = []
})

describe('Shiai — bascule parcours-first', () => {
  it('affiche l’en-tête Shiai et l’état vide quand aucun parcours compétition publié', async () => {
    render(<MemoryRouter><Shiai /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('Shiai')).toBeInTheDocument())
    expect(screen.getByText(/Aucun parcours disponible/i)).toBeInTheDocument()
  })
})
