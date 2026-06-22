import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signIn, signUp } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { useClubIdentity } from '../lib/useClubIdentity'
import Footer from '../components/Footer'

type Mode = 'login' | 'signup' | 'forgot'

function isMinorAge(birthDate: string): boolean {
  if (!birthDate) return false
  const birth = new Date(birthDate)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--
  return age < 15
}

export default function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [clubCode, setClubCode] = useState('')
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [guardianConfirmed, setGuardianConfirmed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { logo, clubNom } = useClubIdentity()

  const minor = mode === 'signup' && isMinorAge(birthDate)

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
    if (!clubCode.trim()) {
      setError('Entrez le code de votre club (fourni par votre responsable).')
      setLoading(false)
      return
    }
    if (!privacyAccepted) {
      setError('Vous devez accepter la politique de confidentialité.')
      setLoading(false)
      return
    }
    if (minor && !guardianConfirmed) {
      setError('La confirmation du parent ou tuteur légal est requise pour les moins de 15 ans.')
      setLoading(false)
      return
    }

    const { data: clubData, error: clubError } = await supabase
      .from('clubs')
      .select('id')
      .eq('code_invitation', clubCode.trim().toUpperCase())
      .single()
    if (clubError || !clubData) {
      setError('Code club invalide. Vérifiez auprès de votre responsable.')
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
        email,
        birth_date: birthDate || null,
        club_id: clubData.id,
        is_minor: minor,
        guardian_confirmed: minor ? guardianConfirmed : false,
        privacy_accepted_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
    }

    setSuccess('Compte créé ! Vérifiez votre email pour confirmer votre inscription, puis connectez-vous.')
    setLoading(false)
  }

  function switchMode(m: Mode) {
    setMode(m)
    setError(null)
    setSuccess(null)
    setPrivacyAccepted(false)
    setGuardianConfirmed(false)
    setBirthDate('')
    setClubCode('')
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-between px-4 py-12">
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-10">
            <img src={logo} alt={clubNom ?? 'Hazumi'} className="h-20 w-20 object-contain mb-4" />
            {clubNom && <h1 className="text-white text-xl font-bold tracking-widest uppercase">{clubNom}</h1>}
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
                    <label className="block text-[#999999] text-xs uppercase tracking-widest mb-2">Code du club *</label>
                    <input type="text" value={clubCode} onChange={e => setClubCode(e.target.value.toUpperCase())} required
                      maxLength={6} placeholder="Ex: AB12CD"
                      className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#C41230] transition-colors tracking-widest font-mono" />
                    <p className="text-[#444444] text-xs mt-1">Fourni par votre responsable de club.</p>
                  </div>
                  <div>
                    <label className="block text-[#999999] text-xs uppercase tracking-widest mb-2">Date de naissance</label>
                    <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)}
                      className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#C41230] transition-colors" />
                  </div>

                  {minor && (
                    <div className="bg-amber-900/20 border border-amber-700/40 rounded-lg p-3">
                      <p className="text-amber-400 text-xs mb-2 font-medium">⚠ Judoka de moins de 15 ans</p>
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input type="checkbox" checked={guardianConfirmed} onChange={e => setGuardianConfirmed(e.target.checked)}
                          className="mt-0.5 w-4 h-4 accent-[#C41230] flex-shrink-0" />
                        <span className="text-amber-200 text-xs leading-relaxed">
                          Je confirme créer ce compte en tant que parent ou tuteur légal de ce judoka mineur et consent au traitement de ses données personnelles.
                        </span>
                      </label>
                    </div>
                  )}

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" checked={privacyAccepted} onChange={e => setPrivacyAccepted(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-[#C41230] flex-shrink-0" />
                    <span className="text-[#999999] text-xs leading-relaxed">
                      J'ai lu et j'accepte la{' '}
                      <Link to="/confidentialite" target="_blank" className="text-[#C41230] hover:underline">
                        politique de confidentialité
                      </Link>
                      {' '}du club.
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
