import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Bibliotheque from '../Bibliotheque'
import MonEspace from '../MonEspace'

const CATALOGUE = [
  { id: 'c1', titre: 'Harai-goshi', type: 'article', parcours: 'kyu', tags: ['hanche'], grade: '1er dan', famille: 'Koshi-waza', url: null, contenu: 'Fiche.' },
  { id: 'c2', titre: 'O-soto-gari', type: 'article', parcours: 'kyu', tags: ['jambe'], grade: 'jaune', famille: 'Ashi-waza', url: null, contenu: 'Fiche.' },
  { id: 'c3', titre: 'Jigoro Kano', type: 'article', parcours: 'judo-ka', tags: ['histoire'], grade: null, famille: null, url: null, contenu: 'Fiche.' },
]

const h = vi.hoisted(() => ({ inserted: [] as unknown[] }))

vi.mock('../../../lib/supabase', () => ({
  supabase: {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
    from: vi.fn((table: string) => {
      const chain = {
        select: vi.fn(() => chain),
        eq: vi.fn(() => chain),
        order: vi.fn(() => chain),
        single: vi.fn().mockResolvedValue({ data: { id: 'j1' } }),
        maybeSingle: vi.fn().mockResolvedValue({ data: null }),
        insert: vi.fn((row: unknown) => { h.inserted.push(row); return Promise.resolve({ error: null }) }),
        then: (resolve: (v: { data: unknown }) => void) => {
          if (table === 'catalogue_hazumi') return Promise.resolve({ data: CATALOGUE }).then(resolve)
          if (table === 'lesson') return Promise.resolve({ data: [] }).then(resolve)
          return Promise.resolve({ data: [] }).then(resolve)
        },
      }
      return chain
    }),
  },
}))

function renderAt(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

beforeEach(() => { h.inserted = []; vi.clearAllMocks() })

// WP 1.2 — la Bibliotheque devient le point d'entree unique vers les ressources.
describe('Bibliothèque — point d’entrée unique (WP 1.2)', () => {
  it('affiche le nom de la section et une phrase explicative', async () => {
    renderAt(<Bibliotheque />)
    await waitFor(() => expect(screen.getByRole('heading', { name: /Bibliothèque/i })).toBeInTheDocument())
    expect(screen.getByTestId('section-intro').textContent?.length).toBeGreaterThan(20)
  })

  it('montre les ressources immédiatement, sans choisir d’univers au préalable', async () => {
    renderAt(<Bibliotheque />)
    await waitFor(() => expect(screen.getByText('Harai-goshi')).toBeInTheDocument())
    expect(screen.getByText('O-soto-gari')).toBeInTheDocument()
    expect(screen.getByText('Jigoro Kano')).toBeInTheDocument() // autre univers, visible sans filtre
  })

  it('regroupe les ressources en rayons', async () => {
    renderAt(<Bibliotheque />)
    await waitFor(() => expect(screen.getByRole('heading', { name: /Koshi-waza/ })).toBeInTheDocument())
    expect(screen.getByRole('heading', { name: /Ashi-waza/ })).toBeInTheDocument()
  })

  it('permet de rechercher sans quitter la page', async () => {
    renderAt(<Bibliotheque />)
    await waitFor(() => expect(screen.getByText('Harai-goshi')).toBeInTheDocument())
    await userEvent.type(screen.getByLabelText(/Rechercher/i), 'soto')
    await waitFor(() => expect(screen.queryByText('Harai-goshi')).toBeNull())
    expect(screen.getByText('O-soto-gari')).toBeInTheDocument()
  })

  it('l’univers n’intervient qu’à la création d’une playlist', async () => {
    renderAt(<Bibliotheque />)
    await waitFor(() => expect(screen.getByText('Harai-goshi')).toBeInTheDocument())

    // Aucun choix d'univers avant d'entrer en mode selection.
    expect(screen.queryByRole('button', { name: 'Judo-Kâ' })).toBeNull()

    await userEvent.click(screen.getByRole('button', { name: /Créer une playlist/i }))
    await userEvent.click(screen.getByText('Harai-goshi'))
    await userEvent.click(screen.getByRole('button', { name: /Continuer/i }))

    await waitFor(() => expect(screen.getByRole('heading', { name: /Nouvelle playlist/i })).toBeInTheDocument())
    expect(screen.getByRole('button', { name: /Kyu/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Shiai/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Judo-Kâ/ })).toBeInTheDocument()
  })

  it('enregistre la playlist avec l’univers choisi', async () => {
    renderAt(<Bibliotheque />)
    await waitFor(() => expect(screen.getByText('Harai-goshi')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /Créer une playlist/i }))
    await userEvent.click(screen.getByText('Harai-goshi'))
    await userEvent.click(screen.getByRole('button', { name: /Continuer/i }))
    await userEvent.type(screen.getByLabelText(/Nom de la playlist/i), 'Mes hanches')
    await userEvent.click(screen.getByRole('button', { name: /Shiai/ }))
    await userEvent.click(screen.getByRole('button', { name: /Créer la playlist/i }))

    await waitFor(() => expect(h.inserted).toHaveLength(1))
    expect(h.inserted[0]).toMatchObject({ nom: 'Mes hanches', parcours: 'shiai', tags: ['hanche'] })
  })
})

describe('Mon espace — page transitoire', () => {
  it('affiche le nom de la section', () => {
    renderAt(<MonEspace />)
    expect(screen.getByRole('heading', { name: /Mon espace/i })).toBeInTheDocument()
  })

  it('donne accès aux fonctions personnelles existantes', () => {
    renderAt(<MonEspace />)
    const cibles = screen.getAllByRole('link').map((l) => l.getAttribute('href'))
    expect(cibles).toContain('/eleve/entrainements')
    expect(cibles).toContain('/eleve/agenda')
    expect(cibles).toContain('/eleve/messages')
    expect(cibles).toContain('/eleve/profil')
    expect(cibles).toContain('/eleve/progression')
  })
})
