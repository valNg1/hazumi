export type VideoType = 'youtube' | 'vimeo' | 'gdrive' | 'direct'

export function detectVideoType(url: string): VideoType {
  if (/youtube\.com|youtu\.be/.test(url)) return 'youtube'
  if (/vimeo\.com/.test(url)) return 'vimeo'
  if (/drive\.google\.com/.test(url)) return 'gdrive'
  return 'direct'
}

export function getEmbedUrl(url: string): string {
  const type = detectVideoType(url)

  if (type === 'youtube') {
    const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    const id = match?.[1]
    return id ? `https://www.youtube.com/embed/${id}` : url
  }

  if (type === 'vimeo') {
    const match = url.match(/vimeo\.com\/(\d+)/)
    const id = match?.[1]
    return id ? `https://player.vimeo.com/video/${id}` : url
  }

  if (type === 'gdrive') {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
    const id = match?.[1]
    return id ? `https://drive.google.com/file/d/${id}/preview` : url
  }

  return url
}

export function getThumbnailUrl(url: string): string | null {
  const type = detectVideoType(url)
  if (type === 'youtube') {
    const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    const id = match?.[1]
    return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null
  }
  return null
}

export function getVideoLabel(url: string): string {
  const type = detectVideoType(url)
  if (type === 'youtube') return 'YouTube'
  if (type === 'vimeo') return 'Vimeo'
  if (type === 'gdrive') return 'Google Drive'
  return 'Vidéo directe'
}
