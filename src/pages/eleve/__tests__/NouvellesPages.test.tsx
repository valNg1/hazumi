import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Bibliotheque from '../Bibliotheque'
import MonEspace from '../MonEspace'

const CATALOGUE = [
  { id: 'c1', titre: 'Harai-goshi', type: 'article', parcours: 'kyu', tags: ['hanche'], grade: '1er dan', famille: 'Koshi-waza', url: null, contenu: 'Fiche.' },
  { id: 'c2', titre: 'O-soto-gari', type: 'article', parcours: 'kyu', tags: ['jambe'], grade: 'jaune', famille: 'Ashi-waza', url: null, contenu: 'Fiche.' },
  { id: 'c3', titre: 'Jigoro Kano', type: 'article', parcours: 'judo-ka', tags: ['histoire'], grade: null, famille: null, url: null, contenu: 'Fiche.' },
]
const VIDEOS = [
  { id: 'v1', title: 'Mon randori', video_url: 'https://youtu.be/abc', tags: 'randori', parcours: 'shiai' },
]
const PLAYLISTS = [
  { id: 'pl1', nom: 'Mes hanches', tags: ['hanche'], parcours: 'kyu' },
]

const h = vi.hoisted(() => ({ inserted: [] as { table: string; row: unknown }[] }))

vi.mock('../../../lib/supabase', () => ({
  supabase: {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
    from: vi.fn((table: string) => {
      const chain = {
        select: vi.fn(() => chain),
        eq: vi.fn(() => chain),
        order: vi.fn(() => chain),
        single: vi.fn().mockResolvedValue({ data: { id: 'j1' } }),
        insert: vi.fn((row: unknown) => { h.inserted.push({ table, row }); return Promise.resolve({ error: null }) }),
        then: (resolve: (v: { data: unknown }) => void) => {
          const data =
            table === 'catalogue_hazumi' ? CATALOGUE
            : table === 'videos' ? VIDEOS
            : table === 'playlists_collections' ? PLAYLISTS
            : []
          return Promise.resolve({ data }).then(resolve)
        },
      }
      return chain
    }),
  },
}))

function renderAt(ui: React.ReactElement, route = '/bibliotheque') {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>)
}

beforeEach(() => { h.inserted = []; vi.clearAllMocks() })

describe('Bibliothèque — liste des ressources', () => {
  it('affiche le nom de la section et une phrase explicative', async () => {
    renderAt(<Bibliotheque />)
    await waitFor(() => expect(screen.getByRole('heading', { name: /Bibliothèque/i })).toBeInTheDocument())
    expect(screen.getByTestId('section-intro').textContent?.length).toBeGreaterThan(20)
  })

  it('montre les ressources immédiatement, sans choisir d’univers', async () => {
    renderAt(<Bibliotheque />)
    await waitFor(() => expect(screen.getByText('Harai-goshi')).toBeInTheDocument())
    expect(screen.getByText('O-soto-gari')).toBeInTheDocument()
    expect(screen.getByText('Jigoro Kano')).toBeInTheDocument()
  })

  // Retour de recette : aucun regroupement. Seule l'origine distingue les contenus.
  it('ne regroupe rien : pas de rayon par famille technique', async () => {
    renderAt(<Bibliotheque />)
    await waitFor(() => expect(screen.getByText('Harai-goshi')).toBeInTheDocument())
    expect(screen.queryByRole('heading', { name: 'Koshi-waza' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Ashi-waza' })).toBeNull()
  })

  it('distingue le contenu Hazumi du contenu du judoka', async () => {
    renderAt(<Bibliotheque />)
    await waitFor(() => expect(screen.getByText('Harai-goshi')).toBeInTheDocument())
    const liste = within(screen.getByTestId('liste-ressources'))
    expect(liste.getAllByText('Hazumi')).toHaveLength(3)
    expect(liste.getAllByText('Perso')).toHaveLength(1)
  })

  it('affiche les mots-clés de chaque ressource', async () => {
    renderAt(<Bibliotheque />)
    await waitFor(() => expect(screen.getByText('hanche')).toBeInTheDocument())
    expect(screen.getByText('jambe')).toBeInTheDocument()
    expect(screen.getByText('randori')).toBeInTheDocument()
  })

  it('permet de filtrer par origine', async () => {
    renderAt(<Bibliotheque />)
    await waitFor(() => expect(screen.getByText('Harai-goshi')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: 'Mes contenus' }))
    await waitFor(() => expect(screen.queryByText('Harai-goshi')).toBeNull())
    expect(screen.getByText('Mon randori')).toBeInTheDocument()
  })

  it('permet de rechercher', async () => {
    renderAt(<Bibliotheque />)
    await waitFor(() => expect(screen.getByText('Harai-goshi')).toBeInTheDocument())
    await userEvent.type(screen.getByLabelText(/Rechercher/i), 'soto')
    await waitFor(() => expect(screen.queryByText('Harai-goshi')).toBeNull())
    expect(screen.getByText('O-soto-gari')).toBeInTheDocument()
  })

  it('propose d’ajouter une ressource', async () => {
    renderAt(<Bibliotheque />)
    await waitFor(() => expect(screen.getByText('Harai-goshi')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /Ajouter une ressource/i }))
    await userEvent.type(screen.getByLabelText(/Titre de la ressource/i), 'Ma vidéo')
    await userEvent.type(screen.getByLabelText(/Lien de la ressource/i), 'https://youtu.be/xyz')
    await userEvent.type(screen.getByLabelText(/Mots-clés/i), 'kata')
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter' }))
    await waitFor(() => expect(h.inserted.filter((i) => i.table === 'videos')).toHaveLength(1))
    expect(h.inserted[0].row).toMatchObject({ title: 'Ma vidéo', tags: 'kata' })
  })
})

// Retour de recette : ouvrir une playlist doit montrer SES ressources.
describe('Bibliothèque — vue playlist', () => {
  it('n’affiche que les ressources de la playlist ouverte', async () => {
    renderAt(<Bibliotheque />, '/bibliotheque?playlist=pl1')
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Mes hanches' })).toBeInTheDocument())
    expect(screen.getByText('Harai-goshi')).toBeInTheDocument()
    expect(screen.queryByText('O-soto-gari')).toBeNull()
    expect(screen.queryByText('Jigoro Kano')).toBeNull()
  })

  it('rappelle l’univers de la playlist', async () => {
    renderAt(<Bibliotheque />, '/bibliotheque?playlist=pl1')
    await waitFor(() => expect(screen.getByTestId('section-intro').textContent).toMatch(/Playlist · Kyu/))
  })

  it('permet de revenir à toute la bibliothèque', async () => {
    renderAt(<Bibliotheque />, '/bibliotheque?playlist=pl1')
    await waitFor(() => expect(screen.getByRole('button', { name: /Toute la bibliothèque/i })).toBeInTheDocument())
  })
})

describe('Bibliothèque — création de playlist', () => {
  it('l’univers n’intervient qu’à la création', async () => {
    renderAt(<Bibliotheque />)
    await waitFor(() => expect(screen.getByText('Harai-goshi')).toBeInTheDocument())
    expect(screen.queryByRole('button', { name: /Judo-Kâ/ })).toBeNull()

    await userEvent.click(screen.getByRole('button', { name: /Créer une playlist/i }))
    await userEvent.click(screen.getByText('Harai-goshi'))
    await userEvent.click(screen.getByRole('button', { name: /Continuer/i }))

    await waitFor(() => expect(screen.getByRole('heading', { name: /Nouvelle playlist/i })).toBeInTheDocument())
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

    await waitFor(() => expect(h.inserted.filter((i) => i.table === 'playlists_collections')).toHaveLength(1))
    expect(h.inserted[0].row).toMatchObject({ nom: 'Mes hanches', parcours: 'shiai', tags: ['hanche'] })
  })
})

describe('Mon espace', () => {
  it('affiche le nom de la section', () => {
    renderAt(<MonEspace />)
    expect(screen.getByRole('heading', { name: /Mon espace/i })).toBeInTheDocument()
  })

  it('porte la navigation interne dès la page d’accueil', () => {
    renderAt(<MonEspace />)
    expect(screen.getByRole('navigation', { name: 'Mon espace' })).toBeInTheDocument()
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
