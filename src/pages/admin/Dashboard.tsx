import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useUnreadConversations } from '../../hooks/useUnreadConversations'

interface CatalogueCounts {
  video: number
  pdf: number
  autres: number
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { conversations } = useUnreadConversations()
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [adminJudokaId, setAdminJudokaId] = useState<string | null>(null)

  const [judokasActifs, setJudokasActifs] = useState(0)
  const [judokasRecents, setJudokasRecents] = useState(0)
  const [catalogueCounts, setCatalogueCounts] = useState<CatalogueCounts>({ video: 0, pdf: 0, autres: 0 })
  const [messagesTotal, setMessagesTotal] = useState(0)

  const [notes, setNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      navigate('/login')
      return
    }

    const { data: me } = await supabase.from('judokas').select('role, id').eq('user_id', user.id).single()
    if (!me || me.role !== 'admin') {
      setLoading(false)
      return
    }
    setHasAccess(true)
    setAdminJudokaId(me.id)

    const { count: actifsCount } = await supabase
      .from('judokas')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'judoka')
    setJudokasActifs(actifsCount ?? 0)

    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count: recentsCount } = await supabase
      .from('judokas')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'judoka')
      .gte('last_active_at', cutoff)
    setJudokasRecents(recentsCount ?? 0)

    const { data: catalogue } = await supabase.from('catalogue_hazumi').select('type')
    const counts: CatalogueCounts = { video: 0, pdf: 0, autres: 0 }
    for (const item of (catalogue as { type: string }[]) ?? []) {
      if (item.type === 'video') counts.video++
      else if (item.type === 'pdf') counts.pdf++
      else counts.autres++
    }
    setCatalogueCounts(counts)

    const { data: msgs } = await supabase.from('messages').select('conversation_id').not('conversation_id', 'is', null)
    setMessagesTotal((msgs ?? []).length)

    const { data: note } = await supabase.from('admin_notes').select('content').eq('admin_id', me.id).single()
    setNotes(note?.content ?? '')

    setLoading(false)
  }

  async function saveNotes() {
    if (!adminJudokaId) return
    setSavingNotes(true)
    await supabase.from('admin_notes').upsert({
      admin_id: adminJudokaId,
      content: notes,
      updated_at: new Date().toISOString(),
    })
    setSavingNotes(false)
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
        <p className="text-red-600 text-sm mt-2">Vous devez être admin pour accéder à cette page.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0A0A0A] mb-1">Dashboard</h1>
        <p className="text-[#666666]">Vue d'ensemble de l'activité Hazumi</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* Bloc Judokas */}
        <div className="bg-white rounded-lg p-6 border border-[#E5E5E5] shadow-sm">
          <p className="text-xs uppercase tracking-widest text-[#999999] mb-4">Judokas</p>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[#666666]">Judokas actifs</span>
            <span data-testid="stat-judokas-actifs" className="text-2xl font-bold text-[#0A0A0A]">{judokasActifs}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#666666]">Connectés (24h)</span>
            <span data-testid="stat-judokas-recents" className="text-2xl font-bold text-[#0A0A0A]">{judokasRecents}</span>
          </div>
        </div>

        {/* Bloc Catalogues */}
        <div className="bg-white rounded-lg p-6 border border-[#E5E5E5] shadow-sm">
          <p className="text-xs uppercase tracking-widest text-[#999999] mb-4">Catalogues</p>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#666666]">Vidéos</span>
            <span data-testid="stat-catalogue-video" className="text-lg font-bold text-[#0A0A0A]">{catalogueCounts.video}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#666666]">PDF</span>
            <span data-testid="stat-catalogue-pdf" className="text-lg font-bold text-[#0A0A0A]">{catalogueCounts.pdf}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#666666]">Autres</span>
            <span data-testid="stat-catalogue-autres" className="text-lg font-bold text-[#0A0A0A]">{catalogueCounts.autres}</span>
          </div>
        </div>

        {/* Bloc Messagerie */}
        <div className="bg-white rounded-lg p-6 border border-[#E5E5E5] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs uppercase tracking-widest text-[#999999]">Messagerie</p>
            <button
              data-testid="link-messagerie"
              onClick={() => navigate('/admin/messagerie')}
              className="text-[#C41230] hover:text-[#9B0E25] transition-colors"
              title="Aller à la messagerie"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#666666]">Messages reçus</span>
            <span data-testid="stat-messages-total" className="text-lg font-bold text-[#0A0A0A]">{messagesTotal}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#666666]">Non lus</span>
            <span data-testid="stat-messages-non-lus" className="text-lg font-bold text-[#C41230]">{conversations.length}</span>
          </div>
        </div>

        {/* Bloc To Do */}
        <div className="bg-white rounded-lg p-6 border border-[#E5E5E5] shadow-sm flex flex-col">
          <p className="text-xs uppercase tracking-widest text-[#999999] mb-3">To Do</p>
          <textarea
            data-testid="todo-textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes libres…"
            rows={4}
            className="flex-1 w-full rounded-lg border border-[#E5E5E5] p-2 text-sm resize-none focus:outline-none focus:border-[#C41230]"
          />
          <button
            data-testid="todo-save"
            onClick={saveNotes}
            disabled={savingNotes}
            className="mt-3 self-end px-4 py-2 bg-[#C41230] hover:bg-[#9B0E25] disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            {savingNotes ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}
