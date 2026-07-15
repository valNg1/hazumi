import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import JudoKa from '../eleve/JudoKa'

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
  h.store.parcours = [{ id: 'p1', titre: 'Culture judo — les essentiels', description: 'Desc', niveau: null, image: null, duree_estimee: null, ordre: 1, publie: true }]
  h.store.parcours_univers = [{ parcours_id: 'p1', univers: 'judo-ka' }]
  h.store.parcours_ressources = [{ id: 'l1', parcours_id: 'p1', ressource_id: 'r1', ordre: 1, obligatoire: true, commentaire: null }]
  h.store.catalogue_hazumi = [{ id: 'r1', titre: 'Lexique termes japonais', type: 'pdf', url: 'https://x/lex.pdf', contenu: null, tags: [], grade: null, famille: null }]
  h.store.lesson = []
  h.store.user_parcours = []
})

function renderPage() { return render(<MemoryRouter><JudoKa /></MemoryRouter>) }

describe('Judo-Kâ — bascule parcours-first', () => {
  it('affiche les parcours de l’univers judo-ka (plus de bibliothèque)', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('Culture judo — les essentiels')).toBeInTheDocument())
    expect(screen.getByText('Judo-Ka')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('Titre')).toBeNull() // plus de barre d’ajout perso
  })

  it('ouvrir un parcours affiche ses ressources', async () => {
    renderPage()
    await waitFor(() => screen.getByText('Culture judo — les essentiels'))
    await userEvent.click(screen.getByText('Culture judo — les essentiels'))
    await waitFor(() => expect(screen.getByText('Lexique termes japonais')).toBeInTheDocument())
  })
})
