export interface Segment {
  start: number | null
  end: number | null
}

export interface ValidationSegment {
  valide: boolean
  raison?: string
}

/** Accepte `mm:ss`, `hh:mm:ss` ou un nombre de secondes. Null si illisible. */
export function parseTimecode(valeur: string | number): number | null {
  if (typeof valeur === 'number') return Number.isFinite(valeur) && valeur >= 0 ? Math.floor(valeur) : null

  const propre = valeur.trim()
  if (!propre) return null

  if (/^\d+$/.test(propre)) return parseInt(propre, 10)

  const parts = propre.split(':')
  if (parts.length < 2 || parts.length > 3) return null
  if (!parts.every((p) => /^\d{1,2}$/.test(p))) return null

  const nombres = parts.map((p) => parseInt(p, 10))
  // Minutes et secondes restent sous 60 : "01:60" est une saisie fautive.
  if (nombres.slice(1).some((n) => n > 59)) return null

  return parts.length === 2
    ? nombres[0] * 60 + nombres[1]
    : nombres[0] * 3600 + nombres[1] * 60 + nombres[2]
}

export function formatTimecode(secondes: number): string {
  const s = Math.max(0, Math.floor(secondes))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export function validateSegment(
  start: number,
  end: number,
  dureeVideo: number | null
): ValidationSegment {
  if (start < 0) return { valide: false, raison: 'Le début ne peut pas être négatif.' }
  if (end <= start) return { valide: false, raison: 'La fin doit être postérieure au début.' }
  if (dureeVideo !== null && end > dureeVideo) {
    return { valide: false, raison: `La fin dépasse la durée de la vidéo (${formatTimecode(dureeVideo)}).` }
  }
  return { valide: true }
}

export function hasSegment(s: Segment): boolean {
  return s.start !== null && s.end !== null && s.end > s.start
}

export function segmentDuration(s: Segment): number | null {
  return hasSegment(s) ? s.end! - s.start! : null
}

export function segmentLabel(s: Segment): string {
  if (!hasSegment(s)) return ''
  return `${formatTimecode(s.start!)} → ${formatTimecode(s.end!)} · ${segmentDuration(s)} s`
}

/** Contrôle du seed : deux techniques ne doivent pas se chevaucher. */
export function detectOverlaps(segments: (Segment & { nom: string })[]): string[] {
  const complets = segments.filter(hasSegment).sort((a, b) => a.start! - b.start!)
  const conflits: string[] = []
  for (let i = 1; i < complets.length; i++) {
    const precedent = complets[i - 1]
    const courant = complets[i]
    if (courant.start! < precedent.end!) {
      conflits.push(
        `« ${precedent.nom} » (${segmentLabel(precedent)}) chevauche « ${courant.nom} » (${segmentLabel(courant)})`
      )
    }
  }
  return conflits
}
