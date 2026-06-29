export type VideoType = 'youtube' | 'vimeo' | 'instagram' | 'gdrive' | 'facebook' | 'tiktok' | 'direct'

export function detectVideoType(url: string): VideoType {
  if (/youtube\.com|youtu\.be/.test(url)) return 'youtube'
  if (/vimeo\.com/.test(url)) return 'vimeo'
  if (/instagram\.com/.test(url)) return 'instagram'
  if (/drive\.google\.com/.test(url)) return 'gdrive'
  if (/facebook\.com|fb\.watch/.test(url)) return 'facebook'
  if (/tiktok\.com/.test(url)) return 'tiktok'
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

  if (type === 'instagram') {
    const match = url.match(/instagram\.com\/(?:p|reel)\/([a-zA-Z0-9_-]+)/)
    const id = match?.[1]
    return id ? `https://www.instagram.com/p/${id}/embed/` : url
  }

  if (type === 'gdrive') {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
    const id = match?.[1]
    return id ? `https://drive.google.com/file/d/${id}/preview` : url
  }

  if (type === 'facebook') {
    return url
  }

  if (type === 'tiktok') {
    return url
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
  if (type === 'gdrive') {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
    const id = match?.[1]
    return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w320` : null
  }
  return null
}

export function getVideoLabel(url: string): string {
  const type = detectVideoType(url)
  if (type === 'youtube') return 'YouTube'
  if (type === 'vimeo') return 'Vimeo'
  if (type === 'instagram') return 'Instagram'
  if (type === 'gdrive') return 'Google Drive'
  if (type === 'facebook') return 'Facebook'
  if (type === 'tiktok') return 'TikTok'
  return 'Vidéo directe'
}
