export type Univers = 'kyu' | 'shiai' | 'judo-ka'
export type ContentType = 'video' | 'article' | 'pdf'

export interface Ressource {
  id: string
  titre: string
  type: ContentType
  parcours: Univers
  tags: string[]
  grade: string | null
  famille: string | null
  url: string | null
}

export interface Rail {
  cle: string
  titre: string
  items: Ressource[]
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
function normaliser(texte: string): string {
  return texte.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

/**
 * Rayons de la Bibliotheque, a la maniere d'une plateforme de streaming.
 * Regroupement par famille technique ; a defaut, par univers. Aucune ressource
 * ne doit disparaitre : c'est la garantie testee.
 */
export function buildRails(items: Ressource[]): Rail[] {
  const parFamille = new Map<string, Ressource[]>()
  const parUnivers = new Map<Univers, Ressource[]>()

  items.forEach((item) => {
    const famille = item.famille?.trim()
    if (famille) {
      if (!parFamille.has(famille)) parFamille.set(famille, [])
      parFamille.get(famille)!.push(item)
    } else {
      if (!parUnivers.has(item.parcours)) parUnivers.set(item.parcours, [])
      parUnivers.get(item.parcours)!.push(item)
    }
  })

  const rails: Rail[] = []
  Array.from(parFamille.keys())
    .sort((a, b) => a.localeCompare(b, 'fr'))
    .forEach((famille) => {
      rails.push({ cle: `famille:${famille}`, titre: famille, items: parFamille.get(famille)! })
    })

  UNIVERS_OPTIONS.forEach((o) => {
    const restants = parUnivers.get(o.value)
    if (restants?.length) {
      rails.push({ cle: `univers:${o.value}`, titre: o.label, items: restants })
    }
  })

  return rails
}

export function searchResources(items: Ressource[], recherche: string): Ressource[] {
  const q = normaliser(recherche.trim())
  if (!q) return items
  return items.filter((item) => {
    const champs = [item.titre, item.famille ?? '', item.grade ?? '', ...item.tags]
    return champs.some((c) => normaliser(c).includes(q))
  })
}
