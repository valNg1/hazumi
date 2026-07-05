import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import AdminDashboard from '../Dashboard'
import * as hookModule from '../../../hooks/useUnreadConversations'

vi.mock('../../../hooks/useUnreadConversations')

const navigateMock = vi.hoisted(() => vi.fn())
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => navigateMock }
})

const h = vi.hoisted(() => ({
  store: {
    userId: 'admin-user',
    adminJudokaId: 'admin-j1',
    role: 'admin' as string,
    judokas: [] as any[],
    catalogue: [] as any[],
    messages: [] as any[],
    adminNotes: [] as any[],
  },
}))

vi.mock('../../../lib/supabase', () => {
  const { store } = h
  function from(table: string) {
    let selectArg = ''
    let filters: Record<string, unknown> = {}
    let gteFilters: Record<string, unknown> = {}
    let notNullCols: string[] = []
    let neqFilters: Record<string, unknown> = {}
    let head = false
    let mode: 'select' | 'upsert' = 'select'
    let payload: any = null

    const builder: any = {
      select: (arg?: string, opts?: any) => {
        selectArg = arg ?? ''
        head = !!opts?.head
        return builder
      },
      eq: (col: string, val: unknown) => {
        filters[col] = val
        return builder
      },
      neq: (col: string, val: unknown) => {
        neqFilters[col] = val
        return builder
      },
      gte: (col: string, val: unknown) => {
        gteFilters[col] = val
        return builder
      },
      not: (col: string, _op: string, _val: unknown) => {
        notNullCols.push(col)
        return builder
      },
      single: () => {
        if (table === 'judokas') {
          if (selectArg.includes('role')) return Promise.resolve({ data: { role: store.role, id: store.adminJudokaId }, error: null })
          return Promise.resolve({ data: null, error: null })
        }
        if (table === 'admin_notes') {
          const row = store.adminNotes.find((n) => n.admin_id === filters.admin_id)
          return Promise.resolve({ data: row ?? null, error: null })
        }
        return Promise.resolve({ data: null, error: null })
      },
      upsert: (p: any) => {
        mode = 'upsert'
        payload = p
        return builder
      },
      then: (resolve: any) => {
        if (mode === 'upsert' && table === 'admin_notes') {
          const existing = store.adminNotes.find((n) => n.admin_id === payload.admin_id)
          if (existing) Object.assign(existing, payload)
          else store.adminNotes.push({ ...payload })
          return resolve({ data: null, error: null })
        }
        if (table === 'judokas') {
          let rows = store.judokas.filter((j) => Object.entries(filters).every(([k, v]) => j[k] === v))
          if (gteFilters.last_active_at) {
            rows = rows.filter((j) => j.last_active_at && j.last_active_at >= gteFilters.last_active_at)
          }
          if (head) return resolve({ count: rows.length, data: null, error: null })
          return resolve({ data: rows, error: null })
        }
        if (table === 'catalogue_hazumi') {
          return resolve({ data: store.catalogue, error: null })
        }
        if (table === 'messages') {
          let rows = store.messages.filter((m) => Object.entries(filters).every(([k, v]) => m[k] === v))
          for (const col of notNullCols) rows = rows.filter((m) => m[col] !== null && m[col] !== undefined)
          for (const [k, v] of Object.entries(neqFilters)) rows = rows.filter((m) => m[k] !== v)
          if (head) return resolve({ count: rows.length, data: null, error: null })
          return resolve({ data: rows, error: null })
        }
        return resolve({ data: null, error: null })
      },
    }
    return builder
  }
  return {
    supabase: {
      auth: { getUser: () => Promise.resolve({ data: { user: { id: store.userId } } }) },
      from,
    },
  }
})

function mockUnread(conversations: any[]) {
  vi.mocked(hookModule.useUnreadConversations).mockReturnValue({
    conversations,
    markAsRead: vi.fn(),
  })
}

beforeEach(() => {
  navigateMock.mockClear()
  h.store.role = 'admin'
  h.store.judokas = []
  h.store.catalogue = []
  h.store.messages = []
  h.store.adminNotes = []
  mockUnread([])
})

function renderDashboard() {
  return render(
    <MemoryRouter>
      <AdminDashboard />
    </MemoryRouter>
  )
}

describe('AdminDashboard', () => {
  it('calcule correctement le nombre de judokas actifs', async () => {
    h.store.judokas = [
      { id: 'j1', role: 'judoka', last_active_at: null },
      { id: 'j2', role: 'judoka', last_active_at: null },
      { id: 'j3', role: 'admin', last_active_at: null },
    ]
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByTestId('stat-judokas-actifs')).toHaveTextContent('2')
    })
  })

  it('calcule correctement le nombre de judokas connectés dans les dernières 24h', async () => {
    const now = new Date()
    const recent = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
    const old = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString()
    h.store.judokas = [
      { id: 'j1', role: 'judoka', last_active_at: recent },
      { id: 'j2', role: 'judoka', last_active_at: old },
      { id: 'j3', role: 'judoka', last_active_at: null },
    ]
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByTestId('stat-judokas-recents')).toHaveTextContent('1')
    })
  })

  it('calcule correctement les contenus par type (vidéos/PDF/autres)', async () => {
    h.store.catalogue = [
      { type: 'video' }, { type: 'video' }, { type: 'pdf' }, { type: 'article' },
    ]
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByTestId('stat-catalogue-video')).toHaveTextContent('2')
      expect(screen.getByTestId('stat-catalogue-pdf')).toHaveTextContent('1')
      expect(screen.getByTestId('stat-catalogue-autres')).toHaveTextContent('1')
    })
  })

  it('calcule correctement messages reçus total vs non lus', async () => {
    h.store.messages = [
      { conversation_id: 'c1', sender_id: 'j1' },
      { conversation_id: 'c2', sender_id: 'j2' },
      { conversation_id: null, sender_id: null },
    ]
    mockUnread([
      { conversationId: 'c1', title: 'x', lastMessage: { content: 'y', senderId: 'j1' }, createdAt: '2026-07-01T00:00:00Z' },
    ])
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByTestId('stat-messages-total')).toHaveTextContent('2')
      expect(screen.getByTestId('stat-messages-non-lus')).toHaveTextContent('1')
    })
  })

  it('le lien flèche navigue vers /admin/messagerie', async () => {
    renderDashboard()
    await waitFor(() => screen.getByTestId('link-messagerie'))
    await userEvent.click(screen.getByTestId('link-messagerie'))
    expect(navigateMock).toHaveBeenCalledWith('/admin/messagerie')
  })

  it('le bloc-notes sauvegarde et relit le contenu depuis admin_notes', async () => {
    renderDashboard()
    const textarea = await screen.findByTestId('todo-textarea')
    await userEvent.clear(textarea)
    await userEvent.type(textarea, 'Rappeler le club de Lyon')
    await userEvent.click(screen.getByTestId('todo-save'))

    await waitFor(() => {
      const saved = h.store.adminNotes.find((n) => n.admin_id === h.store.adminJudokaId)
      expect(saved?.content).toBe('Rappeler le club de Lyon')
    })
  })
})
