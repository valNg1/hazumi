// Contenu pedagogique Hazumi pour le parcours "Preparer le 1er Dan".
// Redaction originale Hazumi : aucune reprise textuelle d'un document tiers,
// aucune mention de source dans les textes affiches a l'utilisateur.

export const PREMIER_DAN_TITRE = 'Préparer le 1er Dan'

export interface PremierDanHero {
  emoji: string
  titre: string
  intro: string
  ctaPrimary: string
  ctaSecondary: string
}

export const PREMIER_DAN_HERO: PremierDanHero = {
  emoji: '🥋',
  titre: 'Préparer le 1er Dan',
  intro:
    "Le 1er Dan marque l'entrée dans la maîtrise des fondamentaux du judo. Ce parcours vous accompagne pas à pas dans la préparation des différentes UV de l'examen officiel du 1er Dan, en vous permettant de progresser à votre rythme.",
  ctaPrimary: '▶ Commencer le parcours',
  ctaSecondary: '📚 Parcourir les ressources',
}

export interface UV {
  code: 'UV1' | 'UV2' | 'UV3' | 'UV4'
  titre: string
  sousTitre: string
  resume: string
  detail: string
  voieCompetitionUniquement: boolean
}

export const PREMIER_DAN_UVS: UV[] = [
  {
    code: 'UV1',
    titre: 'Kata',
    sousTitre: 'La forme et les principes',
    resume:
      "Démonstration commentée des formes codifiées : vous montrez, avec un partenaire, la justesse des placements, des saisies et des déséquilibres.",
    detail:
      "Cette épreuve met en avant votre compréhension des principes plutôt que la seule mémorisation. On observe la clarté des rôles entre celui qui projette et celui qui chute, la précision des trajectoires, le rythme et l'harmonie de l'ensemble. Un travail régulier à deux, en cherchant la propreté du geste avant la vitesse, prépare efficacement cette unité.",
    voieCompetitionUniquement: false,
  },
  {
    code: 'UV2',
    titre: 'Technique',
    sousTitre: 'Debout et au sol',
    resume:
      "Exécution et explication des techniques du répertoire, en projection comme au sol, à partir de situations imposées puis plus libres.",
    detail:
      "Il s'agit de démontrer un large éventail de mouvements en restant capable d'en expliquer la logique : construction du déséquilibre, placement, finition, puis liaisons et enchaînements. La capacité à adapter une technique à la réaction du partenaire et à passer proprement du debout au sol est particulièrement valorisée.",
    voieCompetitionUniquement: false,
  },
  {
    code: 'UV3',
    titre: 'Efficacité',
    sousTitre: 'Voie compétition uniquement',
    resume:
      "Validation de l'efficacité en situation d'opposition. Cette unité n'existe que pour la voie dominante compétition ; elle est absente de la voie dominante technique.",
    detail:
      "Réservée à celles et ceux qui choisissent la voie compétition, cette unité reconnaît la capacité à marquer et à s'imposer en randori et en shiai, généralement à travers des résultats obtenus lors de rencontres. Si vous préparez la voie technique, vous n'avez pas à présenter cette unité : votre niveau est apprécié à travers la richesse et la qualité de votre judo.",
    voieCompetitionUniquement: true,
  },
  {
    code: 'UV4',
    titre: 'Engagement personnel',
    sousTitre: 'Le judoka au-delà du tapis',
    resume:
      "Reconnaissance de votre implication dans la vie du judo : arbitrage, aide à l'encadrement, animation, participation à la vie du club.",
    detail:
      "Cette unité valorise le rôle que vous tenez autour de la pratique : accompagner les plus jeunes, participer à l'organisation, s'initier à l'arbitrage ou à l'enseignement. Elle rappelle que la ceinture noire n'est pas qu'une performance individuelle, mais aussi une contribution à la communauté du judo.",
    voieCompetitionUniquement: false,
  },
]

export interface Voie {
  code: 'competition' | 'technique'
  titre: string
  description: string
  uvs: string[]
}

export const PREMIER_DAN_VOIES: Voie[] = [
  {
    code: 'competition',
    titre: 'Dominante compétition',
    description:
      "Vous mettez en avant votre efficacité en opposition. Le parcours réunit le Kata, la technique, l'efficacité en compétition et l'engagement personnel.",
    uvs: ['UV1', 'UV2', 'UV3', 'UV4'],
  },
  {
    code: 'technique',
    titre: 'Dominante technique',
    description:
      "Vous mettez en avant la qualité et la richesse de votre judo. Le parcours réunit le Kata, la technique et l'engagement personnel — sans épreuve d'efficacité en compétition.",
    uvs: ['UV1', 'UV2', 'UV4'],
  },
]

export interface ExamenCarte {
  titre: string
  description: string
}

export const PREMIER_DAN_EXAMEN: ExamenCarte[] = [
  {
    titre: 'Les unités de valeur',
    description:
      "L'examen se décompose en unités indépendantes. Le Kata, la technique et l'engagement personnel sont communs à tous ; l'efficacité en compétition ne concerne que la voie compétition.",
  },
  {
    titre: 'Deux voies possibles',
    description:
      "Vous choisissez la voie qui vous correspond : compétition, centrée sur l'efficacité en opposition, ou technique, centrée sur la qualité et la maîtrise du judo.",
  },
  {
    titre: 'Les prérequis',
    description:
      "Être ceinture marron (1er kyu), disposer d'une licence en cours de validité et remplir les conditions d'âge et d'ancienneté de pratique avant de se présenter.",
  },
  {
    titre: 'Les modalités',
    description:
      "Les unités se préparent et se valident séparément, devant un jury. Une fois acquises, elles restent acquises : vous avancez à votre rythme, unité après unité.",
  },
]

export interface JuryCritere {
  icone: string
  label: string
  description: string
}

export const PREMIER_DAN_JURY: JuryCritere[] = [
  { icone: '📚', label: 'Connaissance des techniques', description: "Nommer et exécuter le répertoire attendu, debout comme au sol." },
  { icone: '⚖️', label: 'Respect des principes', description: 'Construire le déséquilibre, le placement puis la finition (Kuzushi, Tsukuri, Kake).' },
  { icone: '🤝', label: 'Contrôle du partenaire', description: 'Garder la maîtrise des saisies et des liaisons du début à la fin du mouvement.' },
  { icone: '🛡️', label: 'Sécurité', description: 'Protéger son partenaire et soi-même, chutes et projections maîtrisées.' },
  { icone: '🌊', label: 'Fluidité', description: 'Enchaîner avec rythme et continuité, sans temps morts ni gestes parasites.' },
  { icone: '🎌', label: 'Attitude', description: "Respecter l'étiquette, faire preuve d'engagement et de sérénité." },
]

export interface TimelineStep {
  label: string
  clickable: boolean
  aVenir?: boolean
  anchor?: string
  note?: string
}

export const PREMIER_DAN_TIMELINE: TimelineStep[] = [
  { label: 'Présentation', clickable: true, anchor: 'top' },
  { label: 'UV1 — Kata', clickable: true, anchor: 'uv' },
  { label: 'UV2 — Technique', clickable: true, anchor: 'uv' },
  { label: 'UV3 — Efficacité', clickable: true, anchor: 'uv', note: 'selon voie choisie' },
  { label: 'Quiz final', clickable: false, aVenir: true, note: 'à venir' },
  { label: "Prêt pour l'examen", clickable: true, anchor: 'commencer' },
]
