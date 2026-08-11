import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import EnseignantLecon from '../EnseignantLecon'
import * as lib from '../../../lib/masterclasses'

vi.mock('../../../lib/masterclasses', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../lib/masterclasses')>()),
  fetchMasterclassBySlug: vi.fn(),
}))

const mc = {
  id: '1',
  titre: 'Construire le randori — de la maîtrise de soi au progrès mutuel',
  slug: 'patrick-roux-progression-randori',
  youtube_url: 'https://youtu.be/Pa-XftyNS-0',
  contenu: '# Construire le randori\n\n## Intention pédagogique\n\nLe randori se construit progressivement.',
  published: true,
  created_at: '2026-08-11',
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/enseignant/patrick-roux-progression-randori']}>
      <Routes><Route path="/enseignant/:slug" element={<EnseignantLecon />} /></Routes>
    </MemoryRouter>
  )
}

beforeEach(() => vi.clearAllMocks())

describe('EnseignantLecon', () => {
  it('affiche la vidéo intégrée et le contenu markdown de la ressource', async () => {
    vi.mocked(lib.fetchMasterclassBySlug).mockResolvedValue(mc)
    renderPage()
    await waitFor(() => expect(screen.getByText('Intention pédagogique')).toBeInTheDocument())
    expect(screen.getByTitle('Lecteur vidéo').getAttribute('src')).toContain('youtube.com/embed/Pa-XftyNS-0')
    expect(screen.getByText('Le randori se construit progressivement.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Espace Enseignant/ })).toHaveAttribute('href', '/enseignant')
  })

  it('affiche « introuvable » si la ressource n’existe pas', async () => {
    vi.mocked(lib.fetchMasterclassBySlug).mockResolvedValue(null)
    renderPage()
    await waitFor(() => expect(screen.getByText(/introuvable/i)).toBeInTheDocument())
  })
})
