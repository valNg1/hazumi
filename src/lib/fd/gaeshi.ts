import type { FDJourney } from './fdJourney'

// Journey masterclass « Gaeshi — Projet Excellence Judo ».
// 1 vidéo = 1 journey (parcours-first). Contenu ANCRÉ sur le transcript auto-généré
// (sous-titres FR) de https://youtu.be/sUiRVdwFElg — cf. references/fd-sources/gaeshi-projet-excellence.md.
// NB : transcript ASR → certains termes techniques restent à valider par un expert.

export const GAESHI_JOURNEY: FDJourney = {
  slug: 'gaeshi-projet-excellence',
  ressourceId: 'bf947eb3-f9e1-4b26-8994-90af73d81eac',
  titre: 'Gaeshi — Projet Excellence Judo',
  univers: 'judo-ka', // contrainte technique héritée (colonne catalogue) — NON exposée comme structure produit
  video: {
    url: 'https://www.youtube.com/watch?v=sUiRVdwFElg',
    titre: 'Projet Excellence Judo Gaeshi Juin 2026',
    dureeSeconds: 764,
  },
  // Chapitres validés par le PO (horodatages officiels).
  chapitres: [
    { titre: 'Tsubame-gaeshi', timestampSeconds: 17, description: 'Ne pas coller le genou, toucher la cheville pour revenir derrière. Ne pas pousser le partenaire.' },
    { titre: 'Ippon-gaeshi', timestampSeconds: 46, description: 'Uke engage réellement. Tori esquive grâce au mouvement du bassin.' },
    { titre: 'Définition du Sen no Sen', timestampSeconds: 61, description: 'Le contre est placé sur l’intention. Lorsque l’attaque est déjà engagée, on n’est plus dans le Sen no Sen.' },
    { titre: 'Application sur O-soto-gari (1)', timestampSeconds: 80, description: 'Contre en Sumi-otoshi. Ouverture du revers et engagement vers l’avant.' },
    { titre: 'Application sur O-soto-gari (2)', timestampSeconds: 125, description: 'Contrôle de la force puis contre en O-soto-otoshi ou O-soto-gari.' },
    { titre: 'Application sur O-soto-gari (3)', timestampSeconds: 184, description: 'Contre en Ko-soto-gake.' },
    { titre: 'Application sur O-soto-gari (4)', timestampSeconds: 250, description: 'Contre en Uki-otoshi.' },
    { titre: 'Application sur O-soto-gari (5)', timestampSeconds: 310, description: 'Contre en Te-guruma.' },
    { titre: 'Application sur O-soto-gari (6)', timestampSeconds: 323, description: 'Travail de la cuisse vers l’avant.' },
    { titre: 'Contre sur Ko-uchi-gari (1)', timestampSeconds: 350, description: 'Sasae-tsuri-komi-ashi.' },
    { titre: 'Contre sur Ko-uchi-gari (2)', timestampSeconds: 406, description: 'Contrôle puis repousse la jambe.' },
    { titre: 'Contre sur De-ashi-barai', timestampSeconds: 452, description: 'Laisser le pied se faire balayer puis balayer le pied d’appui.' },
    { titre: 'Contre sur Ko-uchi-gari (3)', timestampSeconds: 510, description: 'Utiliser le déplacement de Uke.' },
    { titre: 'Contre sur Harai-goshi / Uchi-mata', timestampSeconds: 539, description: 'Contrôle puis sortie de jambe.' },
    { titre: 'Uchi-mata-gaeshi / Sukashi', timestampSeconds: 611, description: 'Différence entre Sukashi et Gaeshi.' },
    { titre: 'Utsuri-goshi / Ushiro-goshi', timestampSeconds: 656 },
    { titre: 'Contre sur O-uchi-gari', timestampSeconds: 690 },
  ],
  quiz: [
    { question: 'Que désigne le « Sen » dans le travail des contres ?', reponses: ['Le moment où l’on prend l’adversaire sur son intention, avant l’engagement', 'La chute vers l’arrière', 'Une saisie de manche', 'Un exercice d’échauffement'], bonneReponse: [0], explication: 'Le Sen est le temps du contre : on prend l’adversaire sur son intention, avant qu’il n’engage sa technique.' },
    { question: 'Quand faut-il déclencher le contre d’une attaque de pied ?', reponses: ['Quand il a accroché', 'Quand il démarre son attaque', 'Après la projection', 'Jamais'], bonneReponse: [1], explication: 'Il faut anticiper : prendre le partenaire quand il DÉMARRE, pas une fois qu’il a accroché.' },
    { question: 'Pourquoi contrôler la manche vers la hanche opposée ?', reponses: ['Pour aller plus vite', 'Pour empêcher l’attaquant d’avoir de la force sur le haut du corps', 'Pour saluer', 'Pour changer de garde'], bonneReponse: [1], explication: 'Contrôler la manche vers la hanche opposée casse la force de l’attaquant sur le haut du corps ; on garde une position basse.' },
    { question: 'Que se passe-t-il si l’on lâche la manche pendant la défense ?', reponses: ['Rien', 'L’attaquant emmène le haut du corps', 'On gagne des points', 'Le contre est plus facile'], bonneReponse: [1], explication: 'Si on lâche la manche, l’attaquant emmène le haut du corps : il faut la garder verrouillée vers l’arrière.' },
    { question: 'Quelle différence entre Uki-otoshi et Sumi-otoshi ?', reponses: ['Aucune', 'Uki-otoshi = chute vers l’avant, Sumi-otoshi = vers l’arrière', 'Ce sont des immobilisations', 'Uki-otoshi est au sol'], bonneReponse: [1], explication: 'Uki-otoshi projette vers l’avant, Sumi-otoshi vers l’arrière.' },
    { question: 'Quel exercice aide à ressentir le déclenchement de la rotation ?', reponses: ['Travailler les yeux fermés', 'Frapper plus fort', 'Reculer sans contrôle', 'Fermer les poings'], bonneReponse: [0], explication: 'Travailler les yeux fermés aide à ressentir le relâchement qui déclenche la rotation.' },
    { question: 'Sur un balayage, combien d’énergie faut-il pour le contre ?', reponses: ['Le maximum', 'Peu : en cherchant l’arrière du pied, « il se balaie tout seul »', 'Aucune, on subit', 'Il faut sauter'], bonneReponse: [1], explication: 'On vient chercher l’arrière du pied sans forcer : le partenaire se balaie tout seul.' },
    { question: 'Que faut-il, côté attaquant, pour qu’un contre puisse se construire ?', reponses: ['Une attaque sincère', 'Une fausse attaque', 'Rester immobile', 'Attaquer très lentement'], bonneReponse: [0], explication: 'L’attaque doit être sincère : sans engagement réel, le contre ne peut pas se construire.' },
  ],
  content: {
    meta: {
      tempsLecture: '13 minutes',
      objectif: 'Comprendre et travailler les contres (Gaeshi) : prendre l’adversaire sur son intention (le « Sen »), par temps et par type d’attaque.',
      niveau: 'JUDO-KÂ',
      difficulte: 4,
    },
    objectifs: [
      'Comprendre la notion de « Sen » : contrer sur l’intention, avant l’engagement.',
      'Distinguer les trois temps du contre.',
      'Contrôler la manche vers la hanche opposée pour casser la force de l’attaquant.',
      'Anticiper une attaque de jambe et se servir du déplacement de l’adversaire.',
    ],
    prerequis: [
      'Maîtriser les chutes (ukemi) dans toutes les directions.',
      'Connaître les attaques de base à contrer (ashi-waza, o-uchi-gari, etc.).',
    ],
    concepts: [
      { titre: 'Le « Sen »', texte: 'Le temps du contre : prendre l’adversaire sur son intention, avant qu’il n’engage sa technique. Une fois pris dans la technique, il est trop tard.', timestampSeconds: 56 },
      { titre: 'Contrôle de la manche', texte: 'Contrôler la manche vers la hanche opposée empêche l’attaquant d’avoir de la force sur le haut du corps ; garder une position basse.', timestampSeconds: 121 },
      { titre: 'Le relâchement', texte: 'Laisser partir le revers et suivre l’action ; ressentir le relâchement qui déclenche la rotation.', timestampSeconds: 164 },
      { titre: 'Anticipation', texte: 'Prendre le partenaire quand il démarre son attaque, pas une fois qu’il a accroché ; inverser sa position (deux appuis contre un).', timestampSeconds: 346 },
      { titre: 'Se servir du déplacement', texte: 'Selon que Uke est en équilibre ou percute et avance, utiliser son propre déplacement et son énergie pour le contrer.', timestampSeconds: 497 },
    ],
    explications: [
      { titre: '1er temps — sur l’engagement', texte: 'Ne pas accepter le déplacement, avancer le corps vers l’avant, ouvrir le revers pour casser l’attaque.', timestampSeconds: 81 },
      { titre: '2e temps — casser la force', texte: 'Garder une position basse, contrôler la manche, descendre le partenaire vers l’arrière ; sauter ou relancer en gaeshi.', timestampSeconds: 121 },
      { titre: '3e temps — suivre l’action', texte: 'Déclencher son déplacement quand il s’engage (appel revers), laisser partir le revers, suivre son action.', timestampSeconds: 164 },
      { titre: 'Renversement — la main dans la jambe', texte: 'Descendre l’appui, verrouiller la manche vers l’arrière/hanche, plonger la main dans la jambe et renverser.', timestampSeconds: 278 },
      { titre: 'Contre d’une attaque de pied', texte: 'Anticiper, repousser la jambe droit devant, associer la main au col pour la rotation.', timestampSeconds: 346 },
      { titre: 'Contre par-dessous', texte: 'Descendre le centre de gravité, orienter les épaules, récupérer sous la cuisse, pousser avec le ventre et passer par-dessus.', timestampSeconds: 533 },
      { titre: 'Contrôle de la rotation', texte: 'Sur le gaeshi, contrôler le coude et la rotation du partenaire pour partir dans le dos. « Si c’est moi qui gagne la rotation, c’est moi qui l’emmène. »', timestampSeconds: 602 },
      { titre: 'Le fauchage', texte: 'Assurer l’appui avant, rapprocher l’appui ; laisser partir la jambe qui revient toute seule et sert de fauchage.', timestampSeconds: 726 },
    ],
    erreurs: [
      'Démarrer le contre quand l’adversaire a déjà accroché, au lieu de l’instant où il démarre.',
      'Lâcher la manche : l’attaquant emmène alors le haut du corps.',
      'Vouloir repousser le partenaire avec les bras au lieu de travailler les appuis.',
      'Manquer de sincérité dans l’attaque ou le balayage : le contre ne peut pas se construire.',
    ],
    conseils: [
      'Prendre son temps, ne pas chercher à enchaîner tout de suite.',
      'Travailler des deux côtés.',
      'Ressentir le relâchement, éventuellement les yeux fermés.',
      'Anticiper : « je sais ce qu’il va faire, je le laisse engager et je m’oriente ».',
    ],
    drills: [
      { titre: 'Les trois temps', texte: 'Travailler le contre sur les trois temps (sur l’engagement, un peu plus loin, puis en suivant l’action), lentement d’abord.' },
      { titre: 'Des deux côtés, sans forcer', texte: 'Répéter le retour et les appuis sans repousser le partenaire, en le laissant engager sincèrement.' },
      { titre: 'Yeux fermés', texte: 'Ressentir le déclenchement de la rotation les yeux fermés.' },
    ],
    aRetenir: [
      'Le contre se prend sur l’intention (le « Sen »), pas une fois l’attaque lancée.',
      'Position basse + contrôle de la manche vers la hanche opposée = casser la force.',
      'Anticiper le démarrage de l’attaque, pas l’accrochage.',
      'Se servir du déplacement et de l’énergie de l’adversaire.',
      'Contrôler la rotation : « si c’est moi qui gagne, c’est moi qui l’emmène ».',
    ],
  },
}
