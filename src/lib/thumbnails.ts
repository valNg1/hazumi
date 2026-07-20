import { detectVideoType } from './video'
import { techniqueCard } from './techniqueCards'

export interface ThumbnailInput {
  titre: string
  /** Segment video : une sequence recoit une carte typographique dediee. */
  segment?: { famille: string; ordre?: number; total?: number; parent?: string } | null
  /** Vignette explicite, saisie ou calculee en amont. Priorite absolue. */
  thumbnailUrl?: string | null
  /** URL portee par la ressource elle-meme. */
  url?: string | null
  /** URL video portee par la lecon rattachee, le cas echeant. */
  lessonVideoUrl?: string | null
}

export type Disposition = 'vide' | 'unique' | 'duo' | 'mosaique'

export interface PlaylistCover {
  disposition: Disposition
  vignettes: string[]
}

const PLACEHOLDER_PREFIX = 'data:image/svg+xml,'

function idYoutube(url: string): string | null {
  return url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/)?.[1] ?? null
}

function idVimeo(url: string): string | null {
  return url.match(/vimeo\.com\/(\d+)/)?.[1] ?? null
}

/** Drive, Docs, Slides et Sheets partagent le meme service de vignette. */
function idGoogle(url: string): string | null {
  return url.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1] ?? null
}

function estGoogle(url: string): boolean {
  return /(?:drive|docs)\.google\.com/.test(url)
}

/**
 * Vignette generee, deterministe et sobre : deux lettres du titre sur un fond
 * gris tire du titre lui-meme. Elle garantit qu'aucune ressource ne reste sans
 * image — c'est ce qui evite les icones generiques.
 */
function vignetteGeneree(titre: string): string {
  const propre = titre.trim() || '?'
  let empreinte = 0
  for (let i = 0; i < propre.length; i++) empreinte = (empreinte * 31 + propre.charCodeAt(i)) >>> 0

  const clair = 24 + (empreinte % 26) // 24 % a 49 % : reste sombre, cohérent premium
  const fond = `hsl(0,0%,${clair}%)`
  const initiales = propre
    .split(/[\s—–-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((m) => m[0]?.toUpperCase() ?? '')
    .join('')

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 90">` +
    `<rect width="160" height="90" fill="${fond}"/>` +
    `<text x="80" y="45" font-family="system-ui,sans-serif" font-size="30" font-weight="700" ` +
    `fill="rgba(255,255,255,0.82)" text-anchor="middle" dominant-baseline="central">${initiales}</text>` +
    `</svg>`

  return PLACEHOLDER_PREFIX + encodeURIComponent(svg)
}

export function isPlaceholder(url: string): boolean {
  return url.startsWith(PLACEHOLDER_PREFIX)
}

function depuisUrl(url: string): string | null {
  if (!url || !/^https?:\/\//.test(url)) return null

  if (estGoogle(url)) {
    const id = idGoogle(url)
    return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w320` : null
  }

  const type = detectVideoType(url)

  if (type === 'youtube') {
    const id = idYoutube(url)
    return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null
  }

  if (type === 'vimeo') {
    // vumbnail sert une image ; l'API v2 de Vimeo renvoie du JSON, inutilisable
    // dans un <img>. C'etait un bug latent du pipeline.
    const id = idVimeo(url)
    return id ? `https://vumbnail.com/${id}.jpg` : null
  }

  if (/\.(jpg|jpeg|png|webp|gif|avif)(\?|$)/i.test(url)) return url

  return null
}

/**
 * Resout la vignette d'une ressource par ordre de preference, et ne renvoie
 * jamais null : la derniere etape genere une vignette sobre a partir du titre.
 */
export function resolveThumbnail(input: ThumbnailInput): string {
  if (input.thumbnailUrl?.trim()) return input.thumbnailUrl.trim()

  // Une sequence video est identifiee par sa carte, pas par la vignette de la
  // video source : sinon les neuf clips seraient indiscernables.
  if (input.segment) {
    return techniqueCard({
      nom: input.titre,
      famille: input.segment.famille,
      ordre: input.segment.ordre,
      total: input.segment.total,
      parent: input.segment.parent,
    })
  }

  const depuisRessource = input.url ? depuisUrl(input.url) : null
  if (depuisRessource) return depuisRessource

  const depuisLecon = input.lessonVideoUrl ? depuisUrl(input.lessonVideoUrl) : null
  if (depuisLecon) return depuisLecon

  return vignetteGeneree(input.titre)
}

/**
 * Couverture d'une playlist, generee automatiquement a partir du contenu :
 * 1 ressource -> sa vignette ; 2 -> les deux ; 3 et plus -> mosaique de 4.
 * L'utilisateur ne choisit jamais de couverture.
 */
export function buildPlaylistCover(vignettes: string[]): PlaylistCover {
  const utiles = vignettes.filter((v) => v && v.trim())

  if (utiles.length === 0) return { disposition: 'vide', vignettes: [] }
  if (utiles.length === 1) return { disposition: 'unique', vignettes: [utiles[0]] }
  if (utiles.length === 2) return { disposition: 'duo', vignettes: utiles.slice(0, 2) }

  // Mosaique toujours pleine : on complete en bouclant sur les disponibles.
  const quatre = Array.from({ length: 4 }, (_, i) => utiles[i % utiles.length])
  return { disposition: 'mosaique', vignettes: quatre }
}
