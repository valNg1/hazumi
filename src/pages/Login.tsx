import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signIn, signUp } from '../lib/auth'
import { supabase } from '../lib/supabase'
import Footer from '../components/Footer'

type Mode = 'login' | 'signup' | 'forgot'

export default function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('login')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    if (mode === 'login') {
      const { error } = await signIn(email, password)
      if (error) {
        setError('Email ou mot de passe incorrect.')
        setLoading(false)
      } else {
        navigate('/')
      }
      return
    }

    if (mode === 'forgot') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      setLoading(false)
      if (error) { setError(error.message); return }
      setSuccess('Email envoyé ! Cliquez sur le lien dans votre boîte mail pour choisir un nouveau mot de passe.')
      return
    }

    // signup
    if (!firstName.trim() || !lastName.trim()) {
      setError('Nom et prénom requis.')
      setLoading(false)
      return
    }
    if (!privacyAccepted) {
      setError('Vous devez accepter la politique de confidentialité.')
      setLoading(false)
      return
    }

    const { data, error: signUpError } = await signUp(email, password)
    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      await supabase.from('judokas').upsert({
        user_id: data.user.id,
        first_name: firstName,
        last_name: lastName,
        birth_date: birthDate || null,
        subscription_active: false,
      }, { onConflict: 'user_id' })
    }

    setSuccess('Compte créé ! Vérifiez votre email pour confirmer votre inscription. Vous serez redirigé vers le paiement (1€/mois).')
    setLoading(false)
    setTimeout(() => navigate('/eleve/onboarding'), 2000)
  }

  function switchMode(m: Mode) {
    setMode(m)
    setError(null)
    setSuccess(null)
    setPrivacyAccepted(false)
    setFirstName('')
    setLastName('')
    setBirthDate('')
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-between px-4 py-12">
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-10">
            <img src="/logo.png" alt="Hazumi" className="h-20 w-20 object-contain mb-4" />
          </div>

          {mode !== 'forgot' && (
            <div className="flex mb-6 bg-[#1A1A1A] rounded-lg p-1">
              <button onClick={() => switchMode('login')}
                className={`flex-1 py-2 text-xs uppercase tracking-widest rounded-md transition-colors ${mode === 'login' ? 'bg-[#C41230] text-white' : 'text-[#666666] hover:text-white'}`}>
                Connexion
              </button>
              <button onClick={() => switchMode('signup')}
                className={`flex-1 py-2 text-xs uppercase tracking-widest rounded-md transition-colors ${mode === 'signup' ? 'bg-[#C41230] text-white' : 'text-[#666666] hover:text-white'}`}>
                Créer un compte
              </button>
            </div>
          )}

          {mode === 'forgot' ? (
            <div>
              <p className="text-[#666666] text-xs mb-5">Entrez votre email pour recevoir un lien de réinitialisation.</p>
              {success ? (
                <p className="text-green-400 text-sm text-center leading-relaxed">{success}</p>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[#999999] text-xs uppercase tracking-widest mb-2">Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                      className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#C41230] transition-colors"
                      placeholder="vous@email.com" />
                  </div>
                  {error && <p className="text-[#C41230] text-sm text-center">{error}</p>}
                  <button type="submit" disabled={loading}
                    className="w-full bg-[#C41230] hover:bg-[#9B0E25] text-white font-semibold py-3 rounded-lg transition-colors text-sm disabled:opacity-50">
                    {loading ? '…' : 'Envoyer le lien'}
                  </button>
                </form>
              )}
              <button onClick={() => switchMode('login')} className="mt-4 w-full text-[#666666] text-xs hover:text-white transition-colors text-center">
                ← Retour à la connexion
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#999999] text-xs uppercase tracking-widest mb-2">Prénom</label>
                      <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required={mode === 'signup'}
                        className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#C41230] transition-colors"
                        placeholder="Jean" />
                    </div>
                    <div>
                      <label className="block text-[#999999] text-xs uppercase tracking-widest mb-2">Nom</label>
                      <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required={mode === 'signup'}
                        className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#C41230] transition-colors"
                        placeholder="Dupont" />
                    </div>
                  </div>
                </>
              )}
              <div>
                <label className="block text-[#999999] text-xs uppercase tracking-widest mb-2">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#C41230] transition-colors"
                  placeholder="vous@email.com" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[#999999] text-xs uppercase tracking-widest">Mot de passe</label>
                  {mode === 'login' && (
                    <button type="button" onClick={() => switchMode('forgot')} className="text-[#666666] text-xs hover:text-[#C41230] transition-colors">
                      Mot de passe oublié ?
                    </button>
                  )}
                </div>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                  className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#C41230] transition-colors"
                  placeholder="••••••••" />
              </div>

              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block text-[#999999] text-xs uppercase tracking-widest mb-2">Date de naissance</label>
                    <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)}
                      className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#C41230] transition-colors" />
                  </div>

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" checked={privacyAccepted} onChange={e => setPrivacyAccepted(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-[#C41230] flex-shrink-0" />
                    <span className="text-[#999999] text-xs leading-relaxed">
                      J'ai lu et j'accepte la{' '}
                      <Link to="/confidentialite" target="_blank" className="text-[#C41230] hover:underline">
                        politique de confidentialité
                      </Link>
                      {' '}et les{' '}
                      <Link to="/cgu" target="_blank" className="text-[#C41230] hover:underline">
                        conditions générales d'utilisation
                      </Link>.
                    </span>
                  </label>
                </>
              )}

              {error && <p className="text-[#C41230] text-sm text-center">{error}</p>}
              {success && <p className="text-green-400 text-sm text-center">{success}</p>}

              <button type="submit" disabled={loading}
                className="w-full bg-[#C41230] hover:bg-[#9B0E25] text-white font-semibold py-3 rounded-lg transition-colors text-sm uppercase tracking-widest disabled:opacity-50">
                {loading ? '…' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
              </button>
            </form>
          )}
        </div>
      </div>
      <Footer dark />
    </div>
  )
}
