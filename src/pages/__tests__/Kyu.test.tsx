import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Kyu from '../eleve/Kyu'

const h = vi.hoisted(() => ({
  store: {
    judokaId: 'judoka-1',
    userId: 'user-1',
    belt: 'jaune' as string,
    objectif: '',
    videos: [] as any[],
    playlists: [] as any[],
    catalogue: [] as any[],
    masteries: [] as any[],
  },
}))

vi.mock('../../lib/supabase', () => {
  const { store } = h
  function from(table: string) {
    let filters: Record<string, unknown> = {}
    let mode: 'select' | 'insert' | 'update' | 'upsert' = 'select'
    let payload: any = null
    let head = false
    const builder: any = {
      select: (_arg?: string, opts?: any) => {
        head = !!opts?.head
        return builder
      },
      eq: (col: string, val: unknown) => {
        filters[col] = val
        return builder
      },
      order: () => {
        if (table === 'videos') {
          const filtered = store.videos.filter((v) => Object.entries(filters).every(([k, val]) => v[k] === val))
          return Promise.resolve({ data: filtered, error: null })
        }
        if (table === 'playlists_collections') {
          const filtered = store.playlists.filter((p) => Object.entries(filters).every(([k, val]) => p[k] === val))
          return Promise.resolve({ data: filtered, error: null })
        }
        if (table === 'catalogue_hazumi') {
          const filtered = store.catalogue.filter((c) => Object.entries(filters).every(([k, val]) => c[k] === val))
          return Promise.resolve({ data: filtered, error: null })
        }
        return Promise.resolve({ data: null, error: null })
      },
      single: () => {
        if (table === 'judokas') {
          return Promise.resolve({
            data: { id: store.judokaId, belt: store.belt, objectif: store.objectif, parcours: 'judo-ka' },
            error: null,
          })
        }
        if (mode === 'insert') {
          const v = { id: 'v-' + (store.videos.length + 1), created_at: new Date().toISOString(), ...payload }
          store.videos.push(v)
          return Promise.resolve({ data: v, error: null })
        }
        return Promise.resolve({ data: null, error: null })
      },
      insert: (p: any) => {
        mode = 'insert'
        payload = p
        return builder
      },
      update: () => builder,
      delete: () => builder,
      upsert: () => Promise.resolve({ data: null, error: null }),
      then: (resolve: any) => {
        if (table === 'technique_mastery') {
          return resolve({ data: store.masteries, error: null })
        }
        if (head && table === 'catalogue_hazumi') {
          const count = store.catalogue.filter((c) => Object.entries(filters).every(([k, val]) => c[k] === val)).length
          return resolve({ count, data: null, error: null })
        }
        if (mode === 'insert' && table === 'videos') {
          const v = { id: 'v-' + (store.videos.length + 1), created_at: new Date().toISOString(), ...payload }
          store.videos.push(v)
          return resolve({ data: v, error: null })
        }
        return resolve({ data: null, error: null })
      },
    }
    return builder
  }
  return {
    supabase: {
      auth: { getUser: () => Promise.resolve({ data: { user: { id: h.store.userId } } }) },
      from,
    },
  }
})

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn()
})

beforeEach(() => {
  h.store.belt = 'jaune'
  h.store.objectif = ''
  h.store.videos = []
  h.store.playlists = []
  h.store.catalogue = []
  h.store.masteries = []
})

function renderPage() {
  return render(
    <MemoryRouter>
      <Kyu />
    </MemoryRouter>
  )
}

describe('Kyu (PersonalLibrary parcours=kyu + onglet Progression)', () => {
  it('la page se charge sans erreur', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Kyu')).toBeInTheDocument()
    })
  })

  it('les deux onglets sont présents', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Ma bibliothèque')).toBeInTheDocument()
      expect(screen.getByText('Ma progression')).toBeInTheDocument()
    })
  })

  it('le judoka peut ajouter du contenu', async () => {
    renderPage()
    await waitFor(() => screen.getByPlaceholderText('Titre'))
    await userEvent.type(screen.getByPlaceholderText('Titre'), 'Uchi-mata expliqué')
    await userEvent.type(screen.getByPlaceholderText('URL'), 'https://youtube.com/watch?v=abc12345678')
    await userEvent.click(screen.getByText('✓'))

    await waitFor(() => {
      expect(screen.getByText('Uchi-mata expliqué')).toBeInTheDocument()
    })
    expect(h.store.videos[0].parcours).toBe('kyu')
  })

  it('la section Contenu Hazumi est présente', async () => {
    h.store.catalogue = [
      { id: 'c1', titre: 'Fiche Kyu', type: 'article', parcours: 'kyu', contenu: 'texte', tags: [] },
    ]
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Contenu Hazumi')).toBeInTheDocument()
      expect(screen.getByText('Fiche Kyu')).toBeInTheDocument()
    })
  })

  it('le système de progression est intact (onglet Ma progression)', async () => {
    renderPage()
    await waitFor(() => screen.getByText('Ma progression'))
    await userEvent.click(screen.getByText('Ma progression'))

    await waitFor(() => {
      expect(screen.getByText(/acquis/)).toBeInTheDocument()
    })
    // La bibliothèque perso ne doit plus être visible dans cet onglet
    expect(screen.queryByPlaceholderText('Titre')).toBeNull()
  })
})
