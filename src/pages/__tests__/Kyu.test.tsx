import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Kyu from '../eleve/Kyu'

const h = vi.hoisted(() => ({
  store: {
    userId: 'u1',
    judokas: [{ id: 'j1', user_id: 'u1', belt: 'jaune', objectif: '', parcours: 'kyu' }] as any[],
    parcours: [] as any[],
    parcours_univers: [] as any[],
    parcours_ressources: [] as any[],
    catalogue_hazumi: [] as any[],
    lesson: [] as any[],
    user_parcours: [] as any[],
    technique_mastery: [] as any[],
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
        (r: any) =>
          Object.entries(filters).every(([k, v]) => r[k] === v) &&
          (inFilter ? inFilter.vals.includes(r[inFilter.col]) : true)
      )
    }
    function resolve() {
      if (mode === 'insert') {
        const arr = Array.isArray(payload) ? payload : [payload]
        ;(store as any)[table].push(...arr)
        return { data: payload, error: null }
      }
      if (mode === 'update') {
        rows().forEach((r: any) => Object.assign(r, payload))
        return { data: null, error: null }
      }
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
      upsert: (p: any) => {
        const arr = Array.isArray(p) ? p : [p]
        ;(store as any)[table].push(...arr)
        return Promise.resolve({ data: p, error: null })
      },
      then: (res: any) => res(resolve()),
    }
    return builder
  }
  return {
    supabase: {
      auth: { getUser: () => Promise.resolve({ data: { user: { id: h.store.userId } } }) },
      from,
    },
  }
})

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn()
})

beforeEach(() => {
  h.store.judokas = [{ id: 'j1', user_id: 'u1', belt: 'jaune', objectif: '', parcours: 'kyu' }]
  h.store.parcours = [
    { id: 'p1', titre: 'Parcours Kyu Test', description: 'Desc', niveau: '1er dan', image: null, duree_estimee: '8 sem', ordre: 1, publie: true },
  ]
  h.store.parcours_univers = [{ parcours_id: 'p1', univers: 'kyu' }]
  h.store.parcours_ressources = [{ id: 'l1', parcours_id: 'p1', ressource_id: 'r1', ordre: 1, obligatoire: true, commentaire: null }]
  h.store.catalogue_hazumi = [{ id: 'r1', titre: 'Harai-goshi', type: 'article', url: null, contenu: 'Texte', tags: [], grade: '1er dan', famille: 'Koshi-waza' }]
  h.store.lesson = []
  h.store.user_parcours = []
  h.store.technique_mastery = []
})

function renderPage() {
  return render(<MemoryRouter><Kyu /></MemoryRouter>)
}

describe('Kyu — bascule parcours-first (Phase 2)', () => {
  it('affiche l’onglet Parcours par défaut avec les parcours KYU publiés', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Parcours Kyu Test')).toBeInTheDocument()
    })
    // onglets attendus
    expect(screen.getByRole('button', { name: 'Parcours' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ma progression' })).toBeInTheDocument()
  })

  it('n’expose plus la bibliothèque de ressources comme écran d’accueil', async () => {
    renderPage()
    await waitFor(() => screen.getByText('Parcours Kyu Test'))
    expect(screen.queryByText('Ma bibliothèque')).toBeNull()
    // la barre d’ajout de contenu perso a disparu de KYU
    expect(screen.queryByPlaceholderText('Titre')).toBeNull()
    expect(screen.queryByPlaceholderText('URL')).toBeNull()
  })

  it('ouvrir un parcours affiche ses leçons (les ressources)', async () => {
    renderPage()
    await waitFor(() => screen.getByText('Parcours Kyu Test'))
    await userEvent.click(screen.getByText('Parcours Kyu Test'))
    await waitFor(() => expect(screen.getByText('Harai-goshi')).toBeInTheDocument())
  })

  it('l’onglet Ma progression conserve le suivi par ceinture', async () => {
    renderPage()
    await waitFor(() => screen.getByText('Ma progression'))
    await userEvent.click(screen.getByText('Ma progression'))
    await waitFor(() => expect(screen.getByText(/acquis/)).toBeInTheDocument())
  })
})
