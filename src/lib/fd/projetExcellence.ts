import type { FDJourney } from './fdJourney'
import type { MasterclassContent } from '../masterclass/masterclassContent'

// Collection Frédéric Demontfaucon — « Projet Excellence Judo » (7 masterclasses).
// 1 vidéo = 1 journey (parcours-first, univers JUDO-KÂ hérité, non exposé).
//
// Les SECTIONS pédagogiques sont MASQUÉES (décision PO) → on ne remplit ici que
// ce qui est réellement exploitable et affiché : chapitres horodatés (ancrés sur
// les transitions du transcript ASR) + méta (objectif = thème de la vidéo).
// Les chapitres relèvent d'un « best engineering judgement » sur un transcript
// auto-généré bruité — à réviser/affiner par le PO. Aucun contenu technique inventé.
// Sections de contenu laissées vides (non affichées). Quiz non généré (transcript
// trop bruité pour des questions fiables sans invention).

function mc(objectif: string, tempsLecture: string): MasterclassContent {
  return {
    meta: { tempsLecture, objectif, niveau: 'JUDO-KÂ', difficulte: 4 },
    objectifs: [], prerequis: [], concepts: [], explications: [],
    erreurs: [], conseils: [], drills: [], aRetenir: [],
  }
}

export const PROJET_EXCELLENCE_JOURNEYS: FDJourney[] = [
  {
    slug: 'systeme-attaque-kumikata',
    ressourceId: 'edc5e596-56d0-4387-af33-9da673a82872',
    titre: 'Système d’attaque et kumi-kata — Projet Excellence Judo',
    univers: 'judo-ka',
    video: { url: 'https://www.youtube.com/watch?v=ByZjOVY1M_M', titre: 'Projet Excellence Judo — Système d’attaque / Kumi-kata', dureeSeconds: 883 },
    chapitres: [
      { titre: 'Introduction — la bataille de la saisie', timestampSeconds: 0 },
      { titre: 'Protéger et imposer sa saisie', timestampSeconds: 79 },
      { titre: 'Prises de garde et profils d’adversaires', timestampSeconds: 220 },
      { titre: 'Mise en application', timestampSeconds: 280 },
      { titre: 'Créer l’ouverture, gagner du temps', timestampSeconds: 458 },
      { titre: 'Exercice guidé', timestampSeconds: 550 },
      { titre: 'Variantes de contrôle', timestampSeconds: 653 },
      { titre: 'De l’autre côté (prise pistolet)', timestampSeconds: 816 },
    ],
    quiz: [],
    content: mc('Construire son système d’attaque et son kumi-kata (saisies) : prendre l’avantage à la saisie et préparer ses attaques.', '15 minutes'),
  },
  {
    slug: 'harai-goshi',
    ressourceId: '33ca6240-95c2-4a67-9033-3a9d6900d1d7',
    titre: 'Harai-goshi — Projet Excellence Judo',
    univers: 'judo-ka',
    video: { url: 'https://www.youtube.com/watch?v=Jp9dFOPb2LM', titre: 'Projet Excellence Judo — Harai', dureeSeconds: 692 },
    chapitres: [
      { titre: 'Introduction et mise en place', timestampSeconds: 0 },
      { titre: 'Le déplacement et l’entrée', timestampSeconds: 97 },
      { titre: 'Premier essai', timestampSeconds: 182 },
      { titre: 'Deuxième forme', timestampSeconds: 238 },
      { titre: 'Fixer le haut, engager la hanche', timestampSeconds: 344 },
      { titre: 'Traverser / enchaîner', timestampSeconds: 404 },
      { titre: 'De l’autre côté', timestampSeconds: 626 },
      { titre: 'À vous', timestampSeconds: 687 },
    ],
    quiz: [],
    content: mc('Travailler le Harai-goshi : le déplacement, l’entrée, le déséquilibre et la projection.', '12 minutes'),
  },
  {
    slug: 'preparation-attaque',
    ressourceId: 'b20271c3-6e09-4d4e-96d8-bb9c9830c193',
    titre: 'Préparation de l’attaque — Projet Excellence Judo',
    univers: 'judo-ka',
    video: { url: 'https://www.youtube.com/watch?v=Ur4Eeh8QCqY', titre: 'Frédéric Demontfaucon — Préparation attaque', dureeSeconds: 586 },
    chapitres: [
      { titre: 'Introduction — relâcher et se placer', timestampSeconds: 0 },
      { titre: 'Doser sa poussée', timestampSeconds: 75 },
      { titre: 'Créer la première ouverture', timestampSeconds: 124 },
      { titre: 'La première attaque', timestampSeconds: 197 },
      { titre: 'Mise en application', timestampSeconds: 269 },
      { titre: 'Lancer l’attaque depuis le bassin', timestampSeconds: 352 },
      { titre: 'Travail des mains et des appuis', timestampSeconds: 430 },
      { titre: 'Trois formes / synthèse', timestampSeconds: 474 },
    ],
    quiz: [],
    content: mc('La préparation de l’attaque : créer et exploiter les ouvertures avant d’attaquer.', '10 minutes'),
  },
  {
    slug: 'reprise-initiative-quadrupedique',
    ressourceId: '8f2b2427-4943-48ca-b19a-521d37c109b1',
    titre: 'Reprise d’initiative quadrupédique — Projet Excellence Judo',
    univers: 'judo-ka',
    video: { url: 'https://www.youtube.com/watch?v=zgQidLmOXG8', titre: 'Projet Excellence Judo — Reprise initiative quadrupédique', dureeSeconds: 464 },
    chapitres: [
      { titre: 'Introduction — la position à quatre pattes', timestampSeconds: 0 },
      { titre: 'Sortir et se retourner', timestampSeconds: 36 },
      { titre: 'Depuis la position à genoux', timestampSeconds: 123 },
      { titre: 'Pousser et déséquilibrer', timestampSeconds: 186 },
      { titre: 'Mise en application', timestampSeconds: 253 },
      { titre: 'De l’autre sens', timestampSeconds: 304 },
      { titre: 'Renverser le partenaire', timestampSeconds: 412 },
      { titre: 'Synthèse', timestampSeconds: 457 },
    ],
    quiz: [],
    content: mc('Reprendre l’initiative au sol depuis la position quadrupédique (à quatre pattes).', '8 minutes'),
  },
  {
    slug: 'continuite-ne-waza',
    ressourceId: 'd4110d51-1629-4721-9726-6fd10a6c71bb',
    titre: 'Continuité en ne-waza — Projet Excellence Judo',
    univers: 'judo-ka',
    video: { url: 'https://www.youtube.com/watch?v=nPjfLtNaCVM', titre: 'Projet Excellence — Continuité Ne-Waza', dureeSeconds: 669 },
    chapitres: [
      { titre: 'Introduction — garder l’initiative au sol', timestampSeconds: 0 },
      { titre: 'Contrôle et changement de contrôle', timestampSeconds: 61 },
      { titre: 'Descendre en maintenant le poids', timestampSeconds: 120 },
      { titre: 'Utiliser l’opposition', timestampSeconds: 259 },
      { titre: 'De l’autre côté', timestampSeconds: 321 },
      { titre: 'Contrôle de la tête / relâcher', timestampSeconds: 376 },
      { titre: 'Le passage', timestampSeconds: 473 },
      { titre: 'Puissance et position', timestampSeconds: 535 },
      { titre: 'Passer en dessous', timestampSeconds: 654 },
    ],
    quiz: [],
    content: mc('La continuité en ne-waza : enchaîner et garder l’initiative dans le travail au sol.', '11 minutes'),
  },
  {
    slug: 'liaison-debout-sol-face',
    ressourceId: '800acbbc-b51c-4064-901b-bcdb9b354f2e',
    titre: 'Liaison debout-sol : l’opportunité de face — Projet Excellence Judo',
    univers: 'judo-ka',
    video: { url: 'https://www.youtube.com/watch?v=dWh1LB-mSMI', titre: 'LDS — opportunité offerte de face', dureeSeconds: 744 },
    chapitres: [
      { titre: 'Introduction — l’opportunité offerte de face', timestampSeconds: 0 },
      { titre: 'Se déplacer et s’accrocher', timestampSeconds: 66 },
      { titre: 'Mise en application', timestampSeconds: 222 },
      { titre: 'Selon la réaction du partenaire', timestampSeconds: 272 },
      { titre: 'Attaquer le bras (clé)', timestampSeconds: 370 },
      { titre: 'Contrôle', timestampSeconds: 419 },
      { titre: 'Se servir de la main', timestampSeconds: 461 },
      { titre: 'Passage à quatre pattes', timestampSeconds: 574 },
      { titre: 'Finition', timestampSeconds: 622 },
      { titre: 'Positionnement et flexion', timestampSeconds: 705 },
    ],
    quiz: [],
    content: mc('La liaison debout-sol : exploiter l’opportunité offerte de face pour enchaîner vers le sol.', '12 minutes'),
  },
  {
    slug: 'placement-deplacement',
    ressourceId: 'b79dba55-d907-4e9a-a590-e86fbe0e9e68',
    titre: 'Placement dans le déplacement — Projet Excellence Judo',
    univers: 'judo-ka',
    video: { url: 'https://www.youtube.com/watch?v=2SYniO6bF5w', titre: 'Projet Excellence Judo — Placement dans le déplacement', dureeSeconds: 802 },
    chapitres: [
      { titre: 'Introduction — ouvrir et se placer', timestampSeconds: 0 },
      { titre: 'Attraper et s’éloigner', timestampSeconds: 34 },
      { titre: 'Ouvrir les bras', timestampSeconds: 93 },
      { titre: 'Le moment de la chute', timestampSeconds: 136 },
      { titre: 'Mise en application', timestampSeconds: 311 },
      { titre: 'Sur l’autre côté', timestampSeconds: 364 },
      { titre: 'Le contact et le timing', timestampSeconds: 428 },
      { titre: 'Le croisé', timestampSeconds: 531 },
      { titre: 'Enchaînement', timestampSeconds: 596 },
      { titre: 'Continuer / synthèse', timestampSeconds: 687 },
    ],
    quiz: [],
    content: mc('Le placement dans le déplacement : se placer et créer les conditions de l’attaque en mouvement.', '13 minutes'),
  },
]
