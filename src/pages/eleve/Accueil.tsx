import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

interface Step {
  id: string
  label: string
  description: string
  to: string
  done: boolean
}

export default function Accueil() {
  const navigate = useNavigate()
  const [steps, setSteps] = useState<Step[]>([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: j } = await supabase.from('judokas').select('*').eq('user_id', user.id).single()

      setName(j?.full_name ?? '')
      setSteps([
        {
          id: 'profil',
          label: 'Compléter mon profil',
          description: 'Nom, date de naissance, téléphone, photo',
          to: '/eleve/profil',
          done: !!(j?.full_name && j?.birth_date && j?.phone),
        },
        {
          id: 'certif',
          label: 'Déposer mon certificat médical',
          description: 'PDF ou photo du certificat (moins d\'un an)',
          to: '/eleve/profil',
          done: !!j?.cert_medical_url,
        },
        {
          id: 'virement',
          label: 'Déposer ma preuve de virement',
          description: 'Justificatif du paiement de la cotisation',
          to: '/eleve/profil',
          done: !!j?.virement_url,
        },
      ])
      setLoading(false)
    }
    load()
  }, [])

  const done = steps.filter(s => s.done).length
  const total = steps.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  const complet = done === total

  if (loading) return <div className="text-center py-16 text-[#999999] text-sm">Chargement…</div>

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">
          {name ? `Bonjour, ${name.split(' ')[0]} 👋` : 'Bienvenue sur Hazumi'}
        </h1>
        <p className="text-[#666666] text-sm mt-1">
          {complet ? 'Votre dossier d\'inscription est complet ✓' : 'Complétez votre dossier d\'inscription pour septembre.'}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E5E5] p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase tracking-widest text-[#999999]">Dossier d'inscription</span>
          <span className={`text-xs font-semibold ${complet ? 'text-green-600' : 'text-amber-600'}`}>{done}/{total}</span>
        </div>
        <div className="h-2 bg-[#F0F0F0] rounded-full overflow-hidden mb-6">
          <div
            className={`h-full rounded-full transition-all duration-500 ${complet ? 'bg-green-500' : 'bg-[#C41230]'}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="space-y-3">
          {steps.map((step, i) => (
            <div
              key={step.id}
              onClick={() => !step.done && navigate(step.to)}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                step.done
                  ? 'border-green-100 bg-green-50 cursor-default'
                  : 'border-[#F0F0F0] hover:border-[#C41230] cursor-pointer group'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold transition-colors ${
                step.done ? 'bg-green-500 text-white' : 'bg-[#F5F5F5] text-[#CCCCCC] group-hover:bg-[#C41230] group-hover:text-white'
              }`}>
                {step.done
                  ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  : i + 1
                }
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${step.done ? 'text-green-700 line-through' : 'text-[#0A0A0A]'}`}>{step.label}</p>
                <p className="text-xs text-[#999999] mt-0.5">{step.description}</p>
              </div>
              {!step.done && (
                <svg className="w-4 h-4 text-[#CCCCCC] group-hover:text-[#C41230] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>

      {complet && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
          <p className="text-green-700 font-medium text-sm">Dossier complet — le bureau a bien reçu vos documents.</p>
          <p className="text-green-600 text-xs mt-1">Vous serez contacté pour confirmation.</p>
        </div>
      )}
    </div>
  )
}
