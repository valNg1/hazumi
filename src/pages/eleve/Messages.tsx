import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import MonEspaceNav from '../../components/MonEspaceNav'

interface Message {
  id: string
  judoka_id: string
  sender: 'judoka' | 'admin'
  content: string
  created_at: string
  read_at: string | null
}

export default function Messages() {
  const [judokaId, setJudokaId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!judokaId) return
    const channel = supabase
      .channel('messages-judoka')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `judoka_id=eq.${judokaId}` },
        (payload) => {
          const m = payload.new as Message
          setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]))
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [judokaId])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }
    const { data: j } = await supabase
      .from('judokas')
      .select('id')
      .eq('user_id', user.id)
      .single()
    if (!j) {
      setLoading(false)
      return
    }
    setJudokaId(j.id)

    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('judoka_id', j.id)
      .order('created_at', { ascending: true })
    setMessages((data as Message[]) ?? [])

    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('judoka_id', j.id)
      .eq('sender', 'admin')
      .is('read_at', null)
    window.dispatchEvent(new CustomEvent('hazumi:messages-read'))

    setLoading(false)
  }

  async function send() {
    const content = input.trim()
    if (!content || !judokaId || sending) return
    setSending(true)
    const { data, error } = await supabase
      .from('messages')
      .insert({ judoka_id: judokaId, sender: 'judoka', content })
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
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <MonEspaceNav />
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">Messagerie</h1>
        <p className="text-[#999999] text-sm mt-0.5">Echanges avec Hazumi.</p>
      </div>

      <div className="flex-1 overflow-y-auto bg-white rounded-xl border border-[#E5E5E5] p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center">
            <p className="text-sm text-[#CCCCCC]">Aucun message pour l'instant. Écris le premier !</p>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.sender === 'judoka' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  m.sender === 'judoka'
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
