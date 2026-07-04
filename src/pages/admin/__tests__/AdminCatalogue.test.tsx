import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import AdminCatalogue from '../Catalogue'

const h = vi.hoisted(() => ({
  store: {
    role: 'admin' as string,
    items: [] as any[],
  },
}))

vi.mock('../../../lib/supabase', () => {
  const { store } = h
  function from(table: string) {
    let mode: 'select' | 'insert' = 'select'
    let payload: any = null
    let filters: Record<string, unknown> = {}
    const builder: any = {
      select: () => builder,
      eq: (col: string, val: unknown) => {
        filters[col] = val
        return builder
      },
      order: () => {
        if (table === 'catalogue_hazumi') {
          const filtered = store.items.filter((it) =>
            Object.entries(filters).every(([k, v]) => it[k] === v)
          )
          return Promise.resolve({ data: filtered, error: null })
        }
        return Promise.resolve({ data: null, error: null })
      },
      single: () => {
        if (table === 'judokas') return Promise.resolve({ data: { role: store.role }, error: null })
        if (mode === 'insert') {
          if (!payload.titre || !String(payload.titre).trim()) {
            return Promise.resolve({ data: null, error: { message: 'titre requis' } })
          }
          const item = { id: 'c-' + (store.items.length + 1), created_at: new Date().toISOString(), ...payload }
          store.items.push(item)
          return Promise.resolve({ data: item, error: null })
        }
        return Promise.resolve({ data: null, error: null })
      },
      insert: (p: any) => {
        mode = 'insert'
        payload = p
        return builder
      },
      delete: () => builder,
    }
    return builder
  }
  return {
    supabase: {
      auth: { getUser: () => Promise.resolve({ data: { user: { id: 'admin-user' } } }) },
      from,
    },
  }
})

beforeEach(() => {
  h.store.role = 'admin'
  h.store.items = []
})

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminCatalogue />
    </MemoryRouter>
  )
}

describe('AdminCatalogue', () => {
  it("l'admin peut ajouter un contenu vidéo", async () => {
    renderPage()
    await userEvent.click(await screen.findByRole('button', { name: /ajouter du contenu/i }))
    await userEvent.type(screen.getByLabelText(/titre/i), 'Ippon seoi nage')
    await userEvent.selectOptions(screen.getByLabelText(/^type/i), 'video')
    await userEvent.type(screen.getByLabelText(/url/i), 'https://youtube.com/watch?v=abc12345678')
    await userEvent.click(screen.getByRole('button', { name: /enregistrer/i }))

    await waitFor(() => {
      expect(screen.getByText('Ippon seoi nage')).toBeInTheDocument()
    })
  })

  it('un article texte', async () => {
    renderPage()
    await userEvent.click(await screen.findByRole('button', { name: /ajouter du contenu/i }))
    await userEvent.type(screen.getByLabelText(/titre/i), 'Histoire du judo')
    await userEvent.selectOptions(screen.getByLabelText(/^type/i), 'article')
    await userEvent.type(screen.getByLabelText(/contenu/i), 'Texte de l\'article')
    await userEvent.click(screen.getByRole('button', { name: /enregistrer/i }))

    await waitFor(() => {
      expect(screen.getByText('Histoire du judo')).toBeInTheDocument()
    })
  })

  it('un PDF', async () => {
    renderPage()
    await userEvent.click(await screen.findByRole('button', { name: /ajouter du contenu/i }))
    await userEvent.type(screen.getByLabelText(/titre/i), 'Fiche Kyu')
    await userEvent.selectOptions(screen.getByLabelText(/^type/i), 'pdf')
    await userEvent.type(screen.getByLabelText(/url/i), 'https://example.com/fiche.pdf')
    await userEvent.click(screen.getByRole('button', { name: /enregistrer/i }))

    await waitFor(() => {
      expect(screen.getByText('Fiche Kyu')).toBeInTheDocument()
    })
  })

  it('un contenu sans titre est rejeté', async () => {
    renderPage()
    await userEvent.click(await screen.findByRole('button', { name: /ajouter du contenu/i }))
    await userEvent.selectOptions(screen.getByLabelText(/^type/i), 'article')
    await userEvent.type(screen.getByLabelText(/contenu/i), 'Texte sans titre')
    const submit = screen.getByRole('button', { name: /enregistrer/i })
    expect(submit).toBeDisabled()
  })

  it('les contenus sont filtrables par parcours', async () => {
    h.store.items = [
      { id: '1', titre: 'Shiai video', type: 'video', parcours: 'shiai', url: 'https://x.com/1', tags: [] },
      { id: '2', titre: 'Kyu article', type: 'article', parcours: 'kyu', contenu: 'x', tags: [] },
    ]
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Shiai video')).toBeInTheDocument()
      expect(screen.getByText('Kyu article')).toBeInTheDocument()
    })

    await userEvent.selectOptions(screen.getByLabelText(/filtrer par parcours/i), 'shiai')

    await waitFor(() => {
      expect(screen.getByText('Shiai video')).toBeInTheDocument()
      expect(screen.queryByText('Kyu article')).toBeNull()
    })
  })
})
