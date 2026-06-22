import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'request' | 'update' | 'done'>('request')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Si l'utilisateur arrive via le lien de reset (token dans l'URL hash)
  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setMode('update')
    })
  }, [])

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    setSuccess('Un email vous a été envoyé. Cliquez sur le lien pour choisir un nouveau mot de passe.')
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return }
    if (password.length < 6) { setError('Le mot de passe doit faire au moins 6 caractères.'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) { setError(error.message); return }
    setMode('done')
    setTimeout(() => navigate('/login'), 2500)
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <img src="/logo.png" alt="Hazumi" className="h-16 w-16 object-contain mb-4" />
          <h1 className="text-white text-lg font-bold tracking-widest uppercase">Hazumi</h1>
        </div>

        <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6">
          {mode === 'request' && (
            <>
              <h2 className="text-white font-semibold mb-1">Mot de passe oublié</h2>
              <p className="text-[#666666] text-xs mb-5">Entrez votre email pour recevoir un lien de réinitialisation.</p>
              {success ? (
                <p className="text-green-400 text-sm text-center leading-relaxed">{success}</p>
              ) : (
                <form onSubmit={handleRequest} className="space-y-4">
                  <div>
                    <label className="block text-[#999999] text-xs uppercase tracking-widest mb-2">Email</label>
                    <input
                      type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#C41230] transition-colors"
                      placeholder="vous@email.com"
                    />
                  </div>
                  {error && <p className="text-[#C41230] text-sm">{error}</p>}
                  <button type="submit" disabled={loading}
                    className="w-full bg-[#C41230] hover:bg-[#9B0E25] text-white font-semibold py-3 rounded-lg text-sm transition-colors disabled:opacity-50">
                    {loading ? '…' : 'Envoyer le lien'}
                  </button>
                </form>
              )}
            </>
          )}

          {mode === 'update' && (
            <>
              <h2 className="text-white font-semibold mb-1">Nouveau mot de passe</h2>
              <p className="text-[#666666] text-xs mb-5">Choisissez un mot de passe d'au moins 6 caractères.</p>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-[#999999] text-xs uppercase tracking-widest mb-2">Nouveau mot de passe</label>
                  <input
                    type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#C41230] transition-colors"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-[#999999] text-xs uppercase tracking-widest mb-2">Confirmer</label>
                  <input
                    type="password" required value={confirm} onChange={e => setConfirm(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#C41230] transition-colors"
                    placeholder="••••••••"
                  />
                </div>
                {error && <p className="text-[#C41230] text-sm">{error}</p>}
                <button type="submit" disabled={loading}
                  className="w-full bg-[#C41230] hover:bg-[#9B0E25] text-white font-semibold py-3 rounded-lg text-sm transition-colors disabled:opacity-50">
                  {loading ? '…' : 'Enregistrer le mot de passe'}
                </button>
              </form>
            </>
          )}

          {mode === 'done' && (
            <div className="text-center py-4">
              <p className="text-green-400 text-sm mb-2">✓ Mot de passe mis à jour !</p>
              <p className="text-[#666666] text-xs">Redirection vers la page de connexion…</p>
            </div>
          )}
        </div>

        <button onClick={() => navigate('/login')} className="mt-4 w-full text-[#666666] text-xs hover:text-white transition-colors text-center">
          ← Retour à la connexion
        </button>
      </div>
    </div>
  )
}
