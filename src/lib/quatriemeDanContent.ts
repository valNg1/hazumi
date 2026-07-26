// Contenu pédagogique Hazumi pour la landing du parcours « Préparer le 4e Dan »
// (UV Kime-no-Kata). Rédaction Hazumi affichée à l'utilisateur ; le titre est
// piloté par le code (le parcours reste identifié en base par son titre existant).

// Titre du parcours en base (= titre affiché) : sert à reconnaître le parcours
// pour afficher la landing enrichie.
export const QUATRIEME_DAN_PARCOURS_TITRE = 'Préparer le 4e Dan'

// Libellés affichés (carte de la liste + landing), pilotés par le code afin de
// présenter le parcours comme « 4e Dan » sans dépendre du contenu en base.
export const QUATRIEME_DAN_TITRE = 'Préparer le 4e Dan'
export const QUATRIEME_DAN_NIVEAU = '4e dan'
export const QUATRIEME_DAN_CARTE_DESCRIPTION =
  'Le kata de la décision : 20 techniques de défense, à genoux (Idori) et debout (Tachiai), pour préparer le kata du 4e Dan.'

/** Titre affiché d'un parcours (override « 4e Dan » du parcours Kime, base inchangée). */
export function titreParcoursAffiche(titre: string): string {
  return titre === QUATRIEME_DAN_PARCOURS_TITRE ? QUATRIEME_DAN_TITRE : titre
}

export interface QuatriemeDanHero {
  emoji: string
  titre: string
  intro: string
  ctaPrimary: string
  ctaSecondary: string
}

export const QUATRIEME_DAN_HERO: QuatriemeDanHero = {
  emoji: '🥋',
  titre: 'Préparer le 4e Dan',
  intro:
    "Le 4e dan (Yondan) marque l'accès à un niveau d'expertise où la maîtrise technique s'accompagne d'une capacité à transmettre, analyser et encadrer la pratique.",
  ctaPrimary: '▶ Commencer le parcours',
  ctaSecondary: '📚 Parcourir les ressources',
}

export interface QuatriemeDanPresentation {
  paragraphes: string[]
  uv1Intro: string
  katas: string[]
}

export const QUATRIEME_DAN_PRESENTATION: QuatriemeDanPresentation = {
  paragraphes: [
    "Le Kime-no-Kata constitue l'une des unités de valeur de cet examen. Son étude requiert une compréhension précise des principes du kata, de la logique des situations de combat et de l'exécution des techniques, conformément au référentiel fédéral.",
    "Ce parcours a pour objectif de fournir un support structuré consacré au Kime-no-Kata, kata imposé de l'UV1 du 4e dan. Il accompagne le candidat dans l'étude de cette unité de valeur et complète l'enseignement dispensé au dojo.",
  ],
  uv1Intro:
    "Pour l'UV1, le candidat présente, dans le rôle de tori, le Kime-no-Kata ainsi qu'un second kata exécuté intégralement, choisi parmi :",
  katas: ['Nage-no-Kata', 'Katame-no-Kata', 'Kodokan Goshin-jutsu', 'Gonosen-no-Kata'],
}

// ── L'examen en un coup d'œil (6 cartes concises, réf. FFJDA) ────────────────
export interface ExamenCarte {
  titre: string
  description: string
}

export const QUATRIEME_DAN_EXAMEN: ExamenCarte[] = [
  {
    titre: 'UV1 — Kime-no-Kata',
    description: "L'UV1 est l'unité de kata. Le Kime-no-Kata en est le kata imposé : c'est le cœur de ce parcours.",
  },
  {
    titre: 'Prérequis',
    description: "Être titulaire du 3e Dan, disposer d'une licence FFJDA en cours de validité et remplir les conditions d'âge et d'ancienneté fixées par la commission des grades.",
  },
  {
    titre: "Déroulé de l'épreuve",
    description: "L'UV1 se présente devant un jury : les katas imposés sont démontrés dans le respect des formes officielles et du protocole (saluts, rythme, distances).",
  },
  {
    titre: 'Rôle du candidat',
    description: "Le candidat exécute le Kime-no-Kata dans le rôle de Tori ; un partenaire tient le rôle de Uke.",
  },
  {
    titre: 'Second kata',
    description: "En plus du Kime-no-Kata, le candidat présente intégralement un second kata au choix : Nage-no-Kata, Katame-no-Kata, Kodokan Goshin-jutsu ou Gonosen-no-Kata.",
  },
  {
    titre: 'Attentes du jury',
    description: "Le jury évalue la fidélité aux formes officielles, la précision des placements, le contrôle et l'attitude, sans exiger de performance en opposition.",
  },
]

// ── Les unités de valeur (UV1 mise en avant ; ce parcours ne traite que l'UV1) ─
export interface UniteValeur {
  code: string
  titre: string
  sousTitre: string
  resume: string
}

export const QUATRIEME_DAN_UV1: UniteValeur = {
  code: 'UV1',
  titre: 'Kata',
  sousTitre: 'Kime-no-Kata (imposé) + un second kata',
  resume: "L'unité de valeur travaillée dans ce parcours. Le candidat présente le Kime-no-Kata dans le rôle de Tori, puis un second kata complet choisi parmi les quatre katas autorisés.",
}

export const QUATRIEME_DAN_AUTRES_UV =
  "L'examen du 4e Dan comporte d'autres unités de valeur. Ce parcours se concentre exclusivement sur l'UV1 (kata) ; les autres unités ne sont pas traitées ici."
