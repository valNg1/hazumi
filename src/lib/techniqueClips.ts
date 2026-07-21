import { canonicalTechniqueName } from './techniqueCards'

export interface ClipRef {
  id: string
  titre: string
}

/**
 * Resout le clip (Learning Asset segmente) correspondant a une technique, par
 * nom canonique. Tolere les variantes orthographiques des deux cotes.
 * Renvoie null tant que le clip n'existe pas — le bouton retombe alors sur la
 * modale de decomposition.
 */
export function clipForTechnique(nom: string, clips: ClipRef[]): string | null {
  const cible = canonicalTechniqueName(nom)
  return clips.find((c) => canonicalTechniqueName(c.titre) === cible)?.id ?? null
}
