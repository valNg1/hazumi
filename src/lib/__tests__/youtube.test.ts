import { describe, it, expect } from 'vitest'
import { getYoutubeId, youtubeEmbedUrl, formatTimestamp } from '../youtube'

describe('getYoutubeId', () => {
  it('extrait l’id des differents formats d’URL YouTube', () => {
    expect(getYoutubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(getYoutubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(getYoutubeId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(getYoutubeId('https://youtube.com/watch?v=dQw4w9WgXcQ&t=42s')).toBe('dQw4w9WgXcQ')
  })
  it('renvoie null si pas d’id', () => {
    expect(getYoutubeId('https://example.com/video')).toBeNull()
  })
})

describe('youtubeEmbedUrl', () => {
  it('construit une URL embed sans autoplay par defaut', () => {
    const url = youtubeEmbedUrl('https://youtu.be/dQw4w9WgXcQ')
    expect(url).toContain('https://www.youtube.com/embed/dQw4w9WgXcQ')
    expect(url).not.toContain('autoplay=1')
  })
  it('ajoute start et autoplay lors d’un saut au chapitre', () => {
    const url = youtubeEmbedUrl('https://youtu.be/dQw4w9WgXcQ', 90)
    expect(url).toContain('start=90')
    expect(url).toContain('autoplay=1')
  })
})

describe('formatTimestamp', () => {
  it('formate secondes en m:ss et h:mm:ss', () => {
    expect(formatTimestamp(5)).toBe('0:05')
    expect(formatTimestamp(90)).toBe('1:30')
    expect(formatTimestamp(3661)).toBe('1:01:01')
  })
})
