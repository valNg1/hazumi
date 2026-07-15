import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Kyu from '../eleve/Kyu'

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
    let mode: 'select' | 'insert' | 'update' = 'select'
    let payload: any = null
    function rows() {
      return ((store as any)[table] ?? []).filter(
        (r: any) => Object.entries(filters).every(([k, v]) => r[k] === v) && (inFilter ? inFilter.vals.includes(r[inFilter.col]) : true)
      )
    }
    function resolve() {
      if (mode === 'insert') { const a = Array.isArray(payload) ? payload : [payload]; (store as any)[table].push(...a); return { data: payload, error: null } }
      if (mode === 'update') { rows().forEach((r: any) => Object.assign(r, payload)); return { data: null, error: null } }
      return { data: rows(), error: null }
    }
    const builder: any = {
      select: () => builder,
      eq: (c: string, v: unknown) => { filters[c] = v; return builder },
      in: (c: string, v: unknown[]) => { inFilter = { col: c, vals: v }; return builder },
      order: () => Promise.resolve(resolve()),
      single: () => Promise.resolve({ data: rows()[0] ?? null, error: null }),
      maybeSingle: () => Promise.resolve({ data: rows()[0] ?? null, error: null }),
      insert: (p: any) => { mode = 'insert'; payload = p; return builder },
      update: (p: any) => { mode = 'update'; payload = p; return builder },
      upsert: (p: any) => { const a = Array.isArray(p) ? p : [p]; (store as any)[table].push(...a); return Promise.resolve({ data: p, error: null }) },
      then: (res: any) => res(resolve()),
    }
    return builder
  }
  return { supabase: { auth: { getUser: () => Promise.resolve({ data: { user: { id: h.store.userId } } }) }, from } }
})

beforeEach(() => {
  h.store.parcours = [{ id: 'p1', titre: 'Parcours Kyu Test', description: 'Desc', niveau: '1er dan', image: null, duree_estimee: '8 sem', ordre: 1, publie: true }]
  h.store.parcours_univers = [{ parcours_id: 'p1', univers: 'kyu' }]
  h.store.parcours_ressources = [{ id: 'l1', parcours_id: 'p1', ressource_id: 'r1', ordre: 1, obligatoire: true, commentaire: null }]
  h.store.catalogue_hazumi = [{ id: 'r1', titre: 'Harai-goshi', type: 'article', url: null, contenu: 'Texte', tags: [], grade: '1er dan', famille: 'Koshi-waza' }]
  h.store.lesson = []
  h.store.user_parcours = []
})

function renderPage() { return render(<MemoryRouter><Kyu /></MemoryRouter>) }

describe('Kyu — Parcours Hazumi + Mon Dojo (sans onglet Ma progression)', () => {
  it('affiche uniquement les onglets Parcours Hazumi et Mon Dojo', async () => {
    renderPage()
    await waitFor(() => screen.getByText('Parcours Kyu Test'))
    expect(screen.getByRole('button', { name: 'Parcours Hazumi' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Mon Dojo/ })).toBeInTheDocument()
    // l'onglet Ma progression a été supprimé
    expect(screen.queryByText('Ma progression')).toBeNull()
  })

  it('l’onglet Parcours Hazumi liste les parcours de l’univers kyu', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('Parcours Kyu Test')).toBeInTheDocument())
  })

  it('l’onglet Mon Dojo affiche la bibliothèque personnelle sans contenu Hazumi', async () => {
    renderPage()
    await waitFor(() => screen.getByText('Parcours Kyu Test'))
    await userEvent.click(screen.getByRole('button', { name: /Mon Dojo/ }))
    await waitFor(() => expect(screen.getByPlaceholderText('Titre')).toBeInTheDocument())
    expect(screen.queryByText('Contenu Hazumi')).toBeNull()
  })
})
