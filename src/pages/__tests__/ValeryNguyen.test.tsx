import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ValeryNguyen from '../ValeryNguyen'

function renderPage() {
  return render(<MemoryRouter><ValeryNguyen /></MemoryRouter>)
}

// Structure ACTUELLE de la page (refonte À propos / fondateur).
describe('Page /valery-nguyen', () => {
  it('affiche le hero fondateur et le retour vers /a-propos', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1, name: 'Valéry Nguyen' })).toBeInTheDocument()
    expect(screen.getByText(/Judoka, enseignant et fondateur de Hazumi/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /À propos/ })).toHaveAttribute('href', '/a-propos')
  })

  it('retrace le parcours judo et les influences', () => {
    renderPage()
    expect(screen.getByText(/Judo Club de Lagny-sur-Marne/)).toBeInTheDocument()
    expect(screen.getByText(/Christian Dyot/)).toBeInTheDocument()
    expect(screen.getByText(/Frédéric Demontfaucon/)).toBeInTheDocument()
    expect(screen.getByText(/le rugby, le surf et plus récemment le Jiu-Jitsu Brésilien/)).toBeInTheDocument()
    expect(screen.getByText(/Tout cela nourrit mon judo, sans le remplacer/)).toBeInTheDocument()
  })

  it('relie enseignement et expérience de transformation digitale', () => {
    renderPage()
    expect(screen.getByText(/Enseigner et concevoir des expériences/)).toBeInTheDocument()
    expect(screen.getByText('Directeur de programmes')).toBeInTheDocument()
    expect(screen.getByText('Transformation digitale')).toBeInTheDocument()
  })

  it('affiche les deux photos du fondateur', () => {
    const { container } = renderPage()
    expect(container.querySelectorAll('img[src^="/images/founder/"]').length).toBe(2)
  })

  it('affiche les repères grade / enseignement / compétition / parcours professionnel', () => {
    renderPage()
    expect(screen.getByText('3e dan')).toBeInTheDocument()
    expect(screen.getByText('Enseignement')).toBeInTheDocument()
    expect(screen.getByText('Compétition')).toBeInTheDocument()
    expect(screen.getByText('Parcours professionnel')).toBeInTheDocument()
  })

  it('présente un palmarès actualisé (champion de France vétérans 2026)', () => {
    renderPage()
    expect(screen.getByText('Champion de France vétérans 2026')).toBeInTheDocument()
    expect(screen.getByText(/Vice-champion d.Europe vétérans 2025/)).toBeInTheDocument()
  })
})
