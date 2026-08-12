import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import FounderCard from '../FounderCard'

describe('FounderCard (Accueil)', () => {
  it('présente le fondateur avec un CTA discret vers /valery-nguyen', () => {
    render(<MemoryRouter><FounderCard /></MemoryRouter>)
    expect(screen.getByText('À propos du fondateur de Hazumi')).toBeInTheDocument()
    expect(screen.getByText('Valéry Nguyen')).toBeInTheDocument()
    expect(screen.getByText('Enseignant et compétiteur')).toBeInTheDocument()
    const cta = screen.getByRole('link', { name: /Découvrir mon parcours/ })
    expect(cta).toHaveAttribute('href', '/valery-nguyen')
  })
})
