import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Login from '../Login'

vi.mock('../../lib/supabase', () => ({ supabase: {} }))
vi.mock('../../lib/auth', () => ({ signIn: vi.fn(), signUp: vi.fn() }))

const TAGLINE = 'Le judo continue après l\'entraînement'

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  )
}

describe('Login (page d\'accueil) — tagline', () => {
  it('affiche la tagline sous le nom de marque', () => {
    renderLogin()
    expect(screen.getByText(TAGLINE)).toBeInTheDocument()
  })

  it('rend la tagline dans le même bloc hero que le nom "Hazumi"', () => {
    renderLogin()
    const hero = screen.getByText(TAGLINE).closest('div') as HTMLElement
    expect(hero).not.toBeNull()
    // le logo de marque Hazumi est présent dans le même bloc hero
    expect(within(hero).getByAltText('Hazumi')).toBeInTheDocument()
  })
})
