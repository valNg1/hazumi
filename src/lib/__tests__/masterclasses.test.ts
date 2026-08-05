import { describe, it, expect, vi, beforeEach } from 'vitest'
import { parseMasterclassChapters } from '../masterclasses'

const h = vi.hoisted(() => ({ rows: [] as unknown[], error: null as unknown }))
vi.mock('../supabase', () => {
  const chain: Record<string, unknown> = {
    select: () => chain,
    eq: () => chain,
    order: () => Promise.resolve({ data: h.rows, error: h.error }),
    maybeSingle: () => Promise.resolve({ data: h.rows[0] ?? null, error: h.error }),
  }
  return { supabase: { from: () => chain } }
})
import { fetchPublishedMasterclasses, fetchMasterclassBySlug } from '../masterclasses'

describe('parseMasterclassChapters', () => {
  it('extrait les chapitres « ## MM:SS — Titre » (titre avec tiret conservé)', () => {
    const md = '# Video chapters\n\n## 00:00 — Introduction — la position\n\n### sous-section\ntexte\n\n## 01:23 — Autre chapitre\n\ntexte'
    const c = parseMasterclassChapters(md)
    expect(c).toHaveLength(2)
    expect(c[0]).toEqual({ label: 'Introduction — la position', seconds: 0 })
    expect(c[1]).toEqual({ label: 'Autre chapitre', seconds: 83 })
  })

  it('gère HH:MM:SS et ignore les ## sans horodatage et les ###', () => {
    const md = '## 1:02:03 — Long\n## Sans horodatage\n### 00:10 — pas un h2'
    const c = parseMasterclassChapters(md)
    expect(c).toHaveLength(1)
    expect(c[0]).toEqual({ label: 'Long', seconds: 3723 })
  })

  it('renvoie [] quand il n’y a pas de chapitre horodaté', () => {
    expect(parseMasterclassChapters('')).toEqual([])
    expect(parseMasterclassChapters('juste du texte')).toEqual([])
  })
})

describe('fetch masterclasses', () => {
  beforeEach(() => { h.rows = []; h.error = null })

  it('retourne les masterclasses publiées', async () => {
    h.rows = [{ id: '1', titre: 'A', slug: 'a', youtube_url: 'x', contenu: 'md', published: true, created_at: '' }]
    const r = await fetchPublishedMasterclasses()
    expect(r).toHaveLength(1)
    expect(r[0].slug).toBe('a')
  })

  it('retourne [] si la table est absente (erreur)', async () => {
    h.error = { message: 'relation "masterclass" does not exist' }
    expect(await fetchPublishedMasterclasses()).toEqual([])
  })

  it('fetchMasterclassBySlug retourne la ligne ou null', async () => {
    h.rows = [{ id: '1', titre: 'A', slug: 'a', youtube_url: 'x', contenu: 'md', published: true, created_at: '' }]
    expect((await fetchMasterclassBySlug('a'))?.slug).toBe('a')
    h.rows = []
    expect(await fetchMasterclassBySlug('none')).toBeNull()
  })
})
