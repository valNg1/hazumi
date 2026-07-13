export function getYoutubeId(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/)
  return m?.[1] ?? null
}

export function youtubeEmbedUrl(url: string, startSeconds?: number): string {
  const id = getYoutubeId(url)
  if (!id) return url
  const params = new URLSearchParams({ rel: '0', modestbranding: '1' })
  if (startSeconds && startSeconds > 0) {
    params.set('start', String(Math.floor(startSeconds)))
    params.set('autoplay', '1')
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
