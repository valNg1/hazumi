import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface UnreadConversation {
  conversationId: string
  title: string
  lastMessage: { content: string; senderId: string | null }
  createdAt: string
}

interface Participant {
  conversation_id: string
  last_read_at: string | null
}

interface RawMessage {
  conversation_id: string
  content: string
  sender_id: string | null
  created_at: string
}

export function useUnreadConversations() {
  const [conversations, setConversations] = useState<UnreadConversation[]>([])
  const userIdRef = useRef<string | null>(null)
  const participantIdsRef = useRef<Set<string>>(new Set())
  const titleMapRef = useRef<Map<string, string>>(new Map())

  async function refresh(userId: string) {
    const { data: participants } = await supabase
      .from('conversation_participants')
      .select('conversation_id, last_read_at')
      .eq('user_id', userId)

    const parts = (participants as Participant[]) ?? []
    const ids = parts.map(p => p.conversation_id)
    participantIdsRef.current = new Set(ids)

    if (ids.length === 0) {
      setConversations([])
      return
    }

    const lastReadMap = new Map(parts.map(p => [p.conversation_id, p.last_read_at]))

    const { data: convs } = await supabase
      .from('conversations')
      .select('id, title')
      .in('id', ids)
    titleMapRef.current = new Map((convs ?? []).map((c: any) => [c.id, c.title]))

    const { data: messages } = await supabase
      .from('messages')
      .select('conversation_id, content, sender_id, created_at')
      .in('conversation_id', ids)
      .order('created_at', { ascending: false })

    const latestByConv = new Map<string, RawMessage>()
    for (const m of (messages as RawMessage[]) ?? []) {
      if (!latestByConv.has(m.conversation_id)) latestByConv.set(m.conversation_id, m)
    }

    const result: UnreadConversation[] = []
    for (const id of ids) {
      const last = latestByConv.get(id)
      if (!last) continue
      const lastReadAt = lastReadMap.get(id)
      const isUnread = !lastReadAt || last.created_at > lastReadAt
      if (isUnread) {
        result.push({
          conversationId: id,
          title: titleMapRef.current.get(id) ?? '',
          lastMessage: { content: last.content, senderId: last.sender_id },
          createdAt: last.created_at,
        })
      }
    }
    setConversations(result)
  }

  useEffect(() => {
    let active = true
    let channel: ReturnType<typeof supabase.channel> | null = null

    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !active) return
      userIdRef.current = user.id
      await refresh(user.id)
      if (!active) return

      channel = supabase
        .channel('unread-conversations')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages' },
          (payload) => {
            const m = payload.new as RawMessage
            if (!m.conversation_id || !participantIdsRef.current.has(m.conversation_id)) return
            setConversations(prev => {
              const entry: UnreadConversation = {
                conversationId: m.conversation_id,
                title: titleMapRef.current.get(m.conversation_id) ?? '',
                lastMessage: { content: m.content, senderId: m.sender_id },
                createdAt: m.created_at,
              }
              const exists = prev.some(c => c.conversationId === m.conversation_id)
              if (exists) return prev.map(c => (c.conversationId === m.conversation_id ? entry : c))
              return [...prev, entry]
            })
          }
        )
        .subscribe()
    })()

    return () => {
      active = false
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

  async function markAsRead(conversationId: string) {
    const userId = userIdRef.current
    if (!userId) return
    await supabase
      .from('conversation_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
    setConversations(prev => prev.filter(c => c.conversationId !== conversationId))
  }

  return { conversations, markAsRead }
}
