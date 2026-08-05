import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Comprendre from '../Comprendre'
import ComprendreDetail from '../ComprendreDetail'
import * as lib from '../../../lib/masterclasses'

vi.mock('../../../lib/masterclasses', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../lib/masterclasses')>()),
  fetchPublishedMasterclasses: vi.fn(),
  fetchMasterclassBySlug: vi.fn(),
}))

const mc = {
  id: '1', titre: 'Reprise initiative', slug: 'reprise', youtube_url: 'https://youtu.be/zgQidLmOXG8',
  contenu: '# Video chapters\n\n## 00:00 — Intro\n\ntexte intro\n\n## 02:03 — Suite\n\ntexte suite',
  published: true, created_at: '2026-08-05',
}

beforeEach(() => vi.clearAllMocks())

describe('Comprendre — liste', () => {
  it('liste les masterclasses publiées avec un lien vers le détail', async () => {
    vi.mocked(lib.fetchPublishedMasterclasses).mockResolvedValue([mc])
    render(<MemoryRouter><Comprendre /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('Reprise initiative')).toBeInTheDocument())
    expect(screen.getByRole('link')).toHaveAttribute('href', '/comprendre/reprise')
  })

  it('affiche un état vide sans masterclass', async () => {
    vi.mocked(lib.fetchPublishedMasterclasses).mockResolvedValue([])
    render(<MemoryRouter><Comprendre /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText(/Aucune masterclass/i)).toBeInTheDocument())
  })
})

describe('Comprendre — détail', () => {
  function renderDetail() {
    return render(
      <MemoryRouter initialEntries={['/comprendre/reprise']}>
        <Routes><Route path="/comprendre/:slug" element={<ComprendreDetail />} /></Routes>
      </MemoryRouter>
    )
  }

  it('affiche titre, vidéo intégrée, chapitres et contenu markdown', async () => {
    vi.mocked(lib.fetchMasterclassBySlug).mockResolvedValue(mc)
    renderDetail()
    await waitFor(() => expect(screen.getByRole('heading', { level: 1, name: 'Reprise initiative' })).toBeInTheDocument())
    expect(screen.getByTitle('Lecteur vidéo').getAttribute('src')).toContain('youtube.com/embed/zgQidLmOXG8')
    expect(screen.getByText('Intro')).toBeInTheDocument()
    expect(screen.getByText('Suite')).toBeInTheDocument()
    expect(screen.getByText('texte intro')).toBeInTheDocument()
  })

  it('le clic sur un chapitre saute la vidéo au bon horodatage', async () => {
    vi.mocked(lib.fetchMasterclassBySlug).mockResolvedValue(mc)
    renderDetail()
    await waitFor(() => screen.getByText('Suite'))
    await userEvent.click(screen.getByText('Suite'))
    await waitFor(() => expect(screen.getByTitle('Lecteur vidéo').getAttribute('src')).toContain('start=123'))
  })

  it('affiche « introuvable » si le slug n’existe pas', async () => {
    vi.mocked(lib.fetchMasterclassBySlug).mockResolvedValue(null)
    renderDetail()
    await waitFor(() => expect(screen.getByText(/introuvable/i)).toBeInTheDocument())
  })
})
