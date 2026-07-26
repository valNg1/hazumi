// Contenu pédagogique Hazumi pour la landing du parcours « Préparer le 4e Dan »
// (UV Kime-no-Kata). Rédaction Hazumi affichée à l'utilisateur ; le titre est
// piloté par le code (le parcours reste identifié en base par son titre existant).

// Titre du parcours tel qu'enregistré en base : sert uniquement à reconnaître le
// parcours pour afficher la landing enrichie. Non affiché à l'utilisateur.
export const QUATRIEME_DAN_PARCOURS_TITRE = 'Préparer le 3e Dan'

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
    "Le Kime-no-Kata a été créé pour enseigner les techniques les plus efficaces en situation de combat réel. Le but de sa pratique est de maîtriser naturellement le tai-sabaki et de contrôler l'adversaire en choisissant la réponse la plus efficace dans chaque situation.",
  ctaPrimary: '▶ Commencer le parcours',
  ctaSecondary: '📚 Parcourir les ressources',
}

export interface QuatriemeDanPourquoi {
  titre: string
  paragraphes: string[]
}

export const QUATRIEME_DAN_POURQUOI: QuatriemeDanPourquoi = {
  titre: 'Pourquoi apprendre le Kime-no-Kata ?',
  paragraphes: [
    "Le Kime-no-Kata fait partie des exigences techniques de l'examen du 4e Dan français.",
    "Ce parcours est conçu pour aider les judokas à préparer ce kata progressivement, à en comprendre les principes et à s'entraîner efficacement, en complément de l'enseignement reçu dans leur dojo.",
  ],
}
