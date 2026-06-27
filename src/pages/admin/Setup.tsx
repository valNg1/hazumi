import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const SETUP_SECRET = 'hazumi-admin-2025' // À changer en production

export default function AdminSetup() {
  const navigate = useNavigate()
  const [secret, setSecret] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  async function handleSetupAdmin() {
    if (!secret) {
      setMessage({ type: 'error', text: 'Veuillez entrer le code secret' })
      return
    }

    if (secret !== SETUP_SECRET) {
      setMessage({ type: 'error', text: 'Code secret incorrect' })
      return
    }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setMessage({ type: 'error', text: 'Vous devez être connecté' })
        setLoading(false)
        return
      }

      const { error } = await supabase
        .from('judokas')
        .update({ role: 'admin' })
        .eq('user_id', user.id)

      if (error) {
        setMessage({ type: 'error', text: `Erreur : ${error.message}` })
      } else {
        setMessage({ type: 'success', text: 'Vous êtes maintenant admin ! Redirection...' })
        setTimeout(() => navigate('/admin/dashboard'), 2000)
      }
    } catch (err) {
      setMessage({ type: 'error', text: `Erreur : ${String(err)}` })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-[#1a1a1a] rounded-lg p-8">
        <h1 className="text-2xl font-bold text-white mb-2">Setup Admin</h1>
        <p className="text-[#999999] text-sm mb-6">Initialiser le compte admin</p>

        {message && (
          <div className={`p-3 rounded-lg mb-6 text-sm ${message.type === 'error' ? 'bg-red-900/30 border border-red-700 text-red-200' : 'bg-green-900/30 border border-green-700 text-green-200'}`}>
            {message.text}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#999999] mb-2">
              Code secret
            </label>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Entrez le code"
              className="w-full bg-[#0A0A0A] border border-[#E5E5E5] rounded px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#C41230]"
            />
          </div>

          <button
            onClick={handleSetupAdmin}
            disabled={loading || !secret}
            className="w-full bg-[#C41230] hover:bg-[#9B0E25] text-white py-2.5 rounded font-semibold text-sm disabled:opacity-50 transition-colors"
          >
            {loading ? '…' : 'Devenir admin'}
          </button>
        </div>

        <p className="text-[#999999] text-xs mt-6 text-center">
          N'utilisez ce formulaire qu'une seule fois pour initialiser l'admin
        </p>
      </div>
    </div>
  )
}
