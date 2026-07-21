import type { MediaRole } from './assetMedia'

export interface TechniqueNageNoKata {
  /** Nom canonique affiche. Les variantes sont gerees par techniqueCards. */
  nom: string
  famille: 'Te-waza' | 'Koshi-waza' | 'Ashi-waza'
  /** Rang dans la serie (1 a 3). */
  ordre: number
}

/**
 * Reference canonique des neuf techniques du Nage-no-kata au 1er dan, dans
 * l'ordre du kata. Source unique pour le seed, les cartes et l'affichage :
 * une correction de nommage se fait ici, une seule fois.
 */
export const NAGE_NO_KATA_TECHNIQUES: TechniqueNageNoKata[] = [
  { nom: 'Uki-otoshi', famille: 'Te-waza', ordre: 1 },
  { nom: 'Seoi-nage', famille: 'Te-waza', ordre: 2 },
  { nom: 'Kata-guruma', famille: 'Te-waza', ordre: 3 },
  { nom: 'Uki-goshi', famille: 'Koshi-waza', ordre: 1 },
  { nom: 'Harai-goshi', famille: 'Koshi-waza', ordre: 2 },
  { nom: 'Tsurikomi-goshi', famille: 'Koshi-waza', ordre: 3 },
  { nom: 'Okuri-ashi-harai', famille: 'Ashi-waza', ordre: 1 },
  { nom: 'Sasae-tsurikomi-ashi', famille: 'Ashi-waza', ordre: 2 },
  { nom: 'Uchi-mata', famille: 'Ashi-waza', ordre: 3 },
]

/** Nombre de techniques par serie, pour l'affichage « ordre / total ». */
export function totalDansSerie(famille: TechniqueNageNoKata['famille']): number {
  return NAGE_NO_KATA_TECHNIQUES.filter((t) => t.famille === famille).length
}

/** Le media principal d'une technique du kata : la demonstration. */
export const ROLE_PRINCIPAL: MediaRole = 'demonstration'

export const NAGE_NO_KATA_SOURCE = {
  url: 'https://www.youtube.com/watch?v=bkhBZzE2HpM',
  titre: 'Nage-no-kata — Démonstration Kodokan',
  fournisseur: 'youtube',
  dureeSeconds: 1765,
}
