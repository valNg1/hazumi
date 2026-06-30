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
  if (type === 'vimeo') {
    const match = url.match(/vimeo\.com\/(\d+)/)
    const id = match?.[1]
    return id ? `https://vimeo.com/api/v2/video/${id}.json` : null
  }
  if (type === 'instagram') {
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23E1306C" width="100" height="100"/%3E%3Ccircle cx="50" cy="50" r="20" fill="none" stroke="white" stroke-width="3"/%3E%3Ccircle cx="70" cy="30" r="3" fill="white"/%3E%3C/svg%3E'
  }
  if (type === 'gdrive') {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
    const id = match?.[1]
    return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w320` : null
  }
  if (type === 'facebook') {
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%231877F2" width="100" height="100"/%3E%3Ctext x="50" y="50" font-size="60" fill="white" text-anchor="middle" dominant-baseline="middle" font-weight="bold"%3Ef%3C/text%3E%3C/svg%3E'
  }
  if (type === 'tiktok') {
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23000000" width="100" height="100"/%3E%3Cpath d="M50 20 L60 35 L50 40 L40 35 Z" fill="%2325F4EE"/%3E%3Cpath d="M50 50 L60 65 L50 70 L40 65 Z" fill="%25FE2C55"/%3E%3C/svg%3E'
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
