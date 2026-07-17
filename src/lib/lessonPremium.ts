// Contenu structure des lecons "premium" Hazumi (modele de reference).
// Pilote par ressource_id -> permet d'ajouter d'autres lecons premium sans
// changer l'architecture. Contenu editorial fourni par Hazumi + faits publics.

export interface PremiumMeta {
  tempsLecture: string
  objectif: string
  niveau: string
  difficulte: number // 1..5
}
export interface TimelineStep { annee: string; label: string }
export interface Principe { titre: string; definition: string; application: string }
export interface JuryCritere { critere: string; explication: string; importance: 1 | 2 | 3 }
export interface SerieCard { nom: string; objectif: string; techniques: string[]; developpe: string }

export interface PremiumLessonContent {
  meta: PremiumMeta
  objectif: string
  pourquoi: { timeline: TimelineStep[]; pourquoiEtudier: string[]; developpe: string[] }
  principes: Principe[]
  jury: JuryCritere[]
  pointsCles: {
    ceremonial: string[]
    joseki: string[]
    distances: string[]
    deplacements: string[]
    series: SerieCard[]
  }
  regardExaminateur: string[]
  conseils: string[]
  aRetenir: string[]
}

export const NAGE_NO_KATA_RESSOURCE_ID = '04375145-35c7-4569-9409-6df8358caa13'

const NAGE_NO_KATA: PremiumLessonContent = {
  meta: {
    tempsLecture: '15 minutes',
    objectif: "Comprendre la logique du Nage-no-kata avant d'apprendre les techniques.",
    niveau: 'Préparation 1er Dan',
    difficulte: 3,
  },
  objectif: "Comprendre la logique du Nage-no-kata avant d'apprendre les techniques.",
  pourquoi: {
    timeline: [
      { annee: '1882-1885', label: 'Premier Nage-no-kata (contenu perdu)' },
      { annee: '1906', label: 'Version actuelle créée par Jigorō Kanō' },
      { annee: "Aujourd'hui", label: 'Référence mondiale du Kodokan' },
    ],
    pourquoiEtudier: [
      'Il met en évidence les bases techniques du judo debout.',
      "Il permet à Tori et à Uke de s'exprimer et de se perfectionner.",
      'Il présente les techniques par catégorie, de la plus aérienne à la plus proche du sol.',
      'Il est présenté au passage du 2e Dan.',
    ],
    developpe: ['posture', 'saisie', 'déplacements', 'Kuzushi', 'Tsukuri', 'Kake', 'contrôle', 'rythme'],
  },
  principes: [
    { titre: 'Adaptation (Ju)', definition: "S'adapter à la force du partenaire plutôt que de s'y opposer : le principe de souplesse.", application: "Tori utilise le déséquilibre et le mouvement de Uke pour projeter sans forcer." },
    { titre: "Seiryoku Zen'yō", definition: "Le meilleur emploi de l'énergie : un maximum d'efficacité pour un minimum d'effort.", application: 'Chaque projection recherche le placement et le moment justes plutôt que la force.' },
    { titre: 'Jita Kyōei', definition: 'Entraide et prospérité mutuelle : progresser ensemble.', application: 'Tori et Uke coopèrent pour exécuter proprement chaque technique, à droite puis à gauche.' },
    { titre: 'Respect', definition: "Le respect du partenaire, du lieu et de l'étiquette.", application: 'Saluts (ritsurei, zarei), attention portée à Joséki et à la sécurité de Uke.' },
    { titre: 'Contrôle', definition: 'La maîtrise de son corps, de la chute et du mouvement.', application: 'Uke maîtrise ses chutes ; Tori contrôle la projection du début à la fin.' },
  ],
  jury: [
    { critere: 'Connaissance des techniques', explication: 'Nommer et exécuter le répertoire attendu.', importance: 3 },
    { critere: 'Respect des principes (Kuzushi, Tsukuri, Kake)', explication: 'Construire le déséquilibre, le placement puis la finition.', importance: 3 },
    { critere: 'Sécurité', explication: 'Protéger son partenaire et soi-même ; chutes maîtrisées.', importance: 3 },
    { critere: 'Contrôle du partenaire', explication: 'Maîtrise des saisies et des liaisons du début à la fin.', importance: 2 },
    { critere: 'Fluidité', explication: 'Rythme et continuité, sans temps morts.', importance: 2 },
    { critere: 'Attitude et étiquette', explication: 'Engagement, sérénité, respect du cérémonial.', importance: 2 },
  ],
  pointsCles: {
    ceremonial: [
      'Uke et Tori se tournent vers Joséki et le saluent en ritsurei (salut debout).',
      'Ils se refont face et effectuent un zarei (salut à genoux).',
      "Ils se relèvent et ouvrent le kata en position kamae, en avançant d'abord la jambe gauche puis la droite.",
      'La clôture reprend les saluts en sens inverse.',
    ],
    joseki: [
      "Ne jamais tourner le dos à Joséki (l'examinateur) : règle d'or.",
      'Exception : le relevé après une chute, où Uke se relève dans le sens de la chute.',
    ],
    distances: [
      'Tori est à droite de Joséki.',
      'Face à face : 6 m de talon à talon, 5,50 m d’orteil à orteil (3 tapis en longueur).',
      "Après l'ouverture : les partenaires se retrouvent à l'intérieur des 4 mètres.",
      "L'ensemble du kata s'effectue à l'intérieur des 6 mètres.",
    ],
    deplacements: [
      "Aujourd'hui : Tori s'avance de 2/3, Uke de 1/3 (Uke avance d'environ un mètre).",
      'Anciennement : rapprochement en ayumi ashi (deux pas chacun, ou quatre pas pour Tori si la place manque).',
    ],
    series: [
      { nom: 'Te waza', objectif: "Techniques de bras et d'épaule", techniques: ['Uki-otoshi', 'Ippon-seoi-nage', 'Kata-guruma'], developpe: 'Les projections les plus aériennes.' },
      { nom: 'Koshi waza', objectif: 'Techniques de hanche', techniques: ['Uki-goshi', 'Harai-goshi', 'Tsurikomi-goshi'], developpe: "L'engagement et la rotation de la hanche." },
      { nom: 'Ashi waza', objectif: 'Techniques de jambe', techniques: ['Okuri-ashi-harai', 'Sasae-tsurikomi-ashi', 'Uchi-mata'], developpe: 'Le balayage, le blocage et la fauche.' },
      { nom: 'Ma sutemi waza', objectif: 'Sacrifices arrière', techniques: ['Tomoe-nage', 'Ura-nage', 'Sumi-gaeshi'], developpe: "Le sacrifice dans l'axe arrière." },
      { nom: 'Yoko sutemi waza', objectif: 'Sacrifices de côté', techniques: ['Yoko-gake', 'Yoko-guruma', 'Uki-waza'], developpe: 'Le sacrifice latéral, au plus près du sol.' },
    ],
  },
  regardExaminateur: [], // contenu editorial fourni progressivement
  conseils: [], // contenu editorial fourni progressivement
  aRetenir: ['', '', '', '', ''], // 5 cartes memoire, contenu fourni ensuite
}

export const PREMIUM_LESSONS: Record<string, PremiumLessonContent> = {
  [NAGE_NO_KATA_RESSOURCE_ID]: NAGE_NO_KATA,
}

export function getPremiumContent(ressourceId: string | undefined): PremiumLessonContent | undefined {
  return ressourceId ? PREMIUM_LESSONS[ressourceId] : undefined
}

// Niveaux du quiz premium (regroupement par tranches de 5 questions, par ordre).
export const QUIZ_NIVEAUX = [
  { start: 0, label: 'Niveau 1 · Comprendre' },
  { start: 5, label: 'Niveau 2 · Observer' },
  { start: 10, label: 'Niveau 3 · Analyser' },
]
