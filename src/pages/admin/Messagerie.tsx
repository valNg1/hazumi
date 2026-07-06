import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useUnreadConversations } from '../../hooks/useUnreadConversations'

interface Judoka {
  id: string
  user_id: string
  full_name: string
}

interface ConversationRow {
  id: string
  title: string
  type: 'direct' | 'group'
}

interface Participant {
  conversation_id: string
  user_id: string
}

interface LastMessage {
  content: string
  created_at: string
}

interface Vignette {
  conversationId: string
  name: string
  lastMessage: string | null
  contents: string[]
}

export default function Messagerie() {
  const navigate = useNavigate()
  const { conversations: unreadConversations, markAsRead } = useUnreadConversations()
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [adminUserId, setAdminUserId] = useState<string | null>(null)
  const [vignettes, setVignettes] = useState<Vignette[]>([])
  const [judokas, setJudokas] = useState<Judoka[]>([])
  const [newConvOpen, setNewConvOpen] = useState(false)
  const [selectedJudokaId, setSelectedJudokaId] = useState('')
  const [existingJudokaUserIds, setExistingJudokaUserIds] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')

  const unreadIds = new Set(unreadConversations.map((c) => c.conversationId))

  const query = search.trim().toLowerCase()
  const filteredVignettes = query
    ? vignettes.filter(
        (v) =>
          v.name.toLowerCase().includes(query) ||
          v.contents.some((c) => c.toLowerCase().includes(query))
      )
    : vignettes

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      navigate('/login')
      return
    }
    setAdminUserId(user.id)

    const { data: me } = await supabase.from('judokas').select('role, id').eq('user_id', user.id).single()
    if (!me || me.role !== 'admin') {
      setLoading(false)
      return
    }
    setHasAccess(true)

    const { data: allJudokas } = await supabase.from('judokas').select('id, user_id, full_name').eq('role', 'judoka')
    setJudokas((allJudokas as Judoka[]) ?? [])

    const { data: myParticipations } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id)
    const conversationIds = (myParticipations ?? []).map((p: any) => p.conversation_id)

    if (conversationIds.length === 0) {
      setLoading(false)
      return
    }

    const { data: convs } = await supabase.from('conversations').select('id, title, type').in('id', conversationIds)
    const { data: allParticipants } = await supabase
      .from('conversation_participants')
      .select('conversation_id, user_id')
      .in('conversation_id', conversationIds)

    const otherUserIdsByConv = new Map<string, string>()
    for (const p of (allParticipants as Participant[]) ?? []) {
      if (p.user_id !== user.id) otherUserIdsByConv.set(p.conversation_id, p.user_id)
    }
    const otherUserIds = Array.from(new Set(otherUserIdsByConv.values()))
    setExistingJudokaUserIds(new Set(otherUserIds))

    const { data: theirJudokas } = await supabase
      .from('judokas')
      .select('user_id, full_name')
      .in('user_id', otherUserIds.length > 0 ? otherUserIds : ['__none__'])
    const nameByUserId = new Map<string, string>(
      ((theirJudokas as { user_id: string; full_name: string }[]) ?? []).map((j) => [j.user_id, j.full_name])
    )

    const { data: msgs } = await supabase
      .from('messages')
      .select('conversation_id, content, created_at')
      .in('conversation_id', conversationIds)
      .order('created_at', { ascending: false })
    const lastByConv = new Map<string, LastMessage>()
    const contentsByConv = new Map<string, string[]>()
    for (const m of (msgs as (LastMessage & { conversation_id: string })[]) ?? []) {
      if (!lastByConv.has(m.conversation_id)) lastByConv.set(m.conversation_id, m)
      const arr = contentsByConv.get(m.conversation_id) ?? []
      arr.push(m.content)
      contentsByConv.set(m.conversation_id, arr)
    }

    const result: Vignette[] = ((convs as ConversationRow[]) ?? []).map((c) => {
      const otherUserId = otherUserIdsByConv.get(c.id)
      const name = (otherUserId && nameByUserId.get(otherUserId)) || c.title
      const last = lastByConv.get(c.id)
      return { conversationId: c.id, name, lastMessage: last?.content ?? null, contents: contentsByConv.get(c.id) ?? [] }
    })
    setVignettes(result)
    setLoading(false)
  }

  function openConversation(conversationId: string) {
    navigate(`/admin/messagerie/${conversationId}`)
    markAsRead(conversationId)
  }

  async function startConversation() {
    if (!selectedJudokaId || !adminUserId) return
    const judoka = judokas.find((j) => j.id === selectedJudokaId)
    if (!judoka) return

    // Conversation deja existante avec ce judoka ?
    if (existingJudokaUserIds.has(judoka.user_id)) {
      const existing = vignettes.find((v) => v.name === judoka.full_name)
      if (existing) {
        openConversation(existing.conversationId)
        setNewConvOpen(false)
        return
      }
    }

    const { data: conv, error } = await supabase
      .from('conversations')
      .insert({ title: judoka.full_name, type: 'direct' })
      .select()
      .single()
    if (error || !conv) return

    await supabase.from('conversation_participants').insert([
      { conversation_id: conv.id, user_id: adminUserId },
      { conversation_id: conv.id, user_id: judoka.user_id },
    ])

    setNewConvOpen(false)
    setSelectedJudokaId('')
    navigate(`/admin/messagerie/${conv.id}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-6 h-6 border-2 border-[#C41230] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-semibold">Accès refusé</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0A0A0A]">Messagerie</h1>
          <p className="text-[#666666]">Conversations avec les élèves</p>
        </div>
        <button
          onClick={() => setNewConvOpen(true)}
          className="px-4 py-2.5 bg-[#C41230] hover:bg-[#9B0E25] text-white rounded-lg text-sm font-semibold transition-colors"
        >
          + Nouveau message
        </button>
      </div>

      <div className="relative mb-4">
        <svg className="w-4 h-4 text-[#999999] absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher dans les messages…"
          className="w-full rounded-lg border border-[#E5E5E5] pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-[#C41230]"
        />
      </div>

      <div className="bg-white rounded-lg border border-[#E5E5E5] shadow-sm overflow-hidden divide-y divide-[#E5E5E5]">
        {filteredVignettes.map((v) => (
          <button
            key={v.conversationId}
            onClick={() => openConversation(v.conversationId)}
            className="w-full text-left px-4 sm:px-6 py-3 hover:bg-[#F5F5F5] transition-colors flex items-center gap-3"
          >
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-[#0A0A0A]">{v.name}</span>
              {v.lastMessage && <p className="text-xs text-[#666666] truncate mt-0.5">{v.lastMessage}</p>}
            </div>
            {unreadIds.has(v.conversationId) && (
              <span data-testid={`unread-dot-${v.conversationId}`} className="w-2.5 h-2.5 rounded-full bg-[#C41230] flex-shrink-0" />
            )}
          </button>
        ))}

        {filteredVignettes.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-[#999999]">{query ? 'Aucun résultat' : 'Aucune conversation pour l\'instant'}</p>
          </div>
        )}
      </div>

      {newConvOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50" onClick={() => setNewConvOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-[#0A0A0A] mb-4">Nouveau message</h2>
            <label htmlFor="pick-judoka" className="text-xs text-[#666666] mb-1 block">
              Choisir un judoka
            </label>
            <select
              id="pick-judoka"
              value={selectedJudokaId}
              onChange={(e) => setSelectedJudokaId(e.target.value)}
              className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm mb-4"
            >
              <option value="">— Sélectionner —</option>
              {judokas.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.full_name}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => setNewConvOpen(false)}
                className="flex-1 px-3 py-2 border border-[#E5E5E5] text-[#666666] text-sm font-medium rounded-lg hover:bg-[#FAFAFA] transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={startConversation}
                disabled={!selectedJudokaId}
                className="flex-1 bg-[#C41230] hover:bg-[#9B0E25] disabled:bg-[#CCCCCC] text-white text-sm font-semibold px-3 py-2 rounded-lg transition-colors"
              >
                Démarrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
