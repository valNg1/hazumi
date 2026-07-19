import type { Univers } from './bibliotheque'

export interface ParcoursEnCours {
  id: string
  nom: string
  done: number
  total: number
  derniereActivite: string
}

export interface PlaylistEnCours {
  id: string
  nom: string
  univers: Univers
  done: number
  total: number
  derniereActivite: string
}

export interface ElementProgression {
  id: string
  nom: string
  origine: 'hazumi' | 'playlist'
  univers?: Univers
  done: number
  total: number
  percent: number
  derniereActivite: string
}

export interface Dashboard {
  enCours: ElementProgression[]
  termines: ElementProgression[]
  total: number
  nbEnCours: number
  nbTermines: number
}

function normaliser(t: string): string {
  return t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

function toElement(
  source: ParcoursEnCours | PlaylistEnCours,
  origine: 'hazumi' | 'playlist'
): ElementProgression {
  return {
    id: source.id,
    nom: source.nom,
    origine,
    univers: 'univers' in source ? source.univers : undefined,
    done: source.done,
    total: source.total,
    percent: source.total === 0 ? 0 : Math.round((source.done / source.total) * 100),
    derniereActivite: source.derniereActivite,
  }
}

/**
 * Tableau de bord de progression : ce que le judoka etait en train d'apprendre,
 * l'activite la plus recente en premier. Un parcours non commence n'y figure pas.
 */
export function buildDashboard(
  parcours: ParcoursEnCours[],
  playlists: PlaylistEnCours[]
): Dashboard {
  const tous = [
    ...parcours.map((p) => toElement(p, 'hazumi')),
    ...playlists.map((l) => toElement(l, 'playlist')),
  ].filter((e) => e.total > 0 && e.done > 0)

  const parRecence = (a: ElementProgression, b: ElementProgression) =>
    b.derniereActivite.localeCompare(a.derniereActivite)

  const enCours = tous.filter((e) => e.done < e.total).sort(parRecence)
  const termines = tous.filter((e) => e.done >= e.total).sort(parRecence)

  return {
    enCours,
    termines,
    total: enCours.length + termines.length,
    nbEnCours: enCours.length,
    nbTermines: termines.length,
  }
}

/** Une playlist est un filtre par tags : sa progression se mesure sur les ressources correspondantes. */
export function playlistProgress(
  items: { id: string; tags: string[] }[],
  tagsPlaylist: string[],
  completedIds: string[]
): { done: number; total: number } {
  if (tagsPlaylist.length === 0) return { done: 0, total: 0 }
  const cibles = tagsPlaylist.map(normaliser)
  const correspondants = items.filter((i) => i.tags.some((t) => cibles.includes(normaliser(t))))
  const done = correspondants.filter((i) => completedIds.includes(i.id)).length
  return { done, total: correspondants.length }
}
