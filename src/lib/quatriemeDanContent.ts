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
