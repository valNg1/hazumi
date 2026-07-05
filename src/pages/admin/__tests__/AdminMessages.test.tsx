import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import AdminMessagesList from '../MessagesList'
import AdminMessages from '../Messages'

const h = vi.hoisted(() => ({
  store: {
    userId: 'admin-user',
    role: 'admin' as string,
    judoka: { id: 'j1', first_name: 'Ken', last_name: 'Judo', email: 'ken@test.fr' },
    messages: [] as any[],
    channels: [] as any[],
    emitInsert(msg: any) {
      for (const c of this.channels) c.cb({ new: msg })
    },
  },
}))

vi.mock('../../../lib/supabase', () => {
  const { store } = h
  function from(table: string) {
    let selectArg = ''
    let mode: 'select' | 'insert' = 'select'
    let payload: any = null
    const builder: any = {
      select: (arg?: string) => {
        selectArg = arg ?? ''
        return builder
      },
      eq: () => builder,
      is: () => builder,
      order: () =>
        Promise.resolve({ data: table === 'messages' ? [...store.messages] : null, error: null }),
      single: () => {
        if (table === 'judokas') {
          if (selectArg.includes('role')) return Promise.resolve({ data: { role: store.role }, error: null })
          return Promise.resolve({ data: store.judoka, error: null })
        }
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

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn()
})

beforeEach(() => {
  h.store.role = 'admin'
  h.store.messages = []
  h.store.channels = []
})

function renderList() {
  return render(
    <MemoryRouter>
      <AdminMessagesList />
    </MemoryRouter>
  )
}

function renderThread() {
  return render(
    <MemoryRouter initialEntries={['/admin/messages/j1']}>
      <Routes>
        <Route path="/admin/messages/:judokaId" element={<AdminMessages />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('AdminMessagesList (liste des fils)', () => {
  it('la liste des judokas ayant des messages s\'affiche', async () => {
    h.store.messages = [
      { id: 'a', judoka_id: 'j1', sender: 'judoka', content: 'Bonjour admin', created_at: '2026-07-01T10:00:00Z', read_at: '2026-07-01T10:05:00Z', judokas: h.store.judoka },
    ]
    renderList()
    await waitFor(() => {
      expect(screen.getByText(/Ken Judo/)).toBeInTheDocument()
      expect(screen.getByText(/Bonjour admin/)).toBeInTheDocument()
    })
  })

  it('un badge rouge indique le nombre de messages non lus par judoka', async () => {
    h.store.messages = [
      { id: 'a', judoka_id: 'j1', sender: 'judoka', content: 'Message 1', created_at: '2026-07-01T10:00:00Z', read_at: null, judokas: h.store.judoka },
      { id: 'b', judoka_id: 'j1', sender: 'judoka', content: 'Message 2', created_at: '2026-07-01T11:00:00Z', read_at: null, judokas: h.store.judoka },
    ]
    renderList()
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument()
    })
  })
})

describe('AdminMessages (fil d\'un judoka)', () => {
  it('l\'admin peut voir le fil d\'un judoka', async () => {
    h.store.messages = [
      { id: 'a', judoka_id: 'j1', sender: 'judoka', content: 'Une question', created_at: '2026-07-01T10:00:00Z', read_at: null },
    ]
    renderThread()
    await waitFor(() => {
      expect(screen.getByText('Une question')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /envoyer/i })).toBeInTheDocument()
    })
  })

  it('l\'admin peut envoyer une réponse et le fil se met à jour', async () => {
    h.store.messages = [
      { id: 'a', judoka_id: 'j1', sender: 'judoka', content: 'Une question', created_at: '2026-07-01T10:00:00Z', read_at: null },
    ]
    renderThread()
    const input = await screen.findByPlaceholderText(/message/i)
    await userEvent.type(input, 'Bien reçu, à bientôt')
    await userEvent.click(screen.getByRole('button', { name: /envoyer/i }))

    await waitFor(() => {
      expect(screen.getByText('Bien reçu, à bientôt')).toBeInTheDocument()
    })
    expect((input as HTMLInputElement).value).toBe('')
    // la réponse insérée l'est bien avec sender='admin'
    const last = h.store.messages[h.store.messages.length - 1]
    expect(last.sender).toBe('admin')
    expect(last.content).toBe('Bien reçu, à bientôt')
  })

  it('un nouveau message reçu apparaît sans recharger la page (Realtime)', async () => {
    h.store.messages = [
      { id: 'a', judoka_id: 'j1', sender: 'admin', content: 'Bonjour', created_at: '2026-07-01T10:00:00Z', read_at: null },
    ]
    renderThread()
    await screen.findByRole('button', { name: /envoyer/i })

    h.store.emitInsert({
      id: 'rt-j1',
      judoka_id: 'j1',
      sender: 'judoka',
      content: 'Réponse temps réel du judoka',
      created_at: new Date().toISOString(),
      read_at: null,
    })

    await waitFor(() => {
      expect(screen.getByText('Réponse temps réel du judoka')).toBeInTheDocument()
    })
  })
})
