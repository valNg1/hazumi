import type { FDJourney } from './fdJourney'

/**
 * TEMPLATE d'un journey Frédéric Demontfaucon (masterclass technique) —
 * toutes les sections du Masterclass Journey Blueprint, contenu VIDE.
 *
 * Pour créer un nouveau journey :
 *   1. Copier ce fichier en `src/lib/fd/<slug>.ts`.
 *   2. Remplir chaque champ DEPUIS LES SOURCES OFFICIELLES (ne rien inventer).
 *   3. Générer un `ressourceId` (uuid stable) et le figer.
 *   4. Ajouter le journey au registre `FD_JOURNEYS` (src/lib/fd/index.ts).
 *   5. Seeder la base : `npx tsx scripts/seed-fd-journey.ts <slug>`.
 *
 * La STRUCTURE ne change jamais (Masterclass Blueprint) ; seul le CONTENU varie.
 * NB : pas de sections kata (pourquoi ce kata / jury / tatami / UV).
 */
export const FD_JOURNEY_TEMPLATE: FDJourney = {
  slug: '',                       // ex. 'uchi-mata-demontfaucon'
  ressourceId: '',                // uuid stable (clé masterclass) — À FIGER
  titre: '',                      // sujet pédagogique de la vidéo (= titre du parcours)
  univers: 'judo-ka',
  video: {
    url: '',                      // URL YouTube embeddable (playable_in_embed=true)
    titre: '',
    dureeSeconds: 0,
  },
  chapitres: [
    // { titre: '', timestampSeconds: 0, description: '' },  // = nav timestamps (bornes validées)
  ],
  quiz: [
    // { question: '', reponses: ['', ''], bonneReponse: [0], explication: '' },
  ],
  content: {
    meta: {
      tempsLecture: '',           // ex. '12 minutes'
      objectif: '',               // phrase d'accroche des objectifs
      niveau: 'JUDO-KÂ',
      difficulte: 3,              // 1..5
    },
    objectifs: [],                // 1. Objectifs d'apprentissage
    prerequis: [],                // 2. Prérequis
    // 3. Chapitres vidéo = `chapitres` ci-dessus (nav timestamps, rendus par Lecon)
    concepts: [],                 // 4. Concepts techniques clés — { titre, texte, timestampSeconds? }
    explications: [],             // 5. Explications détaillées — { titre, texte, timestampSeconds? }
    erreurs: [],                  // 6. Erreurs fréquentes
    conseils: [],                 // 7. Conseils pratiques de Frédéric Demontfaucon
    drills: [],                   // 8. Exercices d'entraînement (si applicable — sinon laisser vide)
    aRetenir: [],                 // 9. À retenir
    // 10. Notes + 11. Quiz : gérés par la leçon (réutilisés)
  },
}
