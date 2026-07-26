import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import QuatriemeDanSections from '../QuatriemeDanSections'
import { QUATRIEME_DAN_HERO, QUATRIEME_DAN_POURQUOI } from '../../lib/quatriemeDanContent'

const progress = { percent: 0, done: 0, total: 3, termine: false }

describe('QuatriemeDanSections — landing 4e Dan (Kime-no-Kata)', () => {
  it('affiche le nouveau titre « Préparer le 4e Dan »', () => {
    render(<QuatriemeDanSections progress={progress} onCommencer={() => {}} onBrowseResources={() => {}} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Préparer le 4e Dan' })).toBeInTheDocument()
  })

  it('affiche la nouvelle introduction (tai-sabaki, combat réel)', () => {
    render(<QuatriemeDanSections progress={progress} onCommencer={() => {}} onBrowseResources={() => {}} />)
    expect(screen.getByText(QUATRIEME_DAN_HERO.intro)).toBeInTheDocument()
  })

  it('affiche la section « Pourquoi apprendre le Kime-no-Kata ? »', () => {
    render(<QuatriemeDanSections progress={progress} onCommencer={() => {}} onBrowseResources={() => {}} />)
    expect(screen.getByRole('heading', { level: 2, name: QUATRIEME_DAN_POURQUOI.titre })).toBeInTheDocument()
    QUATRIEME_DAN_POURQUOI.paragraphes.forEach((p) => expect(screen.getByText(p)).toBeInTheDocument())
  })

  it('expose un CTA primaire et un CTA secondaire fonctionnels', () => {
    const onCommencer = vi.fn()
    const onBrowse = vi.fn()
    render(<QuatriemeDanSections progress={progress} onCommencer={onCommencer} onBrowseResources={onBrowse} />)
    fireEvent.click(screen.getByRole('button', { name: QUATRIEME_DAN_HERO.ctaPrimary }))
    fireEvent.click(screen.getByRole('button', { name: QUATRIEME_DAN_HERO.ctaSecondary }))
    expect(onCommencer).toHaveBeenCalledOnce()
    expect(onBrowse).toHaveBeenCalledOnce()
  })

  it('ne contient aucune référence au 3e Dan', () => {
    const { container } = render(<QuatriemeDanSections progress={progress} onCommencer={() => {}} onBrowseResources={() => {}} />)
    expect(container.textContent).not.toMatch(/3e\s*dan/i)
  })
})
