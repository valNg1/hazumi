import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

interface Judoka {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email: string
  birth_date: string | null
  subscription_active: boolean
  subscription_expires_at: string | null
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [judokas, setJudokas] = useState<Judoka[]>([])
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [unreadTotal, setUnreadTotal] = useState(0)

  useEffect(() => {
    loadData()
    const channel = supabase
      .channel('badge-admin')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const m = payload.new as { sender: string; read_at: string | null }
          if (m.sender === 'judoka' && m.read_at === null) setUnreadTotal((u) => u + 1)
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      navigate('/login')
      return
    }

    const { data: judoka } = await supabase
      .from('judokas')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!judoka || judoka.role !== 'admin') {
      setLoading(false)
      return
    }

    setHasAccess(true)

    const { data, error } = await supabase
      .from('judokas')
      .select('id, user_id, first_name, last_name, email, birth_date, subscription_active, subscription_expires_at')
      .eq('role', 'judoka')
      .order('first_name')

    if (!error && data) {
      setJudokas(data)
    }

    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('sender', 'judoka')
      .is('read_at', null)
    setUnreadTotal(count ?? 0)

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
        <p className="text-red-600 text-sm mt-2">Vous devez être admin pour accéder à cette page.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0A0A0A] mb-1">Dashboard Admin</h1>
        <p className="text-[#666666]">Gestion des élèves et des interactions</p>
      </div>

      {/* Onglets */}
      <div className="flex items-center gap-1 mb-8 border-b border-[#E5E5E5]">
        <span className="px-4 py-2.5 text-sm font-semibold text-[#0A0A0A] border-b-2 border-[#C41230] -mb-px">
          Membres
        </span>
        <button
          onClick={() => navigate('/admin/messages')}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#666666] border-b-2 border-transparent hover:text-[#0A0A0A] transition-colors"
        >
          Messages
          {unreadTotal > 0 && (
            <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-[#C41230] text-white text-xs font-bold leading-none">
              {unreadTotal}
            </span>
          )}
        </button>
      </div>

      {/* Statistiques */}
      <div className="bg-white rounded-lg p-6 mb-8 border border-[#E5E5E5] shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-[#999999] text-sm uppercase tracking-widest mb-1">Total des élèves</p>
            <p className="text-4xl font-bold text-[#0A0A0A]">{judokas.length}</p>
          </div>
          <div>
            <p className="text-[#999999] text-sm uppercase tracking-widest mb-1">Abonnés actifs</p>
            <p className="text-4xl font-bold text-[#C41230]">{judokas.filter(j => j.subscription_active).length}</p>
          </div>
        </div>
      </div>

      {/* Liste des judokas */}
      <div className="bg-white rounded-lg border border-[#E5E5E5] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F5F5F5] border-b border-[#E5E5E5]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#666666] uppercase tracking-widest">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#666666] uppercase tracking-widest">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#666666] uppercase tracking-widest">Abonnement</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#666666] uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {judokas.map(judoka => (
                <tr key={judoka.id} className="hover:bg-[#F5F5F5] transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-[#0A0A0A]">
                    {judoka.first_name} {judoka.last_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#666666]">{judoka.email}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex w-fit px-2 py-1 rounded text-xs font-medium ${
                        judoka.subscription_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {judoka.subscription_active ? '✓ Actif' : 'Inactif'}
                      </span>
                      {judoka.subscription_expires_at && (
                        <span className="text-xs text-[#999999]">
                          Expire: {new Date(judoka.subscription_expires_at).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => navigate(`/admin/messages/${judoka.id}`)}
                      className="px-3 py-1.5 bg-[#C41230] hover:bg-[#9B0E25] text-white rounded text-xs font-semibold transition-colors"
                    >
                      Messagerie
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {judokas.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-[#999999]">Aucun élève inscrit</p>
          </div>
        )}
      </div>
    </div>
  )
}
