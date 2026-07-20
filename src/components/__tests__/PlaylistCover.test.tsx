import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PlaylistCover from '../PlaylistCover'

const img = (n: number) => Array.from({ length: n }, (_, i) => `https://img/${i}.jpg`)

function renderCover(n: number) {
  return render(<PlaylistCover vignettes={img(n)} nom="Mes hanches" />)
}

describe('PlaylistCover — couverture automatique', () => {
  it('1 ressource : affiche sa vignette', () => {
    renderCover(1)
    expect(screen.getByTestId('playlist-cover').dataset.disposition).toBe('unique')
    expect(document.querySelectorAll('img')).toHaveLength(1)
  })

  it('2 ressources : affiche les deux vignettes', () => {
    renderCover(2)
    expect(screen.getByTestId('playlist-cover').dataset.disposition).toBe('duo')
    expect(document.querySelectorAll('img')).toHaveLength(2)
  })

  it('3 ressources ou plus : mosaique de 4 cases', () => {
    renderCover(5)
    expect(screen.getByTestId('playlist-cover').dataset.disposition).toBe('mosaique')
    expect(document.querySelectorAll('img')).toHaveLength(4)
  })

  it('rend les vignettes en noir et blanc', () => {
    renderCover(1)
    expect(document.querySelector('img')!.className).toContain('grayscale')
  })

  it('applique un voile sombre', () => {
    const { container } = renderCover(2)
    expect(container.querySelector('.bg-black\\/25')).not.toBeNull()
  })

  it('playlist vide : pas d’icone generique, un etat explicite', () => {
    render(<PlaylistCover vignettes={[]} nom="Vide" />)
    expect(screen.getByTestId('playlist-cover').dataset.disposition).toBe('vide')
    expect(screen.getByText(/Playlist vide/i)).toBeInTheDocument()
    expect(document.querySelectorAll('img')).toHaveLength(0)
  })

  it('les vignettes sont decoratives pour les lecteurs d’ecran', () => {
    renderCover(2)
    document.querySelectorAll('img').forEach((i) => {
      expect(i.getAttribute('alt')).toBe('')
      expect(i.getAttribute('aria-hidden')).toBe('true')
    })
  })

  it('nomme la playlist pour les lecteurs d’ecran', () => {
    renderCover(1)
    expect(screen.getByText(/Couverture de la playlist Mes hanches/)).toBeInTheDocument()
  })

  it('charge les images en differe', () => {
    renderCover(3)
    document.querySelectorAll('img').forEach((i) => expect(i.getAttribute('loading')).toBe('lazy'))
  })
})
