// « Masterclass Journey » — 2e famille de journeys Hazumi, à côté des journeys Kata.
// Modèle pédagogique d'une masterclass technique (ex. collection Frédéric Demontfaucon).
// Réutilise la coquille de leçon (lecteur vidéo sticky, nav timestamps, notes, quiz,
// layout premium) mais avec des sections propres — AUCUNE section kata (pas de
// « pourquoi ce kata », jury, tatami, UV).

export interface MasterclassMeta {
  tempsLecture: string
  objectif: string
  niveau: string
  difficulte: number // 1..5
}

// Un bloc titré ; peut pointer un moment de la vidéo (bouton ▶ mm:ss).
export interface MasterclassBloc {
  titre: string
  texte: string
  timestampSeconds?: number
}

// Chapitre exposé à la leçon avec son transcript (section « Comprendre les techniques »).
// Réutilisable par toutes les masterclasses FD.
export interface MasterclassChapitre {
  titre: string
  timestampSeconds: number
  transcript?: string
}

export interface MasterclassContent {
  meta: MasterclassMeta
  objectifs: string[]              // 1. Objectifs d'apprentissage
  prerequis: string[]              // 2. Prérequis
  // 3. Chapitres vidéo = lesson_chapters (nav timestamps, rendus par Lecon) — hors de cet objet
  concepts: MasterclassBloc[]      // 4. Concepts techniques clés
  explications: MasterclassBloc[]  // 5. Explications détaillées (peuvent porter un timestamp)
  erreurs: string[]                // 6. Erreurs fréquentes
  conseils: string[]               // 7. Conseils pratiques de l'expert
  drills: MasterclassBloc[]        // 8. Exercices d'entraînement (si applicable ; vide sinon)
  aRetenir: string[]               // 9. À retenir
  // 10. Notes personnelles + 11. Quiz = Lecon (réutilisés)
}
