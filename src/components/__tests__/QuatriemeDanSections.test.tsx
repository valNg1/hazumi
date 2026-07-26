import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import QuatriemeDanSections from '../QuatriemeDanSections'
import {
  QUATRIEME_DAN_HERO,
  QUATRIEME_DAN_PRESENTATION,
  QUATRIEME_DAN_EXAMEN,
  QUATRIEME_DAN_UV1,
  QUATRIEME_DAN_AUTRES_UV,
} from '../../lib/quatriemeDanContent'

const progress = { percent: 0, done: 0, total: 3, termine: false }

describe('QuatriemeDanSections — landing 4e Dan (Kime-no-Kata)', () => {
  it('affiche le nouveau titre « Préparer le 4e Dan »', () => {
    render(<QuatriemeDanSections progress={progress} onCommencer={() => {}} onBrowseResources={() => {}} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Préparer le 4e Dan' })).toBeInTheDocument()
  })

  it('affiche l\'introduction du 4e dan (Yondan) sous le titre', () => {
    render(<QuatriemeDanSections progress={progress} onCommencer={() => {}} onBrowseResources={() => {}} />)
    expect(screen.getByText(QUATRIEME_DAN_HERO.intro)).toBeInTheDocument()
  })

  it('affiche la présentation (contexte examen + UV1) et la liste des katas', () => {
    render(<QuatriemeDanSections progress={progress} onCommencer={() => {}} onBrowseResources={() => {}} />)
    QUATRIEME_DAN_PRESENTATION.paragraphes.forEach((p) => expect(screen.getByText(p)).toBeInTheDocument())
    expect(screen.getByText(QUATRIEME_DAN_PRESENTATION.uv1Intro)).toBeInTheDocument()
    QUATRIEME_DAN_PRESENTATION.katas.forEach((k) => expect(screen.getByText(k)).toBeInTheDocument())
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

  it('ne présente pas le parcours comme « 3e Dan » (seul le prérequis peut mentionner le 3e Dan)', () => {
    const { container } = render(<QuatriemeDanSections progress={progress} onCommencer={() => {}} onBrowseResources={() => {}} />)
    expect(container.textContent).not.toMatch(/pr[ée]par\w*\s+(le|du)\s+3e/i)
  })

  it('affiche « L\'examen en un coup d\'œil » avec ses six cartes', () => {
    render(<QuatriemeDanSections progress={progress} onCommencer={() => {}} onBrowseResources={() => {}} />)
    expect(screen.getByRole('heading', { level: 2, name: "L'examen en un coup d'œil" })).toBeInTheDocument()
    expect(QUATRIEME_DAN_EXAMEN).toHaveLength(6)
    QUATRIEME_DAN_EXAMEN.forEach((c) => expect(screen.getByRole('heading', { level: 3, name: c.titre })).toBeInTheDocument())
  })

  it('affiche « Les unités de valeur » avec l\'UV1 mise en avant et le focus exclusif', () => {
    render(<QuatriemeDanSections progress={progress} onCommencer={() => {}} onBrowseResources={() => {}} />)
    expect(screen.getByRole('heading', { level: 2, name: 'Les unités de valeur' })).toBeInTheDocument()
    expect(screen.getByText('Au programme de ce parcours')).toBeInTheDocument()
    expect(screen.getByText(QUATRIEME_DAN_UV1.resume)).toBeInTheDocument()
    expect(screen.getByText(QUATRIEME_DAN_AUTRES_UV)).toBeInTheDocument()
  })
})
