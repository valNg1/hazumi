import { describe, it, expect } from 'vitest'
import { isCorrect, gradeQuiz, type QuizQuestion } from '../lessonQuiz'

const questions: QuizQuestion[] = [
  { id: 'q1', type: 'choix_unique', reponses: ['Avant', 'Arriere', 'Lateral'], bonne_reponse: [0] },
  { id: 'q2', type: 'vrai_faux', reponses: ['Vrai', 'Faux'], bonne_reponse: [1] },
  { id: 'q3', type: 'choix_multiple', reponses: ['Kuzushi', 'Tsukuri', 'Kake', 'Sutemi'], bonne_reponse: [0, 1, 2] },
]

describe('isCorrect', () => {
  it('valide un choix unique correct', () => {
    expect(isCorrect(questions[0], [0])).toBe(true)
    expect(isCorrect(questions[0], [1])).toBe(false)
  })
  it('valide un vrai/faux', () => {
    expect(isCorrect(questions[1], [1])).toBe(true)
    expect(isCorrect(questions[1], [0])).toBe(false)
  })
  it('valide un choix multiple sans tenir compte de l’ordre', () => {
    expect(isCorrect(questions[2], [2, 0, 1])).toBe(true)
    expect(isCorrect(questions[2], [0, 1])).toBe(false) // incomplet
    expect(isCorrect(questions[2], [0, 1, 2, 3])).toBe(false) // en trop
  })
  it('une absence de reponse est incorrecte', () => {
    expect(isCorrect(questions[0], [])).toBe(false)
  })
})

describe('gradeQuiz', () => {
  it('calcule le score total', () => {
    const res = gradeQuiz(questions, { q1: [0], q2: [1], q3: [0, 1, 2] })
    expect(res.score).toBe(3)
    expect(res.total).toBe(3)
    expect(res.results.every((r) => r.correct)).toBe(true)
  })
  it('compte les reponses partielles/manquantes', () => {
    const res = gradeQuiz(questions, { q1: [0], q3: [0, 1] })
    expect(res.score).toBe(1)
    expect(res.total).toBe(3)
    expect(res.results.find((r) => r.id === 'q2')?.correct).toBe(false)
  })
})
