export function getYoutubeId(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/)
  return m?.[1] ?? null
}

/**
 * URL d'integration. Avec `endSeconds`, le lecteur s'arrete a la fin du segment.
 * Attention : YouTube stoppe la lecture, mais ne verrouille pas la barre de
 * progression — une relance manuelle peut depasser la borne.
 */
export function youtubeEmbedUrl(url: string, startSeconds?: number, endSeconds?: number): string {
  const id = getYoutubeId(url)
  if (!id) return url
  const params = new URLSearchParams({ rel: '0', modestbranding: '1' })
  const debut = startSeconds && startSeconds > 0 ? Math.floor(startSeconds) : null
  if (debut !== null) {
    params.set('start', String(debut))
    params.set('autoplay', '1')
  }
  if (endSeconds && endSeconds > 0 && (debut === null || endSeconds > debut)) {
    params.set('end', String(Math.floor(endSeconds)))
  }
  return `https://www.youtube.com/embed/${id}?${params.toString()}`
}

export function formatTimestamp(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return `${m}:${String(sec).padStart(2, '0')}`
}
