import type { MasterclassContent } from '../masterclass/masterclassContent'
import type { FDJourney } from './fdJourney'

export type { FDJourney } from './fdJourney'

/**
 * Registre de la collection Frédéric Demontfaucon.
 * Ajouter ici chaque journey rempli (copie du template `_template.ts`).
 * Vide tant qu'aucune source n'est fournie.
 */
export const FD_JOURNEYS: FDJourney[] = []

/** Map ressourceId -> contenu masterclass, pour enregistrement global. */
export function fdMasterclassEntries(): Record<string, MasterclassContent> {
  return Object.fromEntries(FD_JOURNEYS.map((j) => [j.ressourceId, j.content]))
}

/** Retrouve un journey FD par son slug (utilisé par le seed). */
export function fdJourneyBySlug(slug: string): FDJourney | undefined {
  return FD_JOURNEYS.find((j) => j.slug === slug)
}
