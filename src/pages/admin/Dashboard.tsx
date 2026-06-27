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
  stripe_customer_id: string | null
  role: string
}

interface AdminUser {
  id: string
  role: string
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [judokas, setJudokas] = useState<Judoka[]>([])
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedJudoka, setSelectedJudoka] = useState<Judoka | null>(null)
  const [subscriptionExpiry, setSubscriptionExpiry] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    loadAdminCheck()
  }, [])

  async function loadAdminCheck() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      navigate('/login')
      return
    }

    const { data: judoka } = await supabase
      .from('judokas')
      .select('id, role')
      .eq('user_id', user.id)
      .single()

    if (!judoka || judoka.role !== 'admin') {
      setMessage({ type: 'error', text: 'Accès refusé. Vous devez être admin.' })
      setLoading(false)
      return
    }

    setAdminUser(judoka)
    loadJudokas()
  }

  async function loadJudokas() {
    const { data, error } = await supabase
      .from('judokas')
      .select('id, user_id, first_name, last_name, email, birth_date, subscription_active, subscription_expires_at, stripe_customer_id, role')
      .eq('role', 'judoka')
      .order('first_name')

    if (error) {
      setMessage({ type: 'error', text: `Erreur : ${error.message}` })
    } else {
      setJudokas(data || [])
    }
    setLoading(false)
  }

  async function activateSubscription(judoka: Judoka) {
    if (!subscriptionExpiry) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner une date d\'expiration' })
      return
    }

    setActionLoading(true)
    const { error } = await supabase
      .from('judokas')
      .update({
        subscription_active: true,
        subscription_expires_at: new Date(subscriptionExpiry).toISOString(),
      })
      .eq('id', judoka.id)

    if (error) {
      setMessage({ type: 'error', text: `Erreur : ${error.message}` })
    } else {
      setMessage({ type: 'success', text: 'Abonnement activé !' })
      setSubscriptionExpiry('')
      setSelectedJudoka(null)
      loadJudokas()
    }
    setActionLoading(false)
  }

  async function revokeSubscription(judoka: Judoka) {
    setActionLoading(true)
    const { error } = await supabase
      .from('judokas')
      .update({
        subscription_active: false,
        subscription_expires_at: null,
      })
      .eq('id', judoka.id)

    if (error) {
      setMessage({ type: 'error', text: `Erreur : ${error.message}` })
    } else {
      setMessage({ type: 'success', text: 'Abonnement révoqué.' })
      loadJudokas()
    }
    setActionLoading(false)
  }

  async function generatePaymentLink(judoka: Judoka) {
    if (!subscriptionExpiry) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner une date d\'expiration' })
      return
    }

    setActionLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          priceId: import.meta.env.VITE_STRIPE_PRICE_JUDOKA,
          type: 'judoka',
          judokaId: judoka.id,
        }),
      })
      const json = await res.json()
      if (json.error) {
        setMessage({ type: 'error', text: `Erreur Stripe : ${json.error}` })
      } else if (json.url) {
        const link = json.url
        navigator.clipboard.writeText(link)
        setMessage({ type: 'success', text: 'Lien copié dans le presse-papiers !' })
        setSubscriptionExpiry('')
        setSelectedJudoka(null)
      }
    } catch (err) {
      setMessage({ type: 'error', text: `Erreur : ${String(err)}` })
    }
    setActionLoading(false)
  }

  if (!adminUser) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <p className="text-white mb-4">
            {loading ? 'Vérification...' : 'Accès refusé'}
          </p>
          {message && (
            <div className={`p-3 rounded text-sm ${message.type === 'error' ? 'bg-red-900 text-white' : 'bg-green-900 text-white'}`}>
              {message.text}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard Admin</h1>
        <p className="text-[#999999] mb-6">Gestion des abonnements</p>

        {message && (
          <div className={`p-4 rounded-lg mb-6 ${message.type === 'error' ? 'bg-red-900/30 border border-red-700 text-red-200' : 'bg-green-900/30 border border-green-700 text-green-200'}`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Liste des judokas */}
          <div className="lg:col-span-2 bg-[#1a1a1a] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Judokas ({judokas.length})</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {judokas.map(judoka => (
                <div
                  key={judoka.id}
                  onClick={() => setSelectedJudoka(judoka)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedJudoka?.id === judoka.id
                      ? 'bg-[#C41230] text-white'
                      : 'bg-[#0A0A0A] text-white hover:bg-[#333333]'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{judoka.first_name} {judoka.last_name}</p>
                      <p className="text-xs opacity-75">{judoka.email}</p>
                    </div>
                    <div className="text-right text-xs">
                      {judoka.subscription_active ? (
                        <span className="bg-green-600 px-2 py-1 rounded">Actif</span>
                      ) : (
                        <span className="bg-gray-600 px-2 py-1 rounded">Inactif</span>
                      )}
                    </div>
                  </div>
                  {judoka.subscription_expires_at && (
                    <p className="text-xs mt-2 opacity-75">
                      Expire: {new Date(judoka.subscription_expires_at).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Formulaire d'action */}
          <div className="bg-[#1a1a1a] rounded-lg p-6 h-fit">
            <h2 className="text-xl font-semibold text-white mb-4">Actions</h2>
            {selectedJudoka ? (
              <div className="space-y-4">
                <div>
                  <p className="text-white font-semibold mb-2">{selectedJudoka.first_name} {selectedJudoka.last_name}</p>
                  <p className="text-[#999999] text-sm mb-4">{selectedJudoka.email}</p>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#999999] mb-2">
                    Date d'expiration
                  </label>
                  <input
                    type="date"
                    value={subscriptionExpiry}
                    onChange={(e) => setSubscriptionExpiry(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#E5E5E5] rounded px-3 py-2 text-white text-sm"
                  />
                </div>

                {selectedJudoka.subscription_active ? (
                  <button
                    onClick={() => revokeSubscription(selectedJudoka)}
                    disabled={actionLoading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded text-sm font-semibold disabled:opacity-50"
                  >
                    {actionLoading ? '…' : 'Révoquer abonnement'}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => activateSubscription(selectedJudoka)}
                      disabled={actionLoading || !subscriptionExpiry}
                      className="w-full bg-[#C41230] hover:bg-[#9B0E25] text-white py-2 rounded text-sm font-semibold disabled:opacity-50"
                    >
                      {actionLoading ? '…' : 'Activer abonnement'}
                    </button>
                    <button
                      onClick={() => generatePaymentLink(selectedJudoka)}
                      disabled={actionLoading || !subscriptionExpiry}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-semibold disabled:opacity-50"
                    >
                      {actionLoading ? '…' : 'Copier lien Stripe'}
                    </button>
                  </>
                )}
              </div>
            ) : (
              <p className="text-[#999999] text-sm">Sélectionnez un judoka</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
