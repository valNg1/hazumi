import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Belt } from '../../types'

const BELTS: { value: Belt; label: string; color: string }[] = [
  { value: 'blanche', label: 'Blanche', color: '#FFFFFF' },
  { value: 'jaune', label: 'Jaune', color: '#FFD700' },
  { value: 'orange', label: 'Orange', color: '#FF8C00' },
  { value: 'verte', label: 'Verte', color: '#228B22' },
  { value: 'bleue', label: 'Bleue', color: '#1565C0' },
  { value: 'marron', label: 'Marron', color: '#6D3B1E' },
  { value: 'noire', label: 'Noire', color: '#0A0A0A' },
]

interface ProfilData {
  full_name: string
  belt: Belt
  club: string
  birth_date: string
  license_number: string
  email: string
  phone: string
  objectif: string
  photo_url?: string
  cert_medical_url?: string
  cert_medical_ok?: boolean
  virement_url?: string
}

const EMPTY: ProfilData = {
  full_name: '', belt: 'blanche', club: '', birth_date: '',
  license_number: '', email: '', phone: '', objectif: '',
}

export default function Profil() {
  const [judokaId, setJudokaId] = useState<string | null>(null)
  const [data, setData] = useState<ProfilData>(EMPTY)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const photoRef = useRef<HTMLInputElement>(null)

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
          club: judoka.club ?? '',
          birth_date: judoka.birth_date ?? '',
          license_number: judoka.license_number ?? '',
          email: judoka.email ?? '',
          phone: judoka.phone ?? '',
          objectif: judoka.objectif ?? '',
          photo_url: judoka.photo_url,
          cert_medical_url: judoka.cert_medical_url,
          cert_medical_ok: judoka.cert_medical_ok,
          virement_url: judoka.virement_url,
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

  const currentBelt = BELTS.find(b => b.value === data.belt)
  const dossierComplet = !!data.cert_medical_url && !!data.virement_url && !!data.full_name && !!data.birth_date

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
        <div className="ml-auto">
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
            <Field label="Club">
              <input type="text" value={data.club} onChange={e => setData({ ...data, club: e.target.value })}
                placeholder="Nom de votre club" className={inputClass} />
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
            <UploadRow
              label="Preuve de virement"
              sublabel="Justificatif de paiement de la cotisation"
              url={data.virement_url}
              ok={!!data.virement_url}
              okLabel="Déposé"
              koLabel="Non déposé"
              loading={uploading === 'virement_url'}
              onUpload={f => uploadFile(f, 'virement_url')}
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
