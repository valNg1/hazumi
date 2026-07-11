import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Parcours from '../Parcours'

const h = vi.hoisted(() => ({
  store: {
    userId: 'u1',
    judokas: [{ id: 'j1', user_id: 'u1' }] as any[],
    parcours: [] as any[],
    parcours_ressources: [] as any[],
    catalogue_hazumi: [] as any[],
    user_parcours: [] as any[],
  },
}))

vi.mock('../../../lib/supabase', () => {
  const { store } = h
  function from(table: string) {
    const filters: Record<string, unknown> = {}
    let inFilter: { col: string; vals: unknown[] } | null = null
    let mode: 'select' | 'insert' | 'update' = 'select'
    let payload: any = null

    function rows() {
      return (store as any)[table].filter(
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

function seed() {
  h.store.parcours = [
    { id: 'p1', titre: 'Préparer le 1er Dan', description: 'Desc', niveau: '1er dan', image: null, duree_estimee: '≈ 8 semaines', ordre: 1, publie: true },
  ]
  h.store.parcours_ressources = [
    { id: 'l1', parcours_id: 'p1', ressource_id: 'r1', ordre: 1, obligatoire: true, commentaire: null },
    { id: 'l2', parcours_id: 'p1', ressource_id: 'r2', ordre: 2, obligatoire: true, commentaire: null },
  ]
  h.store.catalogue_hazumi = [
    { id: 'r1', titre: 'Harai-goshi', type: 'article', url: null, contenu: 'Texte 1', tags: ['hanche'], grade: '1er dan', famille: 'Koshi-waza' },
    { id: 'r2', titre: 'O-soto-gari', type: 'article', url: null, contenu: 'Texte 2', tags: ['jambe'], grade: '1er dan', famille: 'Ashi-waza' },
  ]
  h.store.user_parcours = []
}

beforeEach(() => {
  seed()
})

function renderPage() {
  return render(<MemoryRouter><Parcours /></MemoryRouter>)
}

describe('Parcours (moteur de parcours pedagogiques)', () => {
  it('affiche la liste des parcours publies', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Préparer le 1er Dan')).toBeInTheDocument()
      expect(screen.getByText('Non commencé')).toBeInTheDocument()
    })
  })

  it("ouvre un parcours et affiche ses ressources dans l'ordre avec 0%", async () => {
    renderPage()
    await waitFor(() => screen.getByText('Préparer le 1er Dan'))
    await userEvent.click(screen.getByText('Préparer le 1er Dan'))

    await waitFor(() => {
      expect(screen.getByText('Harai-goshi')).toBeInTheDocument()
      expect(screen.getByText('O-soto-gari')).toBeInTheDocument()
      expect(screen.getByText('0%')).toBeInTheDocument()
      expect(screen.getByText('Commencer')).toBeInTheDocument()
    })
  })

  it('marque une ressource terminee et met a jour la progression automatiquement', async () => {
    renderPage()
    await waitFor(() => screen.getByText('Préparer le 1er Dan'))
    await userEvent.click(screen.getByText('Préparer le 1er Dan'))
    await waitFor(() => screen.getByText('Harai-goshi'))

    const checkButtons = screen.getAllByTitle('Marquer comme terminé')
    await userEvent.click(checkButtons[0])

    await waitFor(() => {
      expect(screen.getByText('50%')).toBeInTheDocument()
      expect(screen.getByText('Reprendre')).toBeInTheDocument()
    })
    // persistance: la ligne user_parcours reflete la progression
    const up = h.store.user_parcours.find((u) => u.parcours_id === 'p1')
    expect(up?.progression).toBe(50)
    expect(up?.ressources_terminees).toEqual(['r1'])
  })

  it("ouvre le lecteur d'article avec grade, famille et mots-cles", async () => {
    renderPage()
    await waitFor(() => screen.getByText('Préparer le 1er Dan'))
    await userEvent.click(screen.getByText('Préparer le 1er Dan'))
    await waitFor(() => screen.getByText('Harai-goshi'))

    await userEvent.click(screen.getAllByText('Lire')[0])
    const contenu = await screen.findByText('Texte 1')
    const modal = contenu.closest('div') as HTMLElement
    expect(within(modal).getByText('Koshi-waza')).toBeInTheDocument()
    expect(within(modal).getByText('1er dan')).toBeInTheDocument()
    expect(within(modal).getByText('hanche')).toBeInTheDocument()
  })
})
