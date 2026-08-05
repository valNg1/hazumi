import type { MasterclassContent, MasterclassChapitre } from './masterclassContent'
import { fdMasterclassEntries, fdChapitreEntries } from '../fd'

// Registre global des masterclasses, par ressource_id (équivalent de PREMIUM_LESSONS
// pour les katas). Composé des collections existantes (aujourd'hui : Frédéric Demontfaucon).
export const MASTERCLASS_LESSONS: Record<string, MasterclassContent> = {
  ...fdMasterclassEntries(),
}

// Chapitres + transcript par ressource_id (section « Comprendre les techniques »).
export const MASTERCLASS_CHAPITRES: Record<string, MasterclassChapitre[]> = {
  ...fdChapitreEntries(),
}

export function getMasterclassContent(ressourceId: string | undefined): MasterclassContent | undefined {
  return ressourceId ? MASTERCLASS_LESSONS[ressourceId] : undefined
}

export function getMasterclassChapitres(ressourceId: string | undefined): MasterclassChapitre[] {
  return ressourceId ? (MASTERCLASS_CHAPITRES[ressourceId] ?? []) : []
}
