import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useUnreadConversations } from '../../hooks/useUnreadConversations'

interface Conversation {
  id: string
  title: string
}

interface Message {
  id: string
  content: string
  sender_id: string | null
  created_at: string
}

export default function MessagerieThread() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const navigate = useNavigate()
  const { markAsRead } = useUnreadConversations()
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [adminJudokaId, setAdminJudokaId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!conversationId) {
      navigate('/admin/messagerie')
      return
    }
    load(conversationId)
    markAsRead(conversationId)
  }, [conversationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function load(id: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: me } = await supabase.from('judokas').select('id').eq('user_id', user.id).single()
      if (me) setAdminJudokaId(me.id)
    }

    const { data: conv } = await supabase.from('conversations').select('id, title').eq('id', id).single()
    setConversation((conv as Conversation) ?? null)

    const { data: msgs } = await supabase
      .from('messages')
      .select('id, content, sender_id, created_at')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true })
    setMessages((msgs as Message[]) ?? [])
    setLoading(false)
  }

  async function send() {
    const content = input.trim()
    if (!content || !conversationId || !adminJudokaId || sending) return
    setSending(true)
    const { data, error } = await supabase
      .from('messages')
      .insert({ conversation_id: conversationId, sender_id: adminJudokaId, content })
      .select()
      .single()
    if (!error && data) {
      setMessages((prev) => [...prev, data as Message])
      setInput('')
    }
    setSending(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-6 h-6 border-2 border-[#C41230] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <div className="mb-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/messagerie')}
          className="p-2 hover:bg-[#F5F5F5] rounded transition-colors"
          title="Retour"
        >
          <svg className="w-5 h-5 text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-[#0A0A0A]">{conversation?.title ?? 'Conversation'}</h1>
      </div>

      <div className="flex-1 overflow-y-auto bg-white rounded-xl border border-[#E5E5E5] p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center">
            <p className="text-sm text-[#CCCCCC]">Aucun message. Écris le premier !</p>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.sender_id === adminJudokaId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  m.sender_id === adminJudokaId
                    ? 'bg-[#C41230] text-white rounded-br-sm'
                    : 'bg-[#F0F0F0] text-[#0A0A0A] rounded-bl-sm'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          send()
        }}
        className="mt-3 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Votre message…"
          className="flex-1 rounded-full border border-[#E5E5E5] px-4 py-2.5 text-sm focus:outline-none focus:border-[#C41230] transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="rounded-full bg-[#C41230] text-white px-5 py-2.5 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#A50F28] transition-colors"
        >
          Envoyer
        </button>
      </form>
    </div>
  )
}
