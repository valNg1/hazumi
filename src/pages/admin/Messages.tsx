import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

interface Judoka {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
}

interface Message {
  id: string
  judoka_id: string
  sender: 'judoka' | 'admin'
  content: string
  created_at: string
  read_at: string | null
}

export default function AdminMessages() {
  const { judokaId } = useParams<{ judokaId: string }>()
  const navigate = useNavigate()
  const [judoka, setJudoka] = useState<Judoka | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!judokaId) {
      navigate('/admin/messages')
      return
    }
    load()
  }, [judokaId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function load() {
    const { data: j } = await supabase
      .from('judokas')
      .select('id, first_name, last_name, email')
      .eq('id', judokaId)
      .single()
    setJudoka((j as Judoka) ?? null)

    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('judoka_id', judokaId)
      .order('created_at', { ascending: true })
    setMessages((data as Message[]) ?? [])

    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('judoka_id', judokaId)
      .eq('sender', 'judoka')
      .is('read_at', null)

    setLoading(false)
  }

  async function send() {
    const content = input.trim()
    if (!content || !judokaId || sending) return
    setSending(true)
    const { data, error } = await supabase
      .from('messages')
      .insert({ judoka_id: judokaId, sender: 'admin', content })
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
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/messages')}
          className="p-2 hover:bg-[#F5F5F5] rounded transition-colors"
          title="Retour"
        >
          <svg className="w-5 h-5 text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#0A0A0A]">
            {judoka ? `${judoka.first_name ?? ''} ${judoka.last_name ?? ''}` : 'Élève'}
          </h1>
          {judoka?.email && <p className="text-sm text-[#666666]">{judoka.email}</p>}
        </div>
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
              className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  m.sender === 'admin'
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
