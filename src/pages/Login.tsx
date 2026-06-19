import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn, signUp } from '../lib/auth'
import { supabase } from '../lib/supabase'

type Mode = 'login' | 'signup'

export default function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [clubLogo, setClubLogo] = useState<string | null>(null)
  const [clubNom, setClubNom] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('clubs').select('nom, logo_url').limit(1).single()
      .then(({ data }) => {
        if (data) { setClubLogo(data.logo_url ?? null); setClubNom(data.nom ?? null) }
      })
  }, [])

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
        navigate('/dashboard')
      }
    } else {
      const { error } = await signUp(email, password)
      if (error) {
        setError(error.message)
        setLoading(false)
      } else {
        setSuccess('Compte créé ! Vérifiez votre email pour confirmer votre inscription.')
        setLoading(false)
      }
    }
  }

  function switchMode(m: Mode) {
    setMode(m)
    setError(null)
    setSuccess(null)
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-between px-4 py-12">
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-10">
            <img
              src={clubLogo ?? '/logo.png'}
              alt={clubNom ?? 'Hazumi'}
              className="h-20 w-20 object-contain mb-4"
            />
            {clubNom && (
              <h1 className="text-white text-xl font-bold tracking-widest uppercase">{clubNom}</h1>
            )}
            <p className="text-[#666666] text-sm tracking-wider mt-1">L'école du ippon</p>
          </div>

          <div className="flex mb-6 bg-[#1A1A1A] rounded-lg p-1">
            <button
              onClick={() => switchMode('login')}
              className={`flex-1 py-2 text-xs uppercase tracking-widest rounded-md transition-colors ${
                mode === 'login' ? 'bg-[#C41230] text-white' : 'text-[#666666] hover:text-white'
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => switchMode('signup')}
              className={`flex-1 py-2 text-xs uppercase tracking-widest rounded-md transition-colors ${
                mode === 'signup' ? 'bg-[#C41230] text-white' : 'text-[#666666] hover:text-white'
              }`}
            >
              Créer un compte
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[#999999] text-xs uppercase tracking-widest mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#C41230] transition-colors"
                placeholder="vous@email.com"
              />
            </div>
            <div>
              <label className="block text-[#999999] text-xs uppercase tracking-widest mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#C41230] transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-[#C41230] text-sm text-center">{error}</p>}
            {success && <p className="text-green-400 text-sm text-center">{success}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C41230] hover:bg-[#9B0E25] text-white font-semibold py-3 rounded-lg transition-colors text-sm uppercase tracking-widest disabled:opacity-50"
            >
              {loading
                ? '…'
                : mode === 'login'
                ? 'Se connecter'
                : 'Créer mon compte'}
            </button>
          </form>
        </div>
      </div>

      <footer className="text-center text-[#444444] text-xs leading-relaxed mt-8">
        <p>Propulsé par <span className="text-[#666666]">Hazumi</span> — L'école du Ippon</p>
        <p className="mt-1">Groupe DAKOTAlb · 59, rue de Ponthieu · 75008 Paris</p>
        <p className="mt-0.5">SIREN 951 717 925</p>
      </footer>
    </div>
  )
}
