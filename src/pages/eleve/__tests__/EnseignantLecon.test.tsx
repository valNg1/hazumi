import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import EnseignantLecon from '../EnseignantLecon'
import * as lib from '../../../lib/masterclasses'

vi.mock('../../../lib/masterclasses', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../lib/masterclasses')>()),
  fetchMasterclassBySlug: vi.fn(),
}))

const contenu = [
  '## 00:05 — Le projet : rendre le Randori accessible',
  'Patrick présente le film du « projet judo ».',
  '',
  '## 01:11 — Échauffement : relâchement, posture, équilibre',
  'Relâchement puis travail postural.',
  '',
  '# APPROFONDIR',
  '',
  '## Le balayage dans le vide : construire timing et distance',
  '### Ce que Patrick propose',
  'Des balayages dans le vide, avec changements de direction.',
  '### Ce que cela construit',
  'La coordination et la relation timing / distance.',
  "### Pour l'enseignant",
  'Une étape préparatoire au Randori.',
].join('\n')

const mc = {
  id: '1', titre: 'Construire le randori', slug: 'patrick-roux-progression-randori',
  youtube_url: 'https://youtu.be/Pa-XftyNS-0', contenu, published: true, created_at: '2026-08-11',
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/enseignant/patrick-roux-progression-randori']}>
      <Routes><Route path="/enseignant/:slug" element={<EnseignantLecon />} /></Routes>
    </MemoryRouter>
  )
}

beforeEach(() => vi.clearAllMocks())

describe('EnseignantLecon — structure leçon Parcours', () => {
  it('affiche vidéo + « Comprendre les techniques » (chapitres horodatés) + « Approfondir les techniques »', async () => {
    vi.mocked(lib.fetchMasterclassBySlug).mockResolvedValue(mc)
    renderPage()
    await waitFor(() => expect(screen.getByText('Comprendre les techniques')).toBeInTheDocument())
    // vidéo
    expect(screen.getByTitle('Lecteur vidéo').getAttribute('src')).toContain('youtube.com/embed/Pa-XftyNS-0')
    // chapitres horodatés (source = timestamps)
    expect(screen.getByText('0:05')).toBeInTheDocument()
    expect(screen.getByText('1:11')).toBeInTheDocument()
    expect(screen.getByText(/Le projet : rendre le Randori accessible/)).toBeInTheDocument()
    // approfondissement A/B/C
    expect(screen.getByText('Approfondir les techniques')).toBeInTheDocument()
    expect(screen.getByText(/Le balayage dans le vide/)).toBeInTheDocument()
    expect(screen.getByText('Ce que Patrick propose')).toBeInTheDocument()
    expect(screen.getByText('Ce que cela construit')).toBeInTheDocument()
    expect(screen.getByText("Pour l'enseignant")).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Espace Enseignant/ })).toHaveAttribute('href', '/enseignant')
  })

  it('un clic sur un horodatage fait sauter la vidéo au bon passage', async () => {
    vi.mocked(lib.fetchMasterclassBySlug).mockResolvedValue(mc)
    renderPage()
    await waitFor(() => screen.getByText('1:11'))
    await userEvent.click(screen.getByText('1:11'))
    await waitFor(() => expect(screen.getByTitle('Lecteur vidéo').getAttribute('src')).toContain('start=71'))
  })

  it('affiche « introuvable » si la ressource n’existe pas', async () => {
    vi.mocked(lib.fetchMasterclassBySlug).mockResolvedValue(null)
    renderPage()
    await waitFor(() => expect(screen.getByText(/introuvable/i)).toBeInTheDocument())
  })
})
