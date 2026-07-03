import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Messages from '../../pages/eleve/Messages'
import Layout from '../Layout'

const h = vi.hoisted(() => ({
  store: {
    messages: [] as any[],
    judokaId: 'judoka-1',
    userId: 'user-1',
    channels: [] as any[],
    emitInsert(msg: any) {
      for (const c of this.channels) c.cb({ new: msg })
    },
  },
}))

vi.mock('../../lib/supabase', () => {
  const { store } = h
  function from(table: string) {
    let mode: 'select' | 'insert' = 'select'
    let payload: any = null
    const builder: any = {
      select: () => builder,
      eq: () => builder,
      is: () => builder,
      order: () =>
        Promise.resolve({ data: table === 'messages' ? [...store.messages] : null, error: null }),
      single: () => {
        if (table === 'judokas') return Promise.resolve({ data: { id: store.judokaId }, error: null })
        if (mode === 'insert') {
          const m = {
            id: 'm-' + (store.messages.length + 1),
            created_at: new Date().toISOString(),
            read_at: null,
            ...payload,
          }
          store.messages.push(m)
          return Promise.resolve({ data: m, error: null })
        }
        return Promise.resolve({ data: null, error: null })
      },
      insert: (p: any) => {
        mode = 'insert'
        payload = p
        return builder
      },
      update: () => builder,
      then: (resolve: any) => resolve({ data: null, error: null }),
    }
    return builder
  }
  function channel() {
    const chan: any = {
      on: (_evt: string, _opts: any, cb: any) => {
        store.channels.push({ cb })
        return chan
      },
      subscribe: () => chan,
    }
    return chan
  }
  return {
    supabase: {
      auth: { getUser: () => Promise.resolve({ data: { user: { id: h.store.userId } } }) },
      from,
      channel,
      removeChannel: () => {},
    },
  }
})

function renderPage() {
  return render(
    <MemoryRouter>
      <Messages />
    </MemoryRouter>
  )
}

beforeAll(() => {
  // jsdom n'implémente pas scrollIntoView
  Element.prototype.scrollIntoView = vi.fn()
})

beforeEach(() => {
  h.store.messages = []
  h.store.channels = []
})

describe('Messages (chat judoka)', () => {
  it('la page /eleve/messages se charge sans erreur', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /envoyer/i })).toBeInTheDocument()
    })
  })

  it('un judoka voit ses propres messages', async () => {
    h.store.messages = [
      { id: 'a1', judoka_id: 'judoka-1', sender: 'admin', content: 'Bienvenue au dojo', created_at: '2026-07-01T10:00:00Z', read_at: null },
      { id: 'j1', judoka_id: 'judoka-1', sender: 'judoka', content: 'Merci sensei', created_at: '2026-07-01T11:00:00Z', read_at: null },
    ]
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Bienvenue au dojo')).toBeInTheDocument()
      expect(screen.getByText('Merci sensei')).toBeInTheDocument()
    })
  })

  it('le champ de saisie est présent', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/message/i)).toBeInTheDocument()
    })
  })

  it('le bouton Envoyer est désactivé si le champ est vide', async () => {
    renderPage()
    const btn = await screen.findByRole('button', { name: /envoyer/i })
    expect(btn).toBeDisabled()

    const input = screen.getByPlaceholderText(/message/i)
    await userEvent.type(input, 'Coucou')
    expect(btn).toBeEnabled()
  })

  it('un message envoyé apparaît dans la liste', async () => {
    renderPage()
    const input = await screen.findByPlaceholderText(/message/i)
    await userEvent.type(input, 'Nouveau message test')
    await userEvent.click(screen.getByRole('button', { name: /envoyer/i }))

    await waitFor(() => {
      expect(screen.getByText('Nouveau message test')).toBeInTheDocument()
    })
    // champ vidé après envoi
    expect((input as HTMLInputElement).value).toBe('')
  })

  it('un nouveau message reçu apparaît sans recharger la page (Realtime)', async () => {
    renderPage()
    await screen.findByRole('button', { name: /envoyer/i })

    // simulation d'un message admin poussé par Supabase Realtime
    h.store.emitInsert({
      id: 'rt-1',
      judoka_id: 'judoka-1',
      sender: 'admin',
      content: 'Réponse en temps réel',
      created_at: new Date().toISOString(),
      read_at: null,
    })

    await waitFor(() => {
      expect(screen.getByText('Réponse en temps réel')).toBeInTheDocument()
    })
  })
})

describe('Badge non-lus judoka (Layout, Realtime)', () => {
  it('le badge de non-lus se met à jour en temps réel', async () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    )
    // aucun badge au départ
    await waitFor(() => {
      expect(h.store.channels.length).toBeGreaterThan(0)
    })

    h.store.emitInsert({
      id: 'rt-2',
      judoka_id: 'judoka-1',
      sender: 'admin',
      content: 'Nouveau',
      created_at: new Date().toISOString(),
      read_at: null,
    })

    await waitFor(() => {
      expect(screen.getAllByText('1').length).toBeGreaterThan(0)
    })
  })
})
