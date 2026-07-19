import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Bibliotheque from '../Bibliotheque'
import MonEspace from '../MonEspace'

vi.mock('../../../lib/supabase', () => ({
  supabase: {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [] }),
      single: vi.fn().mockResolvedValue({ data: null }),
    })),
  },
}))

function renderAt(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

beforeEach(() => vi.clearAllMocks())

// WP 1.1 §4 — pages transitoires minimales : nom de la section + phrase
// explicative + navigation normale. Elles n'anticipent pas les futurs WP.
describe('Bibliothèque — page transitoire', () => {
  it('affiche le nom de la section', () => {
    renderAt(<Bibliotheque />)
    expect(screen.getByRole('heading', { name: /Bibliothèque/i })).toBeInTheDocument()
  })

  it('affiche une phrase explicative', () => {
    renderAt(<Bibliotheque />)
    expect(screen.getByTestId('section-intro').textContent?.length).toBeGreaterThan(20)
  })

  it('ACC-07 : donne acces aux contenus existants', () => {
    renderAt(<Bibliotheque />)
    const liens = screen.getAllByRole('link')
    expect(liens.length).toBeGreaterThan(0)
    const cibles = liens.map((l) => l.getAttribute('href'))
    expect(cibles).toContain('/eleve/kyu')
    expect(cibles).toContain('/eleve/shiai')
    expect(cibles).toContain('/eleve/judoka-culture')
  })
})

describe('Mon espace — page transitoire', () => {
  it('affiche le nom de la section', () => {
    renderAt(<MonEspace />)
    expect(screen.getByRole('heading', { name: /Mon espace/i })).toBeInTheDocument()
  })

  it('affiche une phrase explicative', () => {
    renderAt(<MonEspace />)
    expect(screen.getByTestId('section-intro').textContent?.length).toBeGreaterThan(20)
  })

  it('ACC-07 : donne acces aux fonctions personnelles existantes', () => {
    renderAt(<MonEspace />)
    const cibles = screen.getAllByRole('link').map((l) => l.getAttribute('href'))
    expect(cibles).toContain('/eleve/entrainements')
    expect(cibles).toContain('/eleve/agenda')
    expect(cibles).toContain('/eleve/messages')
    expect(cibles).toContain('/eleve/profil')
    expect(cibles).toContain('/eleve/progression')
  })
})
