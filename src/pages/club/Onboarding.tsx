import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

interface ClubForm {
  nom: string
  adresse: string
  email_contact: string
  nom_representant: string
}

const EMPTY: ClubForm = { nom: '', adresse: '', email_contact: '', nom_representant: '' }

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'infos' | 'dpa'>('infos')
  const [form, setForm] = useState<ClubForm>(EMPTY)
  const [dpaAccepted, setDpaAccepted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clubId, setClubId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: judoka } = await supabase.from('judokas').select('club_id').eq('user_id', user.id).single()
      if (judoka?.club_id) {
        const { data: club } = await supabase.from('clubs').select('*').eq('id', judoka.club_id).single()
        if (club) {
          setClubId(club.id)
          setForm({
            nom: club.nom ?? '',
            adresse: club.adresse ?? '',
            email_contact: club.email_contact ?? '',
            nom_representant: club.nom_representant ?? '',
          })
          if (club.dpa_accepted_at) navigate('/club/effectifs', { replace: true })
        }
      } else {
        const { data: club } = await supabase.from('clubs').select('id, nom, adresse, email_contact, nom_representant, dpa_accepted_at').limit(1).single()
        if (club) {
          setClubId(club.id)
          setForm({
            nom: club.nom ?? '',
            adresse: club.adresse ?? '',
            email_contact: club.email_contact ?? '',
            nom_representant: club.nom_representant ?? '',
          })
          if (club.dpa_accepted_at) navigate('/club/effectifs', { replace: true })
        }
      }
    }
    load()
  }, [navigate])

  async function handleSaveInfos(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nom || !form.email_contact || !form.nom_representant) return
    setSaving(true)
    setError(null)
    if (clubId) {
      const { error } = await supabase.from('clubs').update({
        nom: form.nom,
        adresse: form.adresse,
        email_contact: form.email_contact,
        nom_representant: form.nom_representant,
      }).eq('id', clubId)
      if (error) { setError(error.message); setSaving(false); return }
    } else {
      const { data, error } = await supabase.from('clubs').insert({
        nom: form.nom,
        adresse: form.adresse,
        email_contact: form.email_contact,
        nom_representant: form.nom_representant,
      }).select('id').single()
      if (error || !data) { setError(error?.message ?? 'Erreur'); setSaving(false); return }
      setClubId(data.id)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) await supabase.from('judokas').update({ club_id: data.id }).eq('user_id', user.id)
    }
    setSaving(false)
    setStep('dpa')
  }

  async function handleAcceptDpa() {
    if (!dpaAccepted || !clubId) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('clubs').update({
      dpa_accepted_at: new Date().toISOString(),
      dpa_accepted_by: user?.id,
    }).eq('id', clubId)
    setSaving(false)
    if (error) { setError(error.message); return }
    navigate('/club/effectifs', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-3 mb-8">
          <img src="/logo.png" alt="Hazumi" className="h-10 w-10 object-contain" />
          <div>
            <h1 className="text-xl font-bold text-[#0A0A0A]">Configuration du club</h1>
            <p className="text-sm text-[#999999]">Étape {step === 'infos' ? '1' : '2'} / 2</p>
          </div>
        </div>

        <div className="flex gap-2 mb-8">
          {(['infos', 'dpa'] as const).map((s) => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${step === s || (s === 'infos' && step === 'dpa') ? 'bg-[#C41230]' : 'bg-[#E5E5E5]'}`} />
          ))}
        </div>

        {step === 'infos' ? (
          <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6">
            <h2 className="font-semibold text-[#0A0A0A] mb-1">Informations du club</h2>
            <p className="text-sm text-[#999999] mb-6">Ces informations apparaîtront dans la politique de confidentialité remise à vos judokas.</p>
            <form onSubmit={handleSaveInfos} className="space-y-4">
              <Field label="Nom du club *">
                <input required type="text" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })}
                  placeholder="Ex : Judo Club de Paris" className={inp} />
              </Field>
              <Field label="Adresse">
                <input type="text" value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })}
                  placeholder="12 rue du Tatami, 75001 Paris" className={inp} />
              </Field>
              <Field label="Email de contact *">
                <input required type="email" value={form.email_contact} onChange={e => setForm({ ...form, email_contact: e.target.value })}
                  placeholder="contact@monclub.fr" className={inp} />
              </Field>
              <Field label="Nom du représentant légal *">
                <input required type="text" value={form.nom_representant} onChange={e => setForm({ ...form, nom_representant: e.target.value })}
                  placeholder="Prénom Nom (Président ou Directeur technique)" className={inp} />
              </Field>
              {error && <p className="text-xs text-[#C41230]">{error}</p>}
              <button type="submit" disabled={saving}
                className="w-full bg-[#C41230] hover:bg-[#9B0E25] text-white py-3 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
                {saving ? 'Enregistrement…' : 'Continuer →'}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6">
            <h2 className="font-semibold text-[#0A0A0A] mb-1">Contrat de sous-traitance de données</h2>
            <p className="text-sm text-[#999999] mb-5">Conformément à l'article 28 du RGPD, ce contrat encadre le traitement des données personnelles de vos judokas par Hazumi.</p>

            <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl p-4 max-h-72 overflow-y-auto text-xs text-[#666666] space-y-3 mb-5">
              <p className="font-semibold text-[#0A0A0A] text-sm">Contrat de sous-traitance de données personnelles (Article 28 RGPD)</p>

              <p><strong>Responsable de traitement :</strong> {form.nom}, représenté par {form.nom_representant || '[représentant]'}, ci-après « le Club ».</p>
              <p><strong>Sous-traitant :</strong> Hazumi, éditeur de la plateforme de suivi technique pour clubs de judo, ci-après « Hazumi ».</p>

              <p className="font-semibold text-[#0A0A0A]">1. Objet</p>
              <p>Hazumi traite des données personnelles (nom, prénom, date de naissance, email, numéro de licence, progression technique, documents d'inscription) pour le compte du Club, dans le cadre de l'exploitation de la plateforme Hazumi.</p>

              <p className="font-semibold text-[#0A0A0A]">2. Nature des traitements</p>
              <p>Gestion des profils judokas, suivi de progression technique, gestion de la bibliothèque vidéo, planification des séances, communication interne au club.</p>

              <p className="font-semibold text-[#0A0A0A]">3. Obligations de Hazumi (sous-traitant)</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Traiter les données uniquement sur instruction documentée du Club.</li>
                <li>Garantir la confidentialité des données traitées.</li>
                <li>Ne pas sous-traiter sans accord préalable écrit du Club.</li>
                <li>Mettre en œuvre les mesures de sécurité appropriées (chiffrement, contrôle d'accès, sauvegardes).</li>
                <li>Supprimer ou restituer toutes les données à l'issue du contrat.</li>
                <li>Notifier le Club sans délai de tout incident de sécurité.</li>
              </ul>

              <p className="font-semibold text-[#0A0A0A]">4. Obligations du Club (responsable de traitement)</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Disposer d'une base légale pour chaque traitement.</li>
                <li>Informer les personnes concernées de leurs droits.</li>
                <li>Répondre aux demandes d'exercice des droits des personnes.</li>
              </ul>

              <p className="font-semibold text-[#0A0A0A]">5. Durée</p>
              <p>Ce contrat est conclu pour la durée de l'abonnement du Club à la plateforme Hazumi. En cas de résiliation, Hazumi s'engage à supprimer les données dans un délai de 30 jours.</p>

              <p className="font-semibold text-[#0A0A0A]">6. Hébergement et transferts</p>
              <p>Les données sont hébergées par Supabase (UE/US — Privacy Shield). Aucun transfert hors UE n'est effectué sans garanties appropriées.</p>

              <p className="font-semibold text-[#0A0A0A]">7. Droit applicable</p>
              <p>Ce contrat est soumis au droit français et au RGPD (UE) 2016/679.</p>
            </div>

            <label className="flex items-start gap-3 cursor-pointer mb-5">
              <input type="checkbox" checked={dpaAccepted} onChange={e => setDpaAccepted(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[#C41230] flex-shrink-0" />
              <span className="text-sm text-[#333333]">
                En tant que représentant légal de <strong>{form.nom}</strong>, j'ai lu et j'accepte le{' '}
                <Link to="/dpa" target="_blank" className="text-[#C41230] hover:underline">
                  contrat de sous-traitance de données
                </Link>
                {' '}ci-dessus. J'atteste être habilité(e) à engager mon organisation.
              </span>
            </label>

            {error && <p className="text-xs text-[#C41230] mb-3">{error}</p>}

            <div className="flex gap-3">
              <button onClick={() => setStep('infos')} className="flex-1 border border-[#E5E5E5] text-[#666666] py-3 rounded-lg text-sm">
                ← Retour
              </button>
              <button onClick={handleAcceptDpa} disabled={!dpaAccepted || saving}
                className="flex-1 bg-[#C41230] hover:bg-[#9B0E25] text-white py-3 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40">
                {saving ? 'Enregistrement…' : 'Valider et accéder au club'}
              </button>
            </div>
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
