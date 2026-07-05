import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useUnreadConversations } from '../useUnreadConversations'

const h = vi.hoisted(() => ({
  store: {
    userId: 'user-1',
    participants: [] as any[],
    conversations: [] as any[],
    messages: [] as any[],
    channels: [] as any[],
    emitInsert(msg: any) {
      for (const c of this.channels) c.cb({ new: msg })
    },
  },
}))

vi.mock('../../lib/supabase', () => {
  const { store } = h
  function from(table: string) {
    let filters: Record<string, unknown> = {}
    let inFilters: Record<string, unknown[]> = {}
    let mode: 'select' | 'update' = 'select'
    let payload: any = null
    const builder: any = {
      select: () => builder,
      eq: (col: string, val: unknown) => {
        filters[col] = val
        return builder
      },
      in: (col: string, vals: unknown[]) => {
        inFilters[col] = vals
        return builder
      },
      order: () => resolveSelect(),
      update: (p: any) => {
        mode = 'update'
        payload = p
        return builder
      },
      then: (resolve: any) => {
        if (mode === 'update' && table === 'conversation_participants') {
          const row = store.participants.find(
            (p: any) => p.conversation_id === filters.conversation_id && p.user_id === filters.user_id
          )
          if (row) row.last_read_at = payload.last_read_at
          return resolve({ data: null, error: null })
        }
        return resolve(resolveSelect())
      },
    }
    function matchAll(row: any) {
      const eqOk = Object.entries(filters).every(([k, v]) => row[k] === v)
      const inOk = Object.entries(inFilters).every(([k, v]) => (v as unknown[]).includes(row[k]))
      return eqOk && inOk
    }
    function resolveSelect() {
      if (table === 'conversation_participants') {
        return { data: store.participants.filter(matchAll), error: null }
      }
      if (table === 'conversations') {
        return { data: store.conversations.filter(matchAll), error: null }
      }
      if (table === 'messages') {
        const rows = store.messages.filter(matchAll)
        return { data: [...rows].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)), error: null }
      }
      return { data: null, error: null }
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
      auth: { getUser: () => Promise.resolve({ data: { user: { id: store.userId } } }) },
      from,
      channel,
      removeChannel: () => {},
    },
  }
})

beforeEach(() => {
  h.store.participants = []
  h.store.conversations = []
  h.store.messages = []
  h.store.channels = []
})

describe('useUnreadConversations', () => {
  it('retourne [] si tout est lu', async () => {
    h.store.participants = [
      { conversation_id: 'c1', user_id: 'user-1', last_read_at: '2026-07-10T00:00:00Z' },
    ]
    h.store.conversations = [{ id: 'c1', title: 'Groupe Kata' }]
    h.store.messages = [
      { conversation_id: 'c1', content: 'Ancien message', sender_id: 'j2', created_at: '2026-07-01T00:00:00Z' },
    ]

    const { result } = renderHook(() => useUnreadConversations())

    await waitFor(() => {
      expect(result.current.conversations).toEqual([])
    })
  })

  it('retourne les conversations avec message(s) postérieur(s) à last_read_at (ou jamais lu)', async () => {
    h.store.participants = [
      { conversation_id: 'c1', user_id: 'user-1', last_read_at: '2026-07-01T00:00:00Z' },
      { conversation_id: 'c2', user_id: 'user-1', last_read_at: null },
    ]
    h.store.conversations = [
      { id: 'c1', title: 'Groupe Kata' },
      { id: 'c2', title: 'Groupe Ne-waza' },
    ]
    h.store.messages = [
      { conversation_id: 'c1', content: 'Nouveau message', sender_id: 'j2', created_at: '2026-07-10T00:00:00Z' },
      { conversation_id: 'c2', content: 'Premier message', sender_id: 'j3', created_at: '2026-07-05T00:00:00Z' },
    ]

    const { result } = renderHook(() => useUnreadConversations())

    await waitFor(() => {
      expect(result.current.conversations).toHaveLength(2)
    })
    const ids = result.current.conversations.map((c) => c.conversationId).sort()
    expect(ids).toEqual(['c1', 'c2'])
    const c1 = result.current.conversations.find((c) => c.conversationId === 'c1')!
    expect(c1.title).toBe('Groupe Kata')
    expect(c1.lastMessage.content).toBe('Nouveau message')
  })

  it('se met à jour en temps réel sur réception d\'un nouveau message', async () => {
    h.store.participants = [
      { conversation_id: 'c1', user_id: 'user-1', last_read_at: '2026-07-10T00:00:00Z' },
    ]
    h.store.conversations = [{ id: 'c1', title: 'Groupe Kata' }]
    h.store.messages = [
      { conversation_id: 'c1', content: 'Ancien message', sender_id: 'j2', created_at: '2026-07-01T00:00:00Z' },
    ]

    const { result } = renderHook(() => useUnreadConversations())

    await waitFor(() => {
      expect(result.current.conversations).toEqual([])
      expect(h.store.channels.length).toBeGreaterThan(0)
    })

    act(() => {
      h.store.emitInsert({
        conversation_id: 'c1',
        content: 'Message temps réel',
        sender_id: 'j2',
        created_at: '2026-07-11T00:00:00Z',
      })
    })

    await waitFor(() => {
      expect(result.current.conversations).toHaveLength(1)
      expect(result.current.conversations[0].lastMessage.content).toBe('Message temps réel')
    })
  })

  it('markAsRead met à jour last_read_at et fait disparaître la conversation de la liste', async () => {
    h.store.participants = [
      { conversation_id: 'c1', user_id: 'user-1', last_read_at: null },
    ]
    h.store.conversations = [{ id: 'c1', title: 'Groupe Kata' }]
    h.store.messages = [
      { conversation_id: 'c1', content: 'Nouveau message', sender_id: 'j2', created_at: '2026-07-10T00:00:00Z' },
    ]

    const { result } = renderHook(() => useUnreadConversations())

    await waitFor(() => {
      expect(result.current.conversations).toHaveLength(1)
    })

    await act(async () => {
      await result.current.markAsRead('c1')
    })

    await waitFor(() => {
      expect(result.current.conversations).toEqual([])
    })
    const participant = h.store.participants.find((p) => p.conversation_id === 'c1')
    expect(participant.last_read_at).not.toBeNull()
  })
})
