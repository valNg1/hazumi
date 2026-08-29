import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AccueilPlaylists from '../AccueilPlaylists'

const pls = [
  { id: 'a1', nom: 'Attaque vs gaucher' },
  { id: 'b2', nom: 'Uchi Mata' },
]

function renderIt(list = pls) {
  return render(<MemoryRouter><AccueilPlaylists playlists={list} /></MemoryRouter>)
}

// Issue #2 (2e volet) : depuis l'accueil, chaque playlist doit ouvrir SA playlist
// (route /bibliotheque?playlist=<id>), et surtout PAS rediriger vers « Ma progression ».
describe('AccueilPlaylists — routage des playlists', () => {
  it('chaque playlist pointe vers sa route /bibliotheque?playlist=<id> (bon mapping d’ID)', () => {
    renderIt()
    expect(screen.getByRole('link', { name: 'Attaque vs gaucher' })).toHaveAttribute('href', '/bibliotheque?playlist=a1')
    expect(screen.getByRole('link', { name: 'Uchi Mata' })).toHaveAttribute('href', '/bibliotheque?playlist=b2')
  })

  it('ne redirige jamais vers « Ma progression »', () => {
    const { container } = renderIt()
    const hrefs = Array.from(container.querySelectorAll('a')).map((a) => a.getAttribute('href') ?? '')
    expect(hrefs.some((h) => h.includes('progression'))).toBe(false)
  })

  it('affiche le nombre de playlists', () => {
    renderIt()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('affiche un état vide sans playlist', () => {
    renderIt([])
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText(/Aucune playlist/i)).toBeInTheDocument()
  })
})
