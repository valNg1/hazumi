export type Univers = 'kyu' | 'shiai' | 'judo-ka'
export type ContentType = 'video' | 'article' | 'pdf'
export type Source = 'hazumi' | 'perso'

export interface Ressource {
  id: string
  titre: string
  type: ContentType
  parcours: Univers
  tags: string[]
  grade: string | null
  famille: string | null
  url: string | null
  /** hazumi = ajoute par l'administration ; perso = ajoute par le judoka. */
  source: Source
  contenu?: string | null
}

export const UNIVERS_OPTIONS: { value: Univers; label: string; icone: string }[] = [
  { value: 'kyu', label: 'Kyu', icone: '🥋' },
  { value: 'shiai', label: 'Shiai', icone: '🥊' },
  { value: 'judo-ka', label: 'Judo-Kâ', icone: '🎌' },
]

export function universLabel(u: Univers): string {
  return UNIVERS_OPTIONS.find((o) => o.value === u)?.label ?? u
}

/** Insensible a la casse et aux accents : le vocabulaire japonais est souvent mal orthographie. */
export function normaliserTexte(texte: string): string {
  return texte.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

export function searchResources(items: Ressource[], recherche: string): Ressource[] {
  const q = normaliserTexte(recherche.trim())
  if (!q) return items
  return items.filter((item) => {
    const champs = [item.titre, item.famille ?? '', item.grade ?? '', ...item.tags]
    return champs.some((c) => normaliserTexte(c).includes(q))
  })
}

/** Filtre par provenance : contenu Hazumi (administration) ou contenu du judoka. */
export function filterBySource(items: Ressource[], source: Source | 'tous'): Ressource[] {
  return source === 'tous' ? items : items.filter((i) => i.source === source)
}

/** Les ressources d'une playlist : une playlist est un filtre par tags. */
export function playlistResources(items: Ressource[], tags: string[]): Ressource[] {
  if (tags.length === 0) return []
  const cibles = tags.map(normaliserTexte)
  return items.filter((i) => i.tags.some((t) => cibles.includes(normaliserTexte(t))))
}

/** Tous les tags presents, dedoublonnes sans tenir compte de la casse. */
export function collectTags(items: Ressource[]): string[] {
  const parNormalise = new Map<string, string>()
  items.forEach((i) =>
    i.tags.forEach((t) => {
      const propre = t.trim()
      if (!propre) return
      const cle = normaliserTexte(propre)
      if (!parNormalise.has(cle)) parNormalise.set(cle, propre)
    })
  )
  return Array.from(parNormalise.values()).sort((a, b) => a.localeCompare(b, 'fr'))
}
