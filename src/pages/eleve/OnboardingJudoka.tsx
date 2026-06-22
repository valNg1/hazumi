import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { CURRICULUM } from '../../lib/curriculum'
import type { Belt } from '../../types'

type Step = 'identite' | 'grade'

const BELTS: { value: Belt; label: string; color: string }[] = [
  { value: 'blanche',  label: 'Blanche',  color: '#E5E5E5' },
  { value: 'jaune',    label: 'Jaune',    color: '#FFD700' },
  { value: 'orange',   label: 'Orange',   color: '#FF8C00' },
  { value: 'verte',    label: 'Verte',    color: '#228B22' },
  { value: 'bleue',    label: 'Bleue',    color: '#1565C0' },
  { value: 'marron',   label: 'Marron',   color: '#6D3B1E' },
  { value: 'noire',    label: 'Noire (1er Dan)', color: '#0A0A0A' },
  { value: 'noire-2',  label: 'Noire (2e Dan)',  color: '#0A0A0A' },
  { value: 'noire-3',  label: 'Noire (3e Dan)',  color: '#0A0A0A' },
  { value: 'noire-4',  label: 'Noire (4e Dan)',  color: '#0A0A0A' },
  { value: 'noire-5',  label: 'Noire (5e Dan)',  color: '#0A0A0A' },
]

export default function OnboardingJudoka() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('identite')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [belt, setBelt] = useState<Belt | ''>('')
  const [objectif, setObjectif] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleIdentite(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim()) return
    setStep('grade')
  }

  async function handleFinish(e: React.FormEvent) {
    e.preventDefault()
    if (!belt) return
    setSaving(true)
    setError(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Session expirée, reconnectez-vous.'); setSaving(false); return }
    const nextBeltIndex = belt ? (CURRICULUM.findIndex(c => c.belt === belt) + 1) : -1
    const nextBelt = nextBeltIndex > 0 && nextBeltIndex < CURRICULUM.length ? CURRICULUM[nextBeltIndex].belt : null
    const { error } = await supabase.from('judokas').update({
      full_name: fullName.trim(),
      phone: phone.trim() || null,
      belt,
      objectif: objectif.trim() || (nextBelt ? `Obtenir la ceinture ${nextBelt}` : null),
    }).eq('user_id', user.id)
    setSaving(false)
    if (error) { setError(error.message); return }
    navigate('/eleve/accueil', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <img src="/logo.png" alt="Hazumi" className="h-10 w-10 object-contain" />
          <div>
            <h1 className="text-xl font-bold text-[#0A0A0A]">Bienvenue sur Hazumi</h1>
            <p className="text-sm text-[#999999]">Étape {step === 'identite' ? '1' : '2'} / 2 — Quelques infos pour démarrer</p>
          </div>
        </div>

        <div className="flex gap-2 mb-8">
          {(['identite', 'grade'] as Step[]).map(s => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${s === 'identite' || step === 'grade' ? 'bg-[#C41230]' : 'bg-[#E5E5E5]'}`} />
          ))}
        </div>

        {step === 'identite' ? (
          <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6">
            <h2 className="font-semibold text-[#0A0A0A] mb-1">Votre identité</h2>
            <p className="text-sm text-[#999999] mb-6">Ces informations resteront dans votre dossier de club.</p>
            <form onSubmit={handleIdentite} className="space-y-4">
              <Field label="Nom complet *">
                <input
                  required type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                  placeholder="Prénom NOM" className={inp}
                />
              </Field>
              <Field label="Téléphone">
                <input
                  type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="06 00 00 00 00" className={inp}
                />
              </Field>
              <button type="submit"
                className="w-full bg-[#C41230] hover:bg-[#9B0E25] text-white py-3 rounded-lg text-sm font-semibold transition-colors">
                Continuer →
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6">
            <h2 className="font-semibold text-[#0A0A0A] mb-1">Votre niveau</h2>
            <p className="text-sm text-[#999999] mb-5">Choisissez votre ceinture actuelle.</p>
            <form onSubmit={handleFinish} className="space-y-5">
              <div>
                <label className="block text-xs text-[#666666] mb-3">Ceinture actuelle *</label>
                <div className="grid grid-cols-2 gap-2">
                  {BELTS.map(b => (
                    <button
                      key={b.value}
                      type="button"
                      onClick={() => setBelt(b.value)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm transition-all ${
                        belt === b.value
                          ? 'border-[#C41230] bg-[#FFF5F6] text-[#0A0A0A] font-semibold'
                          : 'border-[#E5E5E5] text-[#666666] hover:border-[#CCCCCC]'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full border border-[#E5E5E5] flex-shrink-0" style={{ backgroundColor: b.color }} />
                      <span className="truncate">{b.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Field label="Mon objectif (optionnel)">
                <input
                  type="text" value={objectif} onChange={e => setObjectif(e.target.value)}
                  placeholder="Ex: Obtenir la ceinture verte" className={inp}
                />
              </Field>

              {error && <p className="text-xs text-[#C41230]">{error}</p>}

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep('identite')}
                  className="flex-1 border border-[#E5E5E5] text-[#666666] py-3 rounded-lg text-sm">
                  ← Retour
                </button>
                <button type="submit" disabled={!belt || saving}
                  className="flex-1 bg-[#C41230] hover:bg-[#9B0E25] text-white py-3 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40">
                  {saving ? 'Enregistrement…' : 'Accéder à mon espace'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-xs text-[#666666] mb-1.5">{label}</label>{children}</div>
}

const inp = 'w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg px-3 py-2.5 text-sm text-[#0A0A0A] focus:outline-none focus:border-[#C41230] transition-colors'
