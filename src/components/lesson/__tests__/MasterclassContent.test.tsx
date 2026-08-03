import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MasterclassContentView from '../MasterclassContent'
import type { MasterclassContent } from '../../../lib/masterclass/masterclassContent'

const base: MasterclassContent = {
  meta: { tempsLecture: '10 min', objectif: 'Comprendre uchi-mata', niveau: 'JUDO-KÂ', difficulte: 3 },
  objectifs: ['Objectif A', 'Objectif B'],
  prerequis: ['Savoir chuter'],
  concepts: [{ titre: 'Déséquilibre', texte: 'Vers l’avant' }],
  explications: [{ titre: 'Entrée', texte: 'Pivot', timestampSeconds: 65 }],
  erreurs: ['Tête baissée'],
  conseils: ['Rester droit'],
  drills: [],
  aRetenir: ['Point clé'],
}

describe('MasterclassContentView', () => {
  it('affiche les sections du Masterclass Blueprint', () => {
    render(<MasterclassContentView content={base} />)
    expect(screen.getByText(/Objectifs d'apprentissage/)).toBeInTheDocument()
    expect(screen.getByText('Prérequis')).toBeInTheDocument()
    expect(screen.getByText('Concepts techniques clés')).toBeInTheDocument()
    expect(screen.getByText('Explications détaillées')).toBeInTheDocument()
    expect(screen.getByText('Erreurs fréquentes')).toBeInTheDocument()
    expect(screen.getByText('Le conseil de Frédéric Demontfaucon')).toBeInTheDocument()
    expect(screen.getByText('À retenir')).toBeInTheDocument()
  })

  it('n’affiche AUCUNE section kata', () => {
    const { container } = render(<MasterclassContentView content={base} />)
    expect(container.textContent).not.toMatch(/Pourquoi ce kata/i)
    expect(container.textContent).not.toMatch(/le jury attend/i)
    expect(container.textContent).not.toMatch(/tatami/i)
    expect(container.textContent).not.toMatch(/unités de valeur/i)
    expect(container.textContent).not.toMatch(/examinateur/i)
  })

  it('masque les exercices si drills vide, les montre sinon', () => {
    const { rerender } = render(<MasterclassContentView content={base} />)
    expect(screen.queryByText(/Exercices d'entraînement/)).toBeNull()
    rerender(<MasterclassContentView content={{ ...base, drills: [{ titre: 'Uchi-komi', texte: '3×10' }] }} />)
    expect(screen.getByText(/Exercices d'entraînement/)).toBeInTheDocument()
  })

  it('le bouton timestamp appelle onSeek avec le bon temps', () => {
    const onSeek = vi.fn()
    render(<MasterclassContentView content={base} onSeek={onSeek} />)
    fireEvent.click(screen.getByRole('button', { name: /1:05/ }))
    expect(onSeek).toHaveBeenCalledWith(65)
  })
})
