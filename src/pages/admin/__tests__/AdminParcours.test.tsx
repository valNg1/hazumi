import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminParcoursPage from '../Parcours'

// Régression du bug : la liste admin ne doit filtrer NI par publie NI autrement —
// tous les parcours (publiés ou non) doivent apparaître, avec leur statut.
const PARCOURS = [
  { id: 'p1', titre: 'Préparer le 1er Dan', niveau: '1er dan', publie: true, ordre: 1 },
  { id: 'p2', titre: 'Culture judo — les essentiels', niveau: null, publie: false, ordre: 23 },
]

const h = vi.hoisted(() => ({
  order: vi.fn(),
  eqFilters: [] as unknown[][],
  updates: [] as { id: unknown; row: unknown }[],
}))

vi.mock('../../../lib/supabase', () => {
  const makeChain = (table: string) => {
    const chain: Record<string, unknown> = {
      select: vi.fn(() => chain),
      eq: vi.fn((...a: unknown[]) => { h.eqFilters.push(a); return chain }),
      order: vi.fn(() => { h.order(); return Promise.resolve({ data: PARCOURS, error: null }) }),
      update: vi.fn((row: unknown) => ({
        eq: vi.fn((_c: string, id: unknown) => { h.updates.push({ id, row }); return Promise.resolve({ error: null }) }),
      })),
    }
    void table
    return chain
  }
  return { supabase: { from: vi.fn((t: string) => makeChain(t)) } }
})

beforeEach(() => { h.eqFilters.length = 0; h.updates.length = 0; vi.clearAllMocks() })

describe('Admin — liste des parcours', () => {
  it('liste TOUS les parcours, publiés ET non publiés (aucun filtre publie)', async () => {
    render(<AdminParcoursPage />)
    await waitFor(() => expect(screen.getByText('Préparer le 1er Dan')).toBeInTheDocument())
    expect(screen.getByText('Culture judo — les essentiels')).toBeInTheDocument()
    // Régression : aucun filtre .eq('publie', …) ne doit être appliqué au listing.
    expect(h.eqFilters.some((f) => f[0] === 'publie')).toBe(false)
  })

  it('affiche clairement le statut de chaque parcours', async () => {
    render(<AdminParcoursPage />)
    await waitFor(() => expect(screen.getByText('Publié')).toBeInTheDocument())
    expect(screen.getByText('Non publié')).toBeInTheDocument()
  })

  it('permet de dépublier un parcours publié', async () => {
    render(<AdminParcoursPage />)
    await waitFor(() => expect(screen.getByText('Préparer le 1er Dan')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: 'Dépublier' }))
    await waitFor(() => expect(h.updates).toHaveLength(1))
    expect(h.updates[0]).toMatchObject({ id: 'p1', row: { publie: false } })
  })

  it('permet de publier un parcours non publié', async () => {
    render(<AdminParcoursPage />)
    await waitFor(() => expect(screen.getByText('Culture judo — les essentiels')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: 'Publier' }))
    await waitFor(() => expect(h.updates).toHaveLength(1))
    expect(h.updates[0]).toMatchObject({ id: 'p2', row: { publie: true } })
  })
})
