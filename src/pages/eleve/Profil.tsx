import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { Belt } from '../../types'

const TRANCHES: [string, number, number, string][] = [
  ['poussins', 8, 9, '8–9 ans'], ['benjamins', 10, 11, '10–11 ans'], ['minimes', 12, 13, '12–13 ans'],
  ['cadets', 14, 15, '14–15 ans'], ['juniors', 16, 20, '16–20 ans'], ['seniors', 21, 34, '21–34 ans'], ['vétérans', 35, 99, '35 ans et +'],
]

function getAgeCategory(birthDate: string): string {
  const birth = new Date(birthDate)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age--
  for (const [cat, min, max] of TRANCHES) if (age >= min && age <= max) return cat
  return 'seniors'
}

function getAgeCategoryLabel(birthDate: string): string {
  const cat = getAgeCategory(birthDate)
  return TRANCHES.find(t => t[0] === cat)?.[3] ?? ''
}

const BELTS: { value: Belt; label: string; color: string }[] = [
  { value: 'blanche', label: 'Blanche', color: '#FFFFFF' },
  { value: 'jaune', label: 'Jaune', color: '#FFD700' },
  { value: 'orange', label: 'Orange', color: '#FF8C00' },
  { value: 'verte', label: 'Verte', color: '#228B22' },
  { value: 'bleue', label: 'Bleue', color: '#1565C0' },
  { value: 'marron', label: 'Marron', color: '#6D3B1E' },
  { value: 'noire', label: 'Noire 1er Dan', color: '#0A0A0A' },
  { value: 'noire-2', label: 'Noire 2e Dan', color: '#0A0A0A' },
  { value: 'noire-3', label: 'Noire 3e Dan', color: '#0A0A0A' },
  { value: 'noire-4', label: 'Noire 4e Dan', color: '#0A0A0A' },
  { value: 'noire-5', label: 'Noire 5e Dan', color: '#0A0A0A' },
]

interface ProfilData {
  full_name: string
  belt: Belt
  birth_date: string
  license_number: string
  email: string
  phone: string
  objectif: string
  photo_url?: string
  cert_medical_url?: string
  cert_medical_ok?: boolean
  subscription_active?: boolean
}

const EMPTY: ProfilData = {
  full_name: '', belt: 'blanche', birth_date: '',
  license_number: '', email: '', phone: '', objectif: '',
}

export default function Profil() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [_judokaId, setJudokaId] = useState<string | null>(null)
  const [data, setData] = useState<ProfilData>(EMPTY)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [justPaid, setJustPaid] = useState(false)
  const photoRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Retour depuis Stripe Checkout
    if (searchParams.get('payment') === 'success') {
      setJustPaid(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: judoka } = await supabase.from('judokas').select('*').eq('user_id', user.id).single()
      if (judoka) {
        setJudokaId(judoka.id)
        setData({
          full_name: judoka.full_name ?? '',
          belt: judoka.belt ?? 'blanche',
          birth_date: judoka.birth_date ?? '',
          license_number: judoka.license_number ?? '',
          email: judoka.email ?? '',
          phone: judoka.phone ?? '',
          objectif: judoka.objectif ?? '',
          photo_url: judoka.photo_url,
          cert_medical_url: judoka.cert_medical_url,
          cert_medical_ok: judoka.cert_medical_ok,
          subscription_active: judoka.subscription_active ?? false,
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('judokas').upsert({ user_id: user.id, ...data }, { onConflict: 'user_id' })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  async function uploadFile(file: File, field: 'photo_url' | 'cert_medical_url' | 'virement_url', bucket = 'documents') {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUploading(field)
    const path = `${field.replace('_url', '')}/${user.id}/${file.name}`
    await supabase.storage.from(bucket).upload(path, file, { upsert: true })
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path)
    const url = urlData.publicUrl
    await supabase.from('judokas').upsert({ user_id: user.id, [field]: url }, { onConflict: 'user_id' })
    setData(prev => ({ ...prev, [field]: url }))
    if (field === 'cert_medical_url') {
      await supabase.from('judokas').update({ cert_medical_ok: true }).eq('user_id', user.id)
      setData(prev => ({ ...prev, cert_medical_ok: true }))
    }
    setUploading(null)
  }

  async function handlePay() {
    setPaymentLoading(true)
    setPaymentError(null)
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
        }),
      })
      const json = await res.json()
      if (json.url) {
        window.location.href = json.url
      } else {
        setPaymentError(json.error ?? 'Erreur lors du paiement')
      }
    } catch {
      setPaymentError('Erreur réseau, réessayez.')
    } finally {
      setPaymentLoading(false)
    }
  }

  const currentBelt = BELTS.find(b => b.value === data.belt)
  const dossierComplet = !!data.cert_medical_url && !!data.subscription_active && !!data.full_name && !!data.birth_date

  if (loading) return <div className="text-center py-16 text-[#999999] text-sm">Chargement…</div>

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <div className="relative">
          {data.photo_url ? (
            <img src={data.photo_url} alt="Photo" className="w-16 h-16 rounded-full object-cover border-2 border-[#E5E5E5]" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#0A0A0A] flex items-center justify-center text-white text-2xl font-bold">
              {data.full_name ? data.full_name.charAt(0).toUpperCase() : '?'}
            </div>
          )}
          <button
            type="button"
            onClick={() => photoRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#C41230] rounded-full flex items-center justify-center"
          >
            {uploading === 'photo_url'
              ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
              : <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            }
          </button>
          <input ref={photoRef} type="file" accept="image/*" className="hidden"
            onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0], 'photo_url', 'avatars')} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#0A0A0A]">{data.full_name || 'Mon profil'}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="inline-block w-3 h-3 rounded-full border border-[#CCCCCC]" style={{ backgroundColor: currentBelt?.color }} />
            <span className="text-[#666666] text-sm capitalize">Ceinture {data.belt}</span>
          </div>
        </div>
        <div className="ml-auto flex flex-col items-end gap-2">
          {data.subscription_active ? (
            <span className="text-xs px-3 py-1.5 rounded-full bg-[#0A0A0A] text-white font-medium">
              ✦ Pro
            </span>
          ) : (
            <button
              type="button"
              onClick={handlePay}
              disabled={paymentLoading}
              className="flex items-center gap-1.5 bg-[#0A0A0A] hover:bg-[#222] text-white text-xs font-medium px-3 py-1.5 rounded-full transition-colors disabled:opacity-60"
            >
              {paymentLoading
                ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                : '✦'
              }
              Passer Pro — 1€/mois
            </button>
          )}
          <span className={`text-xs px-3 py-1.5 rounded-full ${dossierComplet ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
            {dossierComplet ? 'Dossier complet' : 'Dossier incomplet'}
          </span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <Section title="Informations personnelles">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nom complet">
              <input type="text" value={data.full_name} onChange={e => setData({ ...data, full_name: e.target.value })}
                placeholder="Prénom Nom" className={inputClass} />
            </Field>
            <Field label="Date de naissance">
              <input type="date" value={data.birth_date} onChange={e => setData({ ...data, birth_date: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Email">
              <input type="email" value={data.email} onChange={e => setData({ ...data, email: e.target.value })}
                placeholder="vous@email.com" className={inputClass} />
            </Field>
            <Field label="Téléphone">
              <input type="tel" value={data.phone} onChange={e => setData({ ...data, phone: e.target.value })}
                placeholder="06 00 00 00 00" className={inputClass} />
            </Field>
            <Field label="N° de licence FFJDA">
              <input type="text" value={data.license_number} onChange={e => setData({ ...data, license_number: e.target.value })}
                placeholder="123456" className={inputClass} />
            </Field>
          </div>
        </Section>

        <Section title="Mon grade">
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {BELTS.map(b => (
              <button key={b.value} type="button" onClick={() => setData({ ...data, belt: b.value })}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${data.belt === b.value ? 'border-[#C41230] bg-red-50' : 'border-[#E5E5E5] bg-white hover:border-[#CCCCCC]'}`}>
                <span className="w-5 h-5 rounded-full border border-[#CCCCCC]" style={{ backgroundColor: b.color }} />
                <span className="text-xs text-[#666666]">{b.label}</span>
              </button>
            ))}
          </div>
        </Section>

        <Section title="Mon niveau">
          <div className="space-y-3">
            <p className="text-xs text-[#999999]">Catégorie déterminée automatiquement à partir de votre date de naissance.</p>
            {data.birth_date ? (
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-[#0A0A0A] capitalize">{getAgeCategory(data.birth_date)}</span>
                <span className="text-xs px-3 py-1 bg-[#FFF5F6] text-[#C41230] border border-[#C41230]/20 rounded-full capitalize">
                  {getAgeCategoryLabel(data.birth_date)}
                </span>
              </div>
            ) : (
              <p className="text-sm text-[#CCCCCC]">Renseignez votre date de naissance pour voir votre catégorie.</p>
            )}
          </div>
        </Section>

        <Section title="Mon objectif">
          <textarea value={data.objectif} onChange={e => setData({ ...data, objectif: e.target.value })}
            placeholder="Ex: passer ma ceinture bleue en juin, améliorer mon uchi-mata…"
            rows={3} className={`${inputClass} resize-none`} />
        </Section>

        <div className="flex items-center gap-4">
          <button type="submit"
            className="bg-[#C41230] hover:bg-[#9B0E25] text-white text-xs uppercase tracking-widest px-6 py-3 rounded-lg transition-colors">
            Enregistrer
          </button>
          {saved && <span className="text-green-600 text-sm">Profil sauvegardé ✓</span>}
        </div>
      </form>

      <div className="mt-6 space-y-4">
        <Section title="Cotisation">
          {justPaid && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700 flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Paiement reçu — merci ! Votre cotisation est validée.
            </div>
          )}
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#0A0A0A]">Hazumi Pro</p>
              <p className="text-xs text-[#999999] mt-0.5">
                {data.subscription_active
                  ? 'Abonnement actif'
                  : 'Abonnement 1€/mois — résiliable à tout moment'}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {data.subscription_active ? (
                <span className="text-xs px-3 py-1.5 rounded-full bg-green-50 text-green-700 font-medium">
                  Payée ✓
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handlePay}
                  disabled={paymentLoading}
                  className="flex items-center gap-2 bg-[#0A0A0A] hover:bg-[#222] text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
                >
                  {paymentLoading
                    ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                    : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                  }
                  Passer Pro — 1€/mois
                </button>
              )}
            </div>
          </div>
          {paymentError && (
            <p className="mt-3 text-xs text-red-600">{paymentError}</p>
          )}
        </Section>

        <Section title="Documents d'inscription">
          <div className="space-y-4">
            <UploadRow
              label="Certificat médical"
              sublabel="PDF, JPG ou PNG"
              url={data.cert_medical_url}
              ok={!!data.cert_medical_ok}
              okLabel="Déposé"
              koLabel="Non déposé"
              loading={uploading === 'cert_medical_url'}
              onUpload={f => uploadFile(f, 'cert_medical_url')}
            />
          </div>
        </Section>
      </div>
    </div>
  )
}

function UploadRow({ label, sublabel, url, ok, okLabel, koLabel, loading, onUpload }: {
  label: string; sublabel: string; url?: string; ok: boolean
  okLabel: string; koLabel: string; loading: boolean; onUpload: (f: File) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#0A0A0A]">{label}</p>
        <p className="text-xs text-[#999999] mt-0.5">{sublabel}</p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className={`text-xs px-2 py-1 rounded-full ${ok ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
          {ok ? okLabel : koLabel}
        </span>
        {url && (
          <a href={url} target="_blank" rel="noreferrer"
            className="text-xs text-[#C41230] hover:underline hidden sm:inline">
            Voir
          </a>
        )}
        <label className="cursor-pointer text-xs text-[#666666] hover:text-[#0A0A0A] transition-colors">
          {loading
            ? <div className="w-4 h-4 border-2 border-[#C41230] border-t-transparent rounded-full animate-spin" />
            : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
          }
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
            onChange={e => e.target.files?.[0] && onUpload(e.target.files[0])} />
        </label>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E5E5] p-5 sm:p-6">
      <h2 className="text-xs uppercase tracking-widest text-[#999999] mb-4">{title}</h2>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-[#666666] mb-1.5">{label}</label>
      {children}
    </div>
  )
}

const inputClass = 'w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg px-3 py-2.5 text-sm text-[#0A0A0A] focus:outline-none focus:border-[#C41230] transition-colors'
