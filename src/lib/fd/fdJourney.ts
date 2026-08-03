import type { MasterclassContent } from '../masterclass/masterclassContent'

// Collection Frédéric Demontfaucon (FD) — masterclasses techniques (famille Masterclass).
// Règles fixées : 1 vidéo = 1 journey ; univers JUDO-KÂ ; titre = sujet pédagogique
// de la vidéo ; structure = Masterclass Journey Blueprint (PAS le blueprint kata).

export interface FDVideoSource {
  url: string
  titre: string
  dureeSeconds: number
}

export interface FDChapter {
  titre: string
  timestampSeconds: number
  description?: string
}

export interface FDQuizQuestion {
  question: string
  reponses: string[]
  bonneReponse: number[]
  explication: string
}

// Un journey FD complet. `content` suit le Masterclass Journey Blueprint.
export interface FDJourney {
  slug: string
  ressourceId: string            // uuid stable = clé du contenu masterclass
  titre: string                  // = sujet pédagogique de la vidéo
  univers: 'judo-ka'             // fixé pour toute la collection FD
  video: FDVideoSource
  chapitres: FDChapter[]         // bornes macro validées (issues des sources officielles)
  quiz: FDQuizQuestion[]
  content: MasterclassContent    // sections de masterclass (pas de sections kata)
}
