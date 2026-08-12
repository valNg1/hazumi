import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ValeryNguyen from '../ValeryNguyen'

function renderPage() {
  return render(<MemoryRouter><ValeryNguyen /></MemoryRouter>)
}

describe('Page /valery-nguyen', () => {
  it('affiche le hero et l’idée directrice', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1, name: /Construire son judo tout au long de sa vie/ })).toBeInTheDocument()
    expect(screen.getByText(/Enseignant · compétiteur · fondateur de Hazumi/)).toBeInTheDocument()
  })

  it('déroule les quatre mouvements + Pourquoi Hazumi', () => {
    renderPage()
    for (const m of ['Apprendre', 'Explorer', 'Revenir', 'Transmettre', 'Pourquoi Hazumi']) {
      expect(screen.getByText(m)).toBeInTheDocument()
    }
  })

  it('intègre rugby (Noisy-le-Grand, Afrique du Sud), surf et JJB', () => {
    renderPage()
    expect(screen.getByText(/Noisy-le-Grand/)).toBeInTheDocument()
    expect(screen.getByText(/Afrique du Sud/)).toBeInTheDocument()
    expect(screen.getByText(/surf/)).toBeInTheDocument()
    expect(screen.getByText(/Jiu-Jitsu Brésilien/)).toBeInTheDocument()
  })

  it('cite les quatre accompagnements experts', () => {
    renderPage()
    for (const nom of ['Arthur Clerget', 'Laurent Messeguer', 'Serge Borowski', 'Cyrielle Mingot']) {
      expect(screen.getByText(nom)).toBeInTheDocument()
    }
  })

  it('met en avant le manifeste « judo total »', () => {
    renderPage()
    expect(screen.getByText(/On développe un judo total en allant à la rencontre des autres/)).toBeInTheDocument()
  })

  it('ne présente pas les résultats comme une rubrique « Palmarès »', () => {
    renderPage()
    // Pas de libellé/titre autonome « Palmarès » (le mot peut apparaître dans la prose).
    expect(screen.queryByText('Palmarès')).toBeNull()
  })
})
