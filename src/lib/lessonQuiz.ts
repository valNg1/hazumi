export type QuizType = 'choix_unique' | 'choix_multiple' | 'vrai_faux'

export interface QuizQuestion {
  id: string
  type: QuizType
  reponses: string[]
  bonne_reponse: number[]
}

export function isCorrect(question: QuizQuestion, selected: number[]): boolean {
  const good = question.bonne_reponse
  if (selected.length === 0) return false
  if (selected.length !== good.length) return false
  const a = new Set(selected)
  return good.every((g) => a.has(g))
}

export interface QuizResult {
  score: number
  total: number
  results: { id: string; correct: boolean }[]
}

export function gradeQuiz(
  questions: QuizQuestion[],
  answers: Record<string, number[]>
): QuizResult {
  const results = questions.map((q) => ({
    id: q.id,
    correct: isCorrect(q, answers[q.id] ?? []),
  }))
  return {
    score: results.filter((r) => r.correct).length,
    total: questions.length,
    results,
  }
}
