import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Messagerie from '../Messagerie'
import MessagerieThread from '../MessagerieThread'
import * as hookModule from '../../../hooks/useUnreadConversations'

vi.mock('../../../hooks/useUnreadConversations')

const navigateMock = vi.hoisted(() => vi.fn())
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => navigateMock }
})

const h = vi.hoisted(() => ({
  store: {
    adminUserId: 'admin-user',
    adminJudokaId: 'admin-j1',
    role: 'admin' as string,
    judokas: [] as any[],
    conversations: [] as any[],
    participants: [] as any[],
    messages: [] as any[],
  },
}))

vi.mock('../../../lib/supabase', () => {
  const { store } = h
  function from(table: string) {
    let selectArg = ''
    let filters: Record<string, unknown> = {}
    let inFilters: Record<string, unknown[]> = {}
    let mode: 'select' | 'insert' | 'update' = 'select'
    let payload: any = null

    function matches(row: any) {
      const eqOk = Object.entries(filters).every(([k, v]) => row[k] === v)
      const inOk = Object.entries(inFilters).every(([k, v]) => (v as unknown[]).includes(row[k]))
      return eqOk && inOk
    }
    const builder: any = {
      select: (arg?: string) => {
        selectArg = arg ?? ''
        return builder
      },
      eq: (col: string, val: unknown) => {
        filters[col] = val
        return builder
      },
      in: (col: string, vals: unknown[]) => {
        inFilters[col] = vals
        return builder
      },
      order: () => resolveSelect(),
      insert: (p: any) => {
        mode = 'insert'
        payload = p
        return builder
      },
      update: (p: any) => {
        mode = 'update'
        payload = p
        return builder
      },
      single: () => {
        if (table === 'judokas') {
          return Promise.resolve({ data: { role: store.role, id: store.adminJudokaId }, error: null })
        }
        if (mode === 'insert') {
          if (table === 'conversations') {
            const row = { id: 'conv-' + (store.conversations.length + 1), created_at: new Date().toISOString(), ...payload }
            store.conversations.push(row)
            return Promise.resolve({ data: row, error: null })
          }
          if (table === 'messages') {
            const row = { id: 'm-' + (store.messages.length + 1), created_at: new Date().toISOString(), ...payload }
            store.messages.push(row)
            return Promise.resolve({ data: row, error: null })
          }
        }
        return Promise.resolve({ data: null, error: null })
      },
      then: (resolve: any) => {
        if (mode === 'insert' && table === 'conversation_participants') {
          const rows = Array.isArray(payload) ? payload : [payload]
          store.participants.push(...rows)
          return resolve({ data: rows, error: null })
        }
        if (mode === 'update' && table === 'conversation_participants') {
          for (const p of store.participants) {
            if (matches(p)) Object.assign(p, payload)
          }
          return resolve({ data: null, error: null })
        }
        return resolve(resolveSelect())
      },
    }
    function resolveSelect() {
      if (table === 'judokas') return { data: store.judokas.filter(matches), error: null }
      if (table === 'conversations') return { data: store.conversations.filter(matches), error: null }
      if (table === 'conversation_participants') return { data: store.participants.filter(matches), error: null }
      if (table === 'messages') {
        const rows = store.messages.filter(matches)
        return { data: [...rows].sort((a, b) => (a.created_at < b.created_at ? -1 : 1)), error: null }
      }
      return { data: null, error: null }
    }
    return builder
  }
  return {
    supabase: {
      auth: { getUser: () => Promise.resolve({ data: { user: { id: store.adminUserId } } }) },
      from,
    },
  }
})

function mockUnread(conversations: any[], markAsRead = vi.fn()) {
  vi.mocked(hookModule.useUnreadConversations).mockReturnValue({ conversations, markAsRead })
  return markAsRead
}

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn()
})

beforeEach(() => {
  navigateMock.mockClear()
  h.store.role = 'admin'
  h.store.judokas = []
  h.store.conversations = []
  h.store.participants = []
  h.store.messages = []
  mockUnread([])
})

function renderList() {
  return render(
    <MemoryRouter>
      <Messagerie />
    </MemoryRouter>
  )
}

function renderThread(conversationId: string) {
  return render(
    <MemoryRouter initialEntries={[`/admin/messagerie/${conversationId}`]}>
      <Routes>
        <Route path="/admin/messagerie/:conversationId" element={<MessagerieThread />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('Messagerie (liste des vignettes)', () => {
  it('génère la liste des vignettes à partir des conversations existantes', async () => {
    h.store.judokas = [{ id: 'j1', user_id: 'user-j1', full_name: 'Ken Judo', role: 'judoka' }]
    h.store.conversations = [{ id: 'c1', title: 'Ken Judo', type: 'direct', created_at: '2026-07-01T00:00:00Z' }]
    h.store.participants = [
      { conversation_id: 'c1', user_id: 'admin-user', last_read_at: null },
      { conversation_id: 'c1', user_id: 'user-j1', last_read_at: null },
    ]
    h.store.messages = [
      { id: 'm1', conversation_id: 'c1', sender_id: 'j1', content: 'Bonjour', created_at: '2026-07-01T10:00:00Z' },
    ]

    renderList()

    await waitFor(() => {
      expect(screen.getByText('Ken Judo')).toBeInTheDocument()
      expect(screen.getByText('Bonjour')).toBeInTheDocument()
    })
  })

  it('affiche une pastille si message non lu pour l\'admin, absente sinon', async () => {
    h.store.judokas = [{ id: 'j1', user_id: 'user-j1', full_name: 'Ken Judo', role: 'judoka' }]
    h.store.conversations = [{ id: 'c1', title: 'Ken Judo', type: 'direct', created_at: '2026-07-01T00:00:00Z' }]
    h.store.participants = [
      { conversation_id: 'c1', user_id: 'admin-user', last_read_at: null },
      { conversation_id: 'c1', user_id: 'user-j1', last_read_at: null },
    ]
    h.store.messages = [
      { id: 'm1', conversation_id: 'c1', sender_id: 'j1', content: 'Bonjour', created_at: '2026-07-01T10:00:00Z' },
    ]
    mockUnread([
      { conversationId: 'c1', title: 'Ken Judo', lastMessage: { content: 'Bonjour', senderId: 'j1' }, createdAt: '2026-07-01T10:00:00Z' },
    ])

    renderList()

    await waitFor(() => {
      expect(screen.getByTestId('unread-dot-c1')).toBeInTheDocument()
    })
  })

  it('absence de pastille quand la conversation est lue', async () => {
    h.store.judokas = [{ id: 'j1', user_id: 'user-j1', full_name: 'Ken Judo', role: 'judoka' }]
    h.store.conversations = [{ id: 'c1', title: 'Ken Judo', type: 'direct', created_at: '2026-07-01T00:00:00Z' }]
    h.store.participants = [
      { conversation_id: 'c1', user_id: 'admin-user', last_read_at: '2026-07-02T00:00:00Z' },
      { conversation_id: 'c1', user_id: 'user-j1', last_read_at: null },
    ]
    h.store.messages = [
      { id: 'm1', conversation_id: 'c1', sender_id: 'j1', content: 'Bonjour', created_at: '2026-07-01T10:00:00Z' },
    ]
    mockUnread([])

    renderList()

    await waitFor(() => screen.getByText('Ken Judo'))
    expect(screen.queryByTestId('unread-dot-c1')).toBeNull()
  })

  it('un clic sur une vignette navigue vers la conversation correspondante', async () => {
    h.store.judokas = [{ id: 'j1', user_id: 'user-j1', full_name: 'Ken Judo', role: 'judoka' }]
    h.store.conversations = [{ id: 'c1', title: 'Ken Judo', type: 'direct', created_at: '2026-07-01T00:00:00Z' }]
    h.store.participants = [
      { conversation_id: 'c1', user_id: 'admin-user', last_read_at: null },
      { conversation_id: 'c1', user_id: 'user-j1', last_read_at: null },
    ]
    h.store.messages = [
      { id: 'm1', conversation_id: 'c1', sender_id: 'j1', content: 'Bonjour', created_at: '2026-07-01T10:00:00Z' },
    ]

    renderList()
    await waitFor(() => screen.getByText('Ken Judo'))
    await userEvent.click(screen.getByText('Ken Judo'))

    expect(navigateMock).toHaveBeenCalledWith('/admin/messagerie/c1')
  })

  it('l\'admin peut créer une nouvelle conversation avec un judoka sans conversation existante', async () => {
    h.store.judokas = [
      { id: 'j1', user_id: 'user-j1', full_name: 'Ken Judo', role: 'judoka' },
      { id: 'j2', user_id: 'user-j2', full_name: 'Mika Sato', role: 'judoka' },
    ]
    // aucune conversation existante

    renderList()
    await userEvent.click(await screen.findByRole('button', { name: /nouveau message/i }))
    await userEvent.selectOptions(screen.getByLabelText(/choisir un judoka/i), 'j2')
    await userEvent.click(screen.getByRole('button', { name: /démarrer/i }))

    await waitFor(() => {
      expect(h.store.conversations.some((c) => c.type === 'direct')).toBe(true)
    })
    const conv = h.store.conversations.find((c) => c.type === 'direct')
    const participantUserIds = h.store.participants.filter((p) => p.conversation_id === conv.id).map((p) => p.user_id)
    expect(participantUserIds).toEqual(expect.arrayContaining(['admin-user', 'user-j2']))
    expect(navigateMock).toHaveBeenCalledWith(`/admin/messagerie/${conv.id}`)
  })
})

describe('MessagerieThread (fil de conversation admin)', () => {
  it('l\'ouverture de la conversation appelle markAsRead pour l\'admin', async () => {
    h.store.conversations = [{ id: 'c1', title: 'Ken Judo', type: 'direct', created_at: '2026-07-01T00:00:00Z' }]
    const markAsRead = mockUnread([])
    renderThread('c1')

    await waitFor(() => {
      expect(markAsRead).toHaveBeenCalledWith('c1')
    })
  })

  it('l\'admin peut envoyer le premier message dans une nouvelle conversation', async () => {
    h.store.conversations = [{ id: 'c1', title: 'Ken Judo', type: 'direct', created_at: '2026-07-01T00:00:00Z' }]
    mockUnread([])
    renderThread('c1')

    const input = await screen.findByPlaceholderText(/message/i)
    await userEvent.type(input, 'Bienvenue sur Hazumi')
    await userEvent.click(screen.getByRole('button', { name: /envoyer/i }))

    await waitFor(() => {
      expect(screen.getByText('Bienvenue sur Hazumi')).toBeInTheDocument()
    })
    const sent = h.store.messages.find((m) => m.content === 'Bienvenue sur Hazumi')
    expect(sent.conversation_id).toBe('c1')
    expect(sent.sender_id).toBe(h.store.adminJudokaId)
  })
})
