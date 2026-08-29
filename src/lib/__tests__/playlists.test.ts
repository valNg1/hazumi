import { describe, it, expect, vi, beforeEach } from 'vitest'

// Régression issue #2 : les playlists créées (Bibliothèque / Mon Dojo) vivent dans
// `playlists_collections`. Le compteur d'accueil doit les remonter — et NON lire la
// table parallèle `playlists` (qui est vide pour ces utilisateurs).
const h = vi.hoisted(() => ({ counts: {} as Record<string, number>, lastFrom: '' }))
vi.mock('../supabase', () => ({
  supabase: {
    from: (t: string) => {
      h.lastFrom = t
      const chain: Record<string, unknown> = {
        select: () => chain,
        eq: () => Promise.resolve({ count: h.counts[t] ?? 0, error: null }),
      }
      return chain
    },
  },
}))
import { countPlaylists } from '../playlists'

describe('countPlaylists — issue #2', () => {
  beforeEach(() => { h.counts = {}; h.lastFrom = '' })

  it('compte les playlists depuis playlists_collections (2 créées → 2), pas depuis playlists', async () => {
    h.counts = { playlists_collections: 2, playlists: 0 }
    const n = await countPlaylists('judoka-1')
    expect(n).toBe(2)
    expect(h.lastFrom).toBe('playlists_collections')
  })

  it('retourne 0 quand le judoka n’a aucune playlist', async () => {
    h.counts = { playlists_collections: 0 }
    expect(await countPlaylists('judoka-1')).toBe(0)
  })
})
