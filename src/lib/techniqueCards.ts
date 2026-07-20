export interface CarteTechnique {
  nom: string
  famille: string
  /** Rang dans la serie, 1 pour la premiere. */
  ordre?: number
  /** Nombre de techniques dans la serie. */
  total?: number
  /** Parcours parent. Nage-no-kata par defaut. */
  parent?: string
}

const PARENT_DEFAUT = 'Nage-no-kata'

/**
 * Variantes orthographiques acceptees, par nom canonique.
 * Le nom affiche reste unique : les variantes ne servent qu'a la recherche et
 * a la compatibilite avec les donnees existantes.
 */
const VARIANTES: Record<string, string[]> = {
  'Seoi-nage': ['Ippon-seoi-nage', 'Morote-seoi-nage'],
  'Tsurikomi-goshi': ['Tsuri-komi-goshi'],
  'Okuri-ashi-harai': ['Okuri-ashi-barai'],
  'Sasae-tsurikomi-ashi': ['Sasae-tsuri-komi-ashi'],
}

function normaliser(t: string): string {
  return t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[\s_-]+/g, '')
    .trim()
}

/** Ramene une variante a son nom canonique. Inchange si le nom est inconnu. */
export function canonicalTechniqueName(nom: string): string {
  const cible = normaliser(nom)
  for (const [canonique, variantes] of Object.entries(VARIANTES)) {
    if (normaliser(canonique) === cible) return canonique
    if (variantes.some((v) => normaliser(v) === cible)) return canonique
  }
  return nom
}

/** Variantes d'un nom canonique, sans le nom lui-meme. */
export function techniqueAliases(nomCanonique: string): string[] {
  const canonique = canonicalTechniqueName(nomCanonique)
  return (VARIANTES[canonique] ?? []).filter((v) => v !== canonique)
}

function echapper(t: string): string {
  return t
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Carte typographique d'une technique : identite visuelle Hazumi, noir et
 * blanc, lisible en petit. Elle rend chaque clip identifiable immediatement,
 * sans extraire ni heberger la moindre image de la video source.
 */
export function techniqueCard(t: CarteTechnique): string {
  const nom = echapper(t.nom.trim())
  const famille = echapper(t.famille.trim())
  const parent = echapper((t.parent ?? PARENT_DEFAUT).trim())
  const rang = t.ordre && t.total ? `${t.ordre}/${t.total}` : t.ordre ? `${t.ordre}` : ''

  // Le nom long doit rester lisible sur une vignette de 160 px.
  const taille = nom.length > 20 ? 15 : nom.length > 14 ? 18 : 22

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180">` +
    `<defs><linearGradient id="f" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="#1C1C1C"/><stop offset="1" stop-color="#0A0A0A"/>` +
    `</linearGradient></defs>` +
    `<rect width="320" height="180" fill="url(#f)"/>` +
    // Filet rouge Hazumi, a gauche
    `<rect x="0" y="0" width="4" height="180" fill="#C41230"/>` +
    // Parcours parent
    `<text x="24" y="42" font-family="system-ui,sans-serif" font-size="11" letter-spacing="2.5" ` +
    `fill="rgba(255,255,255,0.45)">${parent}</text>` +
    // Nom de la technique
    `<text x="24" y="96" font-family="system-ui,sans-serif" font-size="${taille}" font-weight="700" ` +
    `fill="#FFFFFF">${nom}</text>` +
    // Famille
    `<text x="24" y="126" font-family="system-ui,sans-serif" font-size="13" ` +
    `fill="rgba(255,255,255,0.7)">${famille}</text>` +
    // Rang dans la serie
    (rang
      ? `<text x="296" y="152" font-family="system-ui,sans-serif" font-size="12" letter-spacing="1" ` +
        `fill="rgba(255,255,255,0.4)" text-anchor="end">${rang}</text>`
      : '') +
    // Marqueur "sequence video"
    `<circle cx="34" cy="148" r="9" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="1.2"/>` +
    `<path d="M31 143.5 L39 148 L31 152.5 Z" fill="rgba(255,255,255,0.55)"/>` +
    `</svg>`

  return 'data:image/svg+xml,' + encodeURIComponent(svg)
}

/** Utilitaire de test : redonne le SVG d'une carte. */
export function decodeCard(dataUri: string): string {
  return decodeURIComponent(dataUri.replace(/^data:image\/svg\+xml,/, ''))
}
