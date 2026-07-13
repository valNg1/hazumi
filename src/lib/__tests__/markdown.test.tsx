import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { renderMarkdown } from '../markdown'

function renderMd(md: string) {
  return render(<div data-testid="md">{renderMarkdown(md)}</div>)
}

describe('renderMarkdown', () => {
  it('rend les titres', () => {
    renderMd('# Grand titre\n## Sous-titre')
    expect(screen.getByText('Grand titre').tagName).toBe('H1')
    expect(screen.getByText('Sous-titre').tagName).toBe('H2')
  })

  it('rend le gras et l’italique inline', () => {
    renderMd('Un mot **gras** et un mot *italique*.')
    expect(screen.getByText('gras').tagName).toBe('STRONG')
    expect(screen.getByText('italique').tagName).toBe('EM')
  })

  it('rend une liste a puces', () => {
    renderMd('- un\n- deux\n- trois')
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('rend un lien avec href', () => {
    renderMd('Voir [le kodokan](https://kodokan.org) ici.')
    const link = screen.getByRole('link', { name: 'le kodokan' })
    expect(link).toHaveAttribute('href', 'https://kodokan.org')
  })

  it('rend du code inline', () => {
    renderMd('La technique `o-soto-gari` ici.')
    expect(screen.getByText('o-soto-gari').tagName).toBe('CODE')
  })

  it('n’injecte jamais de HTML brut (securite)', () => {
    const { container } = renderMd('<img src=x onerror=alert(1)>')
    expect(container.querySelector('img')).toBeNull()
    expect(container.textContent).toContain('<img')
  })
})
