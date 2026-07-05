import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useUnreadConversations } from '../../hooks/useUnreadConversations'

interface Conversation {
  id: string
  title: string
  type: 'direct' | 'group'
}

interface Message {
  id: string
  content: string
  sender_id: string | null
  created_at: string
}

export default function ConversationView() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const navigate = useNavigate()
  const { markAsRead } = useUnreadConversations()
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!conversationId) {
      navigate('/eleve/accueil')
      return
    }
    load(conversationId)
    markAsRead(conversationId)
  }, [conversationId])

  async function load(id: string) {
    const { data: conv } = await supabase.from('conversations').select('id, title, type').eq('id', id).single()
    setConversation((conv as Conversation) ?? null)

    const { data: msgs } = await supabase
      .from('messages')
      .select('id, content, sender_id, created_at')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true })
    setMessages((msgs as Message[]) ?? [])
    setLoading(false)
  }

  if (loading) {
    return <div className="text-center py-16 text-[#999999] text-sm">Chargement…</div>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate('/eleve/accueil')}
          className="p-2 hover:bg-[#F5F5F5] rounded transition-colors"
          title="Retour"
        >
          <svg className="w-5 h-5 text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">
          {conversation?.title ?? 'Conversation'}
        </h1>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E5E5] p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-sm text-[#CCCCCC] text-center py-8">Aucun message pour l'instant.</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="bg-[#F5F5F5] rounded-lg px-4 py-2 text-sm text-[#0A0A0A]">
              {m.content}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
