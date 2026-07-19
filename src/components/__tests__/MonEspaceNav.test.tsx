import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MonEspaceNav from '../MonEspaceNav'
import { MON_ESPACE_SECTIONS } from '../../lib/monEspaceSections'

function renderAt(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <MonEspaceNav />
    </MemoryRouter>
  )
}

// WP 1.2 — depuis n'importe quelle rubrique de Mon espace, les autres sont a un
// clic : plus besoin de revenir en arriere.
describe('MonEspaceNav', () => {
  it('expose les cinq rubriques de Mon espace', () => {
    expect(MON_ESPACE_SECTIONS.map((s) => s.to)).toEqual([
      '/eleve/entrainements',
      '/eleve/agenda',
      '/eleve/messages',
      '/eleve/profil',
      '/eleve/progression',
    ])
  })

  it('rend un lien direct vers chaque rubrique', () => {
    renderAt('/eleve/entrainements')
    const cibles = screen.getAllByRole('link').map((l) => l.getAttribute('href'))
    MON_ESPACE_SECTIONS.forEach((s) => expect(cibles).toContain(s.to))
  })

  it('depuis une rubrique, les autres restent accessibles sans retour arriere', () => {
    renderAt('/eleve/messages')
    expect(screen.getByRole('link', { name: /Mes entraînements/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Mon agenda/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Ma progression/ })).toBeInTheDocument()
  })

  it('signale la rubrique courante', () => {
    renderAt('/eleve/agenda')
    const actif = screen.getByRole('link', { name: /Mon agenda/ })
    expect(actif.className).toContain('bg-[#0A0A0A]')
    expect(screen.getByRole('link', { name: /Mon profil/ }).className).not.toContain('bg-[#0A0A0A]')
  })

  it('porte un libelle d’accessibilite', () => {
    renderAt('/eleve/profil')
    expect(screen.getByRole('navigation', { name: 'Mon espace' })).toBeInTheDocument()
  })
})
