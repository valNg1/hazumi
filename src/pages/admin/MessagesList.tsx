import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

interface JudokaInfo {
  first_name: string | null
  last_name: string | null
  email: string | null
}

interface RawMessage {
  id: string
  judoka_id: string
  sender: 'judoka' | 'admin'
  content: string
  created_at: string
  read_at: string | null
  judokas: JudokaInfo | null
}

interface Thread {
  judokaId: string
  info: JudokaInfo
  lastMessage: string
  lastDate: string
  unread: number
}

function buildThreads(messages: RawMessage[]): Thread[] {
  const byJudoka = new Map<string, Thread>()
  for (const m of messages) {
    let t = byJudoka.get(m.judoka_id)
    if (!t) {
      t = {
        judokaId: m.judoka_id,
        info: m.judokas ?? { first_name: null, last_name: null, email: null },
        lastMessage: m.content,
        lastDate: m.created_at,
        unread: 0,
      }
      byJudoka.set(m.judoka_id, t)
    }
    if (m.created_at > t.lastDate) {
      t.lastMessage = m.content
      t.lastDate = m.created_at
    }
    if (m.sender === 'judoka' && m.read_at === null) t.unread++
  }
  return Array.from(byJudoka.values()).sort((a, b) => (a.lastDate < b.lastDate ? 1 : -1))
}

export default function AdminMessagesList() {
  const navigate = useNavigate()
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      navigate('/login')
      return
    }
    const { data: me } = await supabase
      .from('judokas')
      .select('role')
      .eq('user_id', user.id)
      .single()
    if (!me || me.role !== 'admin') {
      setLoading(false)
      return
    }
    setHasAccess(true)

    const { data } = await supabase
      .from('messages')
      .select('id, judoka_id, sender, content, created_at, read_at, judokas(first_name, last_name, email)')
      .order('created_at', { ascending: false })
    setThreads(buildThreads((data as unknown as RawMessage[]) ?? []))
    setLoading(false)
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
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="p-2 hover:bg-[#F5F5F5] rounded transition-colors"
          title="Retour"
        >
          <svg className="w-5 h-5 text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-3xl font-bold text-[#0A0A0A]">Messagerie</h1>
          <p className="text-[#666666]">Conversations avec les élèves</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#E5E5E5] shadow-sm overflow-hidden divide-y divide-[#E5E5E5]">
        {threads.map((t) => (
          <button
            key={t.judokaId}
            onClick={() => navigate(`/admin/messages/${t.judokaId}`)}
            className="w-full text-left px-6 py-4 hover:bg-[#F5F5F5] transition-colors flex items-center gap-4"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#0A0A0A]">
                  {t.info.first_name} {t.info.last_name}
                </span>
                <span className="text-xs text-[#999999]">{t.info.email}</span>
              </div>
              <p className="text-sm text-[#666666] truncate mt-0.5">{t.lastMessage}</p>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="text-xs text-[#999999]">
                {new Date(t.lastDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
              </span>
              {t.unread > 0 && (
                <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-[#C41230] text-white text-xs font-bold leading-none">
                  {t.unread}
                </span>
              )}
            </div>
          </button>
        ))}

        {threads.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-[#999999]">Aucun message reçu pour l'instant</p>
          </div>
        )}
      </div>
    </div>
  )
}
