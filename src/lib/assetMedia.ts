import type { Segment } from './segments'

export const MEDIA_ROLES = [
  'demonstration',
  'ralenti',
  'vue_arriere',
  'analyse',
  'erreur_frequente',
  'complet',
] as const

export type MediaRole = (typeof MEDIA_ROLES)[number]

export interface AssetMedia {
  id: string
  role: MediaRole
  sourceUrl: string
  segmentStart: number | null
  segmentEnd: number | null
  estPrincipal: boolean
  ordre: number
  titre: string | null
}

const LIBELLES: Record<MediaRole, string> = {
  demonstration: 'Démonstration',
  ralenti: 'Ralenti',
  vue_arriere: 'Vue arrière',
  analyse: 'Analyse',
  erreur_frequente: 'Erreur fréquente',
  complet: 'Démonstration complète',
}

export function roleLabel(role: MediaRole): string {
  return LIBELLES[role] ?? role
}

export function mediaSegment(m: AssetMedia): Segment {
  return { start: m.segmentStart, end: m.segmentEnd }
}

export function hasMultipleMedias(medias: AssetMedia[]): boolean {
  return medias.length > 1
}

/** Le media ouvert par defaut : le principal, sinon le plus petit ordre. */
export function pickPrincipal(medias: AssetMedia[]): AssetMedia | null {
  if (medias.length === 0) return null
  const principal = medias.find((m) => m.estPrincipal)
  if (principal) return principal
  return [...medias].sort((a, b) => a.ordre - b.ordre)[0]
}

/** Le principal en tete, puis par ordre croissant. Ne mute pas l'entree. */
export function sortMedias(medias: AssetMedia[]): AssetMedia[] {
  return [...medias].sort((a, b) => {
    if (a.estPrincipal !== b.estPrincipal) return a.estPrincipal ? -1 : 1
    return a.ordre - b.ordre
  })
}
