import type { MasterclassContent } from '../masterclass/masterclassContent'
import type { FDJourney } from './fdJourney'
import { GAESHI_JOURNEY } from './gaeshi'
import { PROJET_EXCELLENCE_JOURNEYS } from './projetExcellence'

export type { FDJourney } from './fdJourney'

/**
 * Registre des masterclasses Frédéric Demontfaucon.
 * 1 vidéo = 1 journey (parcours-first). Ajouter ici chaque journey rempli
 * (copie du template `_template.ts`).
 */
export const FD_JOURNEYS: FDJourney[] = [GAESHI_JOURNEY, ...PROJET_EXCELLENCE_JOURNEYS]

/** Map ressourceId -> contenu masterclass, pour enregistrement global. */
export function fdMasterclassEntries(): Record<string, MasterclassContent> {
  return Object.fromEntries(FD_JOURNEYS.map((j) => [j.ressourceId, j.content]))
}

/** Retrouve un journey FD par son slug (utilisé par le seed). */
export function fdJourneyBySlug(slug: string): FDJourney | undefined {
  return FD_JOURNEYS.find((j) => j.slug === slug)
}
