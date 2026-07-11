export interface ParcoursRessourceLink {
  ressource_id: string
  obligatoire: boolean
}

export interface ParcoursProgress {
  done: number
  total: number
  percent: number
  termine: boolean
}

// Progression fondee sur les ressources obligatoires du parcours.
// Si aucune ressource n'est obligatoire, on retombe sur l'ensemble des ressources.
export function computeProgress(
  links: ParcoursRessourceLink[],
  completedIds: string[]
): ParcoursProgress {
  const completed = new Set(completedIds)
  const obligatoires = links.filter((l) => l.obligatoire)
  const base = obligatoires.length > 0 ? obligatoires : links

  const total = base.length
  const done = base.filter((l) => completed.has(l.ressource_id)).length
  const percent = total === 0 ? 0 : Math.round((done / total) * 100)

  return { done, total, percent, termine: total > 0 && done >= total }
}

// Renvoie l'id de la premiere ressource non terminee (dans l'ordre fourni),
// pour le bouton "Reprendre". null si tout est termine ou liste vide.
export function nextRessourceId(
  orderedIds: string[],
  completedIds: string[]
): string | null {
  const completed = new Set(completedIds)
  return orderedIds.find((id) => !completed.has(id)) ?? null
}

export function toggleCompleted(completedIds: string[], ressourceId: string): string[] {
  return completedIds.includes(ressourceId)
    ? completedIds.filter((id) => id !== ressourceId)
    : [...completedIds, ressourceId]
}
