import { describe, it, expect } from 'vitest'
import { resolveThumbnail, buildPlaylistCover, isPlaceholder } from '../thumbnails'

const YT = 'https://youtu.be/wUGhhF8d8W4?si=abc'
const YT2 = 'https://www.youtube.com/watch?v=bkhBZzE2HpM'
const DRIVE = 'https://drive.google.com/file/d/1abcDEF/view'
const DOC = 'https://docs.google.com/document/d/1VQcDQHQvzz8nEYQKK5NLxnkcRFi3-dM4PGpK4mkmFoE/edit?usp=sharing'
const VIMEO = 'https://vimeo.com/123456789'

describe('resolveThumbnail — chaine de secours', () => {
  it('utilise la vignette explicite en priorite absolue', () => {
    expect(resolveThumbnail({ titre: 'X', thumbnailUrl: 'https://exemple/img.jpg', url: YT })).toBe('https://exemple/img.jpg')
  })

  it('derive la vignette de l’URL de la ressource', () => {
    expect(resolveThumbnail({ titre: 'X', url: YT })).toBe('https://img.youtube.com/vi/wUGhhF8d8W4/mqdefault.jpg')
  })

  // Cause racine Nage-no-kata : la video vit sur la lecon, pas sur la ressource.
  it('retombe sur la video de la lecon quand la ressource n’a pas d’URL', () => {
    expect(resolveThumbnail({ titre: 'Nage-no-kata', url: null, lessonVideoUrl: YT2 }))
      .toBe('https://img.youtube.com/vi/bkhBZzE2HpM/mqdefault.jpg')
  })

  // Cause racine "Judo, la voie de la souplesse" : un Google Doc n'etait pas reconnu.
  it('reconnait un document Google Docs', () => {
    const t = resolveThumbnail({ titre: 'Judô', url: DOC })
    expect(t).toContain('drive.google.com/thumbnail')
    expect(t).toContain('1VQcDQHQvzz8nEYQKK5NLxnkcRFi3-dM4PGpK4mkmFoE')
  })

  it('gere Google Drive', () => {
    expect(resolveThumbnail({ titre: 'X', url: DRIVE })).toContain('drive.google.com/thumbnail')
  })

  // Bug latent : l'ancien code renvoyait une URL d'API JSON utilisee comme image.
  it('renvoie une image pour Vimeo, jamais une URL d’API JSON', () => {
    const t = resolveThumbnail({ titre: 'X', url: VIMEO })
    expect(t).not.toMatch(/\.json$/)
    expect(t).toMatch(/\.(jpg|jpeg|png)$/)
  })

  it('ne renvoie jamais null : une vignette generee sert de dernier recours', () => {
    const t = resolveThumbnail({ titre: 'Une fiche sans URL', url: null })
    expect(t).toBeTruthy()
    expect(isPlaceholder(t)).toBe(true)
  })

  it('la vignette generee est deterministe pour un meme titre', () => {
    const a = resolveThumbnail({ titre: 'Nage-no-kata', url: null })
    const b = resolveThumbnail({ titre: 'Nage-no-kata', url: null })
    expect(a).toBe(b)
  })

  it('la vignette generee differe selon le titre', () => {
    const a = resolveThumbnail({ titre: 'Uchi-mata', url: null })
    const b = resolveThumbnail({ titre: 'Harai-goshi', url: null })
    expect(a).not.toBe(b)
  })

  it('ignore une URL vide ou invalide et retombe sur le dernier recours', () => {
    expect(isPlaceholder(resolveThumbnail({ titre: 'X', url: '' }))).toBe(true)
    expect(isPlaceholder(resolveThumbnail({ titre: 'X', url: 'pas-une-url' }))).toBe(true)
  })

  it('isPlaceholder distingue une vraie vignette', () => {
    expect(isPlaceholder('https://img.youtube.com/vi/abc/mqdefault.jpg')).toBe(false)
  })
})

describe('buildPlaylistCover — couverture automatique', () => {
  const t = (n: number) => Array.from({ length: n }, (_, i) => `https://img/${i}.jpg`)

  it('1 video : une seule vignette', () => {
    const c = buildPlaylistCover(t(1))
    expect(c.disposition).toBe('unique')
    expect(c.vignettes).toHaveLength(1)
  })

  it('2 videos : les deux vignettes', () => {
    const c = buildPlaylistCover(t(2))
    expect(c.disposition).toBe('duo')
    expect(c.vignettes).toHaveLength(2)
  })

  it('3 ressources ou plus : mosaique de 4 cases', () => {
    const c = buildPlaylistCover(t(3))
    expect(c.disposition).toBe('mosaique')
    expect(c.vignettes).toHaveLength(4)
  })

  it('la mosaique complete en repetant les vignettes disponibles', () => {
    expect(buildPlaylistCover(t(3)).vignettes).toEqual([
      'https://img/0.jpg', 'https://img/1.jpg', 'https://img/2.jpg', 'https://img/0.jpg',
    ])
  })

  it('ne retient que les 4 premieres au-dela', () => {
    const c = buildPlaylistCover(t(10))
    expect(c.vignettes).toEqual(['https://img/0.jpg', 'https://img/1.jpg', 'https://img/2.jpg', 'https://img/3.jpg'])
  })

  it('playlist vide : disposition vide, aucune vignette', () => {
    const c = buildPlaylistCover([])
    expect(c.disposition).toBe('vide')
    expect(c.vignettes).toEqual([])
  })

  it('ecarte les entrees vides', () => {
    const c = buildPlaylistCover(['', 'https://img/1.jpg', ''])
    expect(c.disposition).toBe('unique')
    expect(c.vignettes).toEqual(['https://img/1.jpg'])
  })
})
