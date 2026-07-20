import { describe, it, expect } from 'vitest'
import { youtubeEmbedUrl } from '../youtube'

const URL = 'https://www.youtube.com/watch?v=bkhBZzE2HpM'

describe('youtubeEmbedUrl — lecture d’un segment', () => {
  it('reste retrocompatible sans bornes', () => {
    const u = youtubeEmbedUrl(URL)
    expect(u).toContain('/embed/bkhBZzE2HpM')
    expect(u).not.toContain('start=')
    expect(u).not.toContain('end=')
  })

  it('accepte un debut seul, comme avant', () => {
    const u = youtubeEmbedUrl(URL, 80)
    expect(u).toContain('start=80')
    expect(u).not.toContain('end=')
  })

  it('accepte un debut et une fin', () => {
    const u = youtubeEmbedUrl(URL, 80, 113)
    expect(u).toContain('start=80')
    expect(u).toContain('end=113')
  })

  it('accepte une fin sans debut', () => {
    expect(youtubeEmbedUrl(URL, undefined, 113)).toContain('end=113')
  })

  it('arrondit les bornes fractionnaires', () => {
    const u = youtubeEmbedUrl(URL, 80.7, 113.2)
    expect(u).toContain('start=80')
    expect(u).toContain('end=113')
  })

  it('ignore une fin anterieure au debut', () => {
    const u = youtubeEmbedUrl(URL, 113, 80)
    expect(u).toContain('start=113')
    expect(u).not.toContain('end=')
  })

  it('renvoie l’URL telle quelle si l’identifiant est introuvable', () => {
    expect(youtubeEmbedUrl('https://exemple.com/video', 10, 20)).toBe('https://exemple.com/video')
  })
})
