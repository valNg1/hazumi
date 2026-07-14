export interface ParsedChapter {
  ordre: number
  titre: string
  timestamp_seconds: number
}

// Convertit une liste de repères "M:SS Titre" / "H:MM:SS Titre" (le format que
// YouTube utilise dans la description pour generer ses chapitres) en chapitres
// exacts. On n'invente jamais de timestamp : ils viennent de la video elle-meme.
export function parseTimestampChapters(text: string): ParsedChapter[] {
  const out: ParsedChapter[] = []
  for (const line of (text ?? '').split('\n')) {
    const m = line.match(/^\s*(?:(\d{1,2}):)?(\d{1,2}):(\d{2})\s*[-–—).]?\s*(.+?)\s*$/)
    if (!m) continue
    const h = m[1] ? parseInt(m[1], 10) : 0
    const mm = parseInt(m[2], 10)
    const ss = parseInt(m[3], 10)
    if (ss > 59) continue
    const titre = m[4].trim()
    if (!titre) continue
    out.push({ ordre: out.length + 1, titre, timestamp_seconds: h * 3600 + mm * 60 + ss })
  }
  return out
}
