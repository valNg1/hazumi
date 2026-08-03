import type { MasterclassContent } from './masterclassContent'
import { fdMasterclassEntries } from '../fd'

// Registre global des masterclasses, par ressource_id (équivalent de PREMIUM_LESSONS
// pour les katas). Composé des collections existantes (aujourd'hui : Frédéric Demontfaucon).
export const MASTERCLASS_LESSONS: Record<string, MasterclassContent> = {
  ...fdMasterclassEntries(),
}

export function getMasterclassContent(ressourceId: string | undefined): MasterclassContent | undefined {
  return ressourceId ? MASTERCLASS_LESSONS[ressourceId] : undefined
}
