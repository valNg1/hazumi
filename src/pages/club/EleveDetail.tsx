import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { Belt, Judoka } from '../../types'

const BELT_COLORS: Record<Belt, string> = {
  blanche: '#FFFFFF',
  jaune: '#FFD700',
  orange: '#FF8C00',
  verte: '#228B22',
  bleue: '#1565C0',
  marron: '#6D3B1E',
  noire: '#0A0A0A',
}

interface JudokaExt extends Judoka {
  email?: string
  phone?: string
  emergency_contact?: string
  cotisation_paid?: boolean
  cert_medical_expiry?: string
  cert_medical_url?: string
  cert_medical_ok?: boolean
  photo_url?: string
  virement_url?: string
}

export default function EleveDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [judoka, setJudoka] = useState<JudokaExt | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('judokas').select('*').eq('id', id).single()
      setJudoka(data)
      setLoading(false)
    }
    load()
  }, [id])

  async function toggle(field: 'cotisation_paid' | 'cert_medical_ok', value: boolean) {
    if (!judoka) return
    setSaving(field)
    await supabase.from('judokas').update({ [field]: value }).eq('id', judoka.id)
    setJudoka({ ...judoka, [field]: value })
    setSaving(null)
    setSaved(field)
    setTimeout(() => setSaved(null), 2000)
  }

  async function updateDate(field: 'cert_medical_expiry' | 'license_expiry', value: string) {
    if (!judoka) return
    setSaving(field)
    await supabase.from('judokas').update({ [field]: value }).eq('id', judoka.id)
    setJudoka({ ...judoka, [field]: value })
    setSaving(null)
    setSaved(field)
    setTimeout(() => setSaved(null), 2000)
  }

  async function uploadCertif(file: File) {
    if (!judoka) return
    setSaving('cert_upload')
    const path = `certifs/${judoka.id}/${file.name}`
    const { error } = await supabase.storage.from('documents').upload(path, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('documents').getPublicUrl(path)
      const url = data.publicUrl
      await supabase.from('judokas').update({ cert_medical_url: url }).eq('id', judoka.id)
      setJudoka({ ...judoka, cert_medical_url: url })
      setSaved('cert_upload')
      setTimeout(() => setSaved(null), 2000)
    }
    setSaving(null)
  }

  if (loading) return <div className="text-center py-16 text-[#999999] text-sm">Chargement…</div>
  if (!judoka) return <div className="text-center py-16 text-[#999999] text-sm">Élève introuvable.</div>

  const certOk = !!judoka.cert_medical_ok
  const virementOk = !!judoka.virement_url
  const dossierOk = !!judoka.cotisation_paid && certOk && virementOk

  return (
    <div className="max-w-2xl">
      <button
        onClick={() => navigate('/club/effectifs')}
        className="flex items-center gap-2 text-xs text-[#999999] hover:text-[#666666] uppercase tracking-widest mb-6 transition-colors"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Effectifs
      </button>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-[#0A0A0A] flex-shrink-0 overflow-hidden border-2 border-[#1A1A1A]">
          {judoka.photo_url
            ? <img src={judoka.photo_url} alt="" className="w-full h-full object-cover" />
            : <span className="w-full h-full flex items-center justify-center text-white text-xl font-bold">
                {judoka.full_name.charAt(0).toUpperCase()}
              </span>
          }
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">{judoka.full_name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-block w-3 h-3 rounded-full border border-[#CCCCCC]"
              style={{ backgroundColor: BELT_COLORS[judoka.belt] }} />
            <span className="text-[#666666] text-sm capitalize">Ceinture {judoka.belt}</span>
            <span className="text-[#CCCCCC]">·</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${dossierOk ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
              {dossierOk ? 'Dossier à jour' : 'Dossier incomplet'}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Section title="Contact">
          <Grid>
            <Info label="Email" value={judoka.email} />
            <Info label="Téléphone" value={judoka.phone} />
            <Info label="Contact d'urgence" value={judoka.emergency_contact} />
            <Info label="Club" value={judoka.club} />
            <Info label="Date de naissance" value={judoka.birth_date ? new Date(judoka.birth_date).toLocaleDateString('fr-FR') : undefined} />
          </Grid>
        </Section>

        <Section title="Dossier administratif">
          <div className="space-y-4">
            <StatusRow
              label="Cotisation"
              ok={!!judoka.cotisation_paid}
              okLabel="Réglée"
              koLabel="Non réglée"
              loading={saving === 'cotisation_paid'}
              saved={saved === 'cotisation_paid'}
              onToggle={() => toggle('cotisation_paid', !judoka.cotisation_paid)}
            />

            <div className="py-3 border-t border-[#F5F5F5]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#0A0A0A]">Preuve de virement</p>
                  <p className={`text-xs mt-0.5 ${virementOk ? 'text-green-600' : 'text-amber-600'}`}>
                    {virementOk ? 'Justificatif reçu' : 'Non déposé par l\'élève'}
                  </p>
                </div>
                {judoka.virement_url && (
                  <a href={judoka.virement_url} target="_blank" rel="noreferrer"
                    className="text-xs text-[#C41230] hover:underline flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Voir
                  </a>
                )}
              </div>
            </div>

            <div className="py-3 border-t border-[#F5F5F5] space-y-3">
              <StatusRow
                label="Certificat médical"
                ok={certOk}
                okLabel="Reçu et valide"
                koLabel="Non reçu"
                loading={saving === 'cert_medical_ok'}
                saved={saved === 'cert_medical_ok'}
                onToggle={() => toggle('cert_medical_ok', !judoka.cert_medical_ok)}
              />

              <div className="flex items-center gap-3">
                {judoka.cert_medical_url ? (
                  <a
                    href={judoka.cert_medical_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-xs text-[#C41230] hover:underline"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Voir le certificat
                  </a>
                ) : (
                  <span className="text-xs text-[#CCCCCC]">Aucun document joint</span>
                )}

                <label className="flex items-center gap-1.5 text-xs text-[#666666] hover:text-[#0A0A0A] cursor-pointer transition-colors ml-auto">
                  {saving === 'cert_upload' ? <Spinner /> : saved === 'cert_upload' ? <Check /> : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  )}
                  {judoka.cert_medical_url ? 'Remplacer' : 'Joindre un fichier'}
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={e => e.target.files?.[0] && uploadCertif(e.target.files[0])}
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-[#F5F5F5]">
              <div>
                <p className="text-sm font-medium text-[#0A0A0A]">Licence FFJDA</p>
                <p className="text-xs text-[#999999] mt-0.5">
                  {judoka.license_number ? `N° ${judoka.license_number}` : 'Non renseignée'}
                  {judoka.license_expiry && ` · exp. ${new Date(judoka.license_expiry).toLocaleDateString('fr-FR')}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  defaultValue={judoka.license_expiry ?? ''}
                  onBlur={e => e.target.value && updateDate('license_expiry', e.target.value)}
                  className="text-xs border border-[#E5E5E5] rounded-lg px-3 py-2 focus:outline-none focus:border-[#C41230] transition-colors"
                />
                {saving === 'license_expiry' && <Spinner />}
                {saved === 'license_expiry' && <Check />}
              </div>
            </div>
          </div>
        </Section>
      </div>
    </div>
  )
}

function StatusRow({
  label, ok, okLabel, koLabel, loading, saved, onToggle,
}: {
  label: string
  ok: boolean
  okLabel: string
  koLabel: string
  loading: boolean
  saved: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-[#0A0A0A]">{label}</p>
        <p className={`text-xs mt-0.5 ${ok ? 'text-green-600' : 'text-amber-600'}`}>
          {ok ? okLabel : koLabel}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {saved && <Check />}
        <button
          onClick={onToggle}
          disabled={loading}
          className={`relative w-11 h-6 rounded-full transition-colors disabled:opacity-50 ${ok ? 'bg-green-500' : 'bg-[#E5E5E5]'}`}
        >
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${ok ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E5E5] p-6">
      <h2 className="text-xs uppercase tracking-widest text-[#999999] mb-4">{title}</h2>
      {children}
    </div>
  )
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-4">{children}</div>
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs text-[#999999] mb-0.5">{label}</p>
      <p className="text-sm text-[#0A0A0A]">{value || '—'}</p>
    </div>
  )
}

function Spinner() {
  return <div className="w-4 h-4 border-2 border-[#C41230] border-t-transparent rounded-full animate-spin" />
}

function Check() {
  return (
    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  )
}
