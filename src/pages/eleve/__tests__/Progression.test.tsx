import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Progression from '../Progression'

vi.mock('../../../lib/supabase', () => ({
  supabase: {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
    from: vi.fn(() => {
      const chain = {
        select: vi.fn(() => chain),
        eq: vi.fn(() => chain),
        in: vi.fn(() => chain),
        order: vi.fn(() => chain),
        single: vi.fn().mockResolvedValue({ data: { id: 'j1' } }),
        then: (resolve: (v: { data: unknown }) => void) => Promise.resolve({ data: [] }).then(resolve),
      }
      return chain
    }),
  },
}))

beforeEach(() => vi.clearAllMocks())

function renderPage() {
  return render(<MemoryRouter><Progression /></MemoryRouter>)
}

// Retour de recette WP 1.2, point 11 : la page ne conserve que la progression
// dans les parcours. Le suivi du curriculum par ceinture est retire.
describe('Ma progression', () => {
  it('affiche le titre de la page', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByRole('heading', { name: /Ma progression/i })).toBeInTheDocument())
  })

  it('porte la navigation interne de Mon espace', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByRole('navigation', { name: 'Mon espace' })).toBeInTheDocument())
  })

  it('ne montre plus la progression par grade ni les ceintures', async () => {
    const { container } = renderPage()
    await waitFor(() => expect(screen.getByRole('heading', { name: /Ma progression/i })).toBeInTheDocument())
    expect(container.textContent).not.toMatch(/ceinture/i)
    expect(container.textContent).not.toMatch(/acquis|à travailler/i)
    expect(screen.queryByText(/Kyu/)).toBeNull()
  })

  it('affiche le tableau de bord des parcours', async () => {
    renderPage()
    // Sans parcours commence, le tableau de bord invite a en decouvrir un.
    await waitFor(() => expect(screen.getByText(/pas encore commencé de parcours/i)).toBeInTheDocument())
    expect(screen.getByRole('button', { name: /Découvrir les parcours/i })).toBeInTheDocument()
  })
})
