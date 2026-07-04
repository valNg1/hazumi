import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import JudoKa from '../eleve/JudoKa'

const h = vi.hoisted(() => ({
  store: {
    judokaId: 'judoka-1',
    userId: 'user-1',
    videos: [] as any[],
    playlists: [] as any[],
    catalogue: [] as any[],
  },
}))

vi.mock('../../lib/supabase', () => {
  const { store } = h
  function from(table: string) {
    let filters: Record<string, unknown> = {}
    let mode: 'select' | 'insert' | 'update' = 'select'
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
        if (table === 'judokas') return Promise.resolve({ data: { id: store.judokaId }, error: null })
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
      then: (resolve: any) => {
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
  h.store.videos = []
  h.store.playlists = []
  h.store.catalogue = []
})

function renderPage() {
  return render(
    <MemoryRouter>
      <JudoKa />
    </MemoryRouter>
  )
}

describe('JudoKa (PersonalLibrary parcours=judo-ka)', () => {
  it('la page se charge sans erreur', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Judo-Ka')).toBeInTheDocument()
    })
  })

  it('le judoka peut ajouter une vidéo', async () => {
    renderPage()
    await waitFor(() => screen.getByPlaceholderText('Titre'))
    await userEvent.type(screen.getByPlaceholderText('Titre'), 'Histoire du judo')
    await userEvent.type(screen.getByPlaceholderText('URL'), 'https://youtube.com/watch?v=abc12345678')
    await userEvent.click(screen.getByText('✓'))

    await waitFor(() => {
      expect(screen.getByText('Histoire du judo')).toBeInTheDocument()
    })
    const inserted = h.store.videos[0]
    expect(inserted.parcours).toBe('judo-ka')
  })

  it('le filtrage par tag fonctionne', async () => {
    h.store.videos = [
      { id: 'v1', title: 'Vidéo Kata', video_url: 'https://youtube.com/watch?v=aaaaaaaaaaa', tags: 'kata', parcours: 'judo-ka', uploaded_by: 'user-1' },
      { id: 'v2', title: 'Vidéo Histoire', video_url: 'https://youtube.com/watch?v=bbbbbbbbbbb', tags: 'histoire', parcours: 'judo-ka', uploaded_by: 'user-1' },
    ]
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Vidéo Kata')).toBeInTheDocument()
      expect(screen.getByText('Vidéo Histoire')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: 'kata' }))

    await waitFor(() => {
      expect(screen.getByText('Vidéo Kata')).toBeInTheDocument()
      expect(screen.queryByText('Vidéo Histoire')).toBeNull()
    })
  })

  it('la section Contenu Hazumi est présente', async () => {
    h.store.catalogue = [
      { id: 'c1', titre: 'Article Judo-Ka', type: 'article', parcours: 'judo-ka', contenu: 'texte', tags: [] },
    ]
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Contenu Hazumi')).toBeInTheDocument()
      expect(screen.getByText('Article Judo-Ka')).toBeInTheDocument()
    })
  })
})
