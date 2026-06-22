import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { Belt, Judoka } from '../../types'

const BELT_COLORS: Record<Belt, string> = {
  blanche: '#FFFFFF', jaune: '#FFD700', orange: '#FF8C00',
  verte: '#228B22', bleue: '#1565C0', marron: '#6D3B1E',
  noire: '#0A0A0A', 'noire-2': '#0A0A0A', 'noire-3': '#0A0A0A', 'noire-4': '#0A0A0A', 'noire-5': '#0A0A0A',
}

const BELT_ORDER: Belt[] = ['blanche', 'jaune', 'orange', 'verte', 'bleue', 'marron', 'noire', 'noire-2', 'noire-3', 'noire-4', 'noire-5']

interface JudokaExt extends Judoka {
  email?: string
  phone?: string
  emergency_contact?: string
  cotisation_paid?: boolean
  cert_medical_ok?: boolean
  virement_url?: string
}

interface FormData {
  full_name: string
  belt: Belt
  club: string
  birth_date: string
  license_number: string
  license_expiry: string
  email: string
  phone: string
  emergency_contact: string
  cotisation_paid: boolean
  cert_medical_ok: boolean
}

const EMPTY_FORM: FormData = {
  full_name: '',
  belt: 'blanche',
  club: '',
  birth_date: '',
  license_number: '',
  license_expiry: '',
  email: '',
  phone: '',
  emergency_contact: '',
  cotisation_paid: false,
  cert_medical_ok: false,
}

function dossierOk(j: JudokaExt): boolean {
  return !!j.cotisation_paid && !!j.cert_medical_ok && !!j.virement_url
}

function alertes(judokas: JudokaExt[]) {
  const items: { name: string; msg: string }[] = []
  for (const j of judokas) {
    if (!j.cotisation_paid) items.push({ name: j.full_name, msg: 'cotisation non réglée' })
    if (!j.cert_medical_ok) items.push({ name: j.full_name, msg: 'certificat médical manquant' })
    if (!j.virement_url) items.push({ name: j.full_name, msg: 'preuve de virement manquante' })
  }
  return items
}

const FREE_LIMIT = 10

export default function Effectifs() {
  const navigate = useNavigate()
  const [judokas, setJudokas] = useState<JudokaExt[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterBelt, setFilterBelt] = useState<Belt | ''>('')
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected] = useState<JudokaExt | null>(null)
  const [clubId, setClubId] = useState<string | null>(null)
  const [clubPlan, setClubPlan] = useState<string>('basic')

  async function load() {
    const { data } = await supabase.from('judokas').select('*').order('full_name')
    setJudokas(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: j } = await supabase.from('judokas').select('club_id').eq('user_id', user.id).single()
        setClubId(j?.club_id ?? null)
        if (j?.club_id) {
          const { data: club } = await supabase.from('clubs').select('plan').eq('id', j.club_id).single()
          setClubPlan(club?.plan ?? 'basic')
        }
      }
      await load()
    }
    init()
  }, [])

  const filtered = judokas.filter(j => {
    const matchSearch = j.full_name.toLowerCase().includes(search.toLowerCase())
    const matchBelt = filterBelt ? j.belt === filterBelt : true
    return matchSearch && matchBelt
  })

  const todoList = alertes(judokas)

  function openAdd() { setSelected(null); setShowModal(true) }
  function openEdit(j: JudokaExt) { setSelected(j); setShowModal(true) }
  function closeModal() { setShowModal(false); setSelected(null) }

  async function handleSave(form: FormData) {
    if (selected) {
      await supabase.from('judokas').update(form).eq('id', selected.id)
    } else {
      await supabase.from('judokas').insert({ ...form, club_id: clubId, role: 'judoka' })
    }
    await load()
    closeModal()
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cet élève ?')) return
    await supabase.from('judokas').delete().eq('id', id)
    await load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">Effectifs</h1>
          <p className="text-[#666666] text-sm mt-1">{judokas.length} élève{judokas.length !== 1 ? 's' : ''}</p>
        </div>
        {clubPlan === 'basic' && judokas.length >= FREE_LIMIT ? (
          <button
            onClick={() => navigate('/club/bureau')}
            className="flex items-center gap-2 bg-[#0A0A0A] hover:bg-[#222] text-white text-xs font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            🔒 Passer Pro pour ajouter
          </button>
        ) : (
          <button
            onClick={openAdd}
            className="bg-[#C41230] hover:bg-[#9B0E25] text-white text-xs uppercase tracking-widest px-5 py-2.5 rounded-lg transition-colors"
          >
            + Ajouter
          </button>
        )}
      </div>

      {clubPlan === 'basic' && judokas.length >= FREE_LIMIT && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-amber-800">Limite de {FREE_LIMIT} judokas atteinte</p>
            <p className="text-xs text-amber-700 mt-0.5">Passez en Pro pour gérer un effectif illimité — 10€/mois.</p>
          </div>
          <button
            onClick={() => navigate('/club/bureau')}
            className="flex-shrink-0 bg-[#0A0A0A] text-white text-xs font-medium px-4 py-2 rounded-lg"
          >
            Passer Pro
          </button>
        </div>
      )}

      {todoList.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-700">
              {todoList.length} action{todoList.length > 1 ? 's' : ''} à traiter
            </span>
          </div>
          <ul className="space-y-1.5">
            {todoList.map((item, i) => (
              <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                <span><strong>{item.name}</strong> — {item.msg}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-3 mb-6 flex-wrap">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un élève…"
          className="bg-white border border-[#E5E5E5] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#C41230] transition-colors flex-1 min-w-48"
        />
        <select
          value={filterBelt}
          onChange={e => setFilterBelt(e.target.value as Belt | '')}
          className="bg-white border border-[#E5E5E5] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#C41230] transition-colors"
        >
          <option value="">Toutes les ceintures</option>
          {BELT_ORDER.map(b => (
            <option key={b} value={b}>{b.charAt(0).toUpperCase() + b.slice(1)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-16 text-[#999999] text-sm">Chargement…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[#999999] text-sm mb-4">
            {judokas.length === 0 ? 'Aucun élève encore.' : 'Aucun résultat.'}
          </p>
          {judokas.length === 0 && (
            <button onClick={openAdd} className="text-xs text-[#C41230] uppercase tracking-widest font-semibold hover:underline">
              + Ajouter le premier élève
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E5E5]">
                <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-[#999999] font-medium">Nom</th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-[#999999] font-medium">Ceinture</th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-[#999999] font-medium hidden md:table-cell">Contact</th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-[#999999] font-medium hidden lg:table-cell">Licence</th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-[#999999] font-medium">Dossier</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((j, i) => (
                <tr
                  key={j.id}
                  className={`border-b border-[#F5F5F5] hover:bg-[#FAFAFA] transition-colors ${i === filtered.length - 1 ? 'border-b-0' : ''}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#F0F0F0] flex items-center justify-center text-xs font-bold text-[#666666]">
                        {j.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p
                          className="text-sm font-medium text-[#0A0A0A] hover:text-[#C41230] cursor-pointer transition-colors"
                          onClick={() => navigate(`/club/effectifs/${j.id}`)}
                        >{j.full_name}</p>
                        {j.birth_date && (
                          <p className="text-xs text-[#999999]">{new Date(j.birth_date).toLocaleDateString('fr-FR')}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded-full border border-[#CCCCCC]"
                        style={{ backgroundColor: BELT_COLORS[j.belt] }} />
                      <span className="text-sm text-[#333333] capitalize">{j.belt}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="space-y-0.5">
                      {j.email && <p className="text-xs text-[#666666]">{j.email}</p>}
                      {j.phone && <p className="text-xs text-[#999999]">{j.phone}</p>}
                      {!j.email && !j.phone && <span className="text-xs text-[#CCCCCC]">—</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <LicenseStatus expiry={j.license_expiry} />
                  </td>
                  <td className="px-6 py-4">
                    <DossierBadge judoka={j} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => openEdit(j)} className="text-xs text-[#666666] hover:text-[#0A0A0A] transition-colors">
                        Modifier
                      </button>
                      <button onClick={() => handleDelete(j.id)} className="text-xs text-[#CCCCCC] hover:text-[#C41230] transition-colors">
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <JudokaModal initial={selected} onSave={handleSave} onClose={closeModal} />
      )}
    </div>
  )
}

function DossierBadge({ judoka }: { judoka: JudokaExt }) {
  const ok = dossierOk(judoka)
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${ok ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-green-500' : 'bg-amber-400'}`} />
      {ok ? 'À jour' : 'Incomplet'}
    </span>
  )
}

function LicenseStatus({ expiry }: { expiry?: string }) {
  if (!expiry) return <span className="text-xs text-[#999999]">—</span>
  const isExpired = new Date(expiry) < new Date()
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${isExpired ? 'bg-red-50 text-[#C41230]' : 'bg-green-50 text-green-700'}`}>
      {isExpired ? 'Expirée' : new Date(expiry).toLocaleDateString('fr-FR')}
    </span>
  )
}

function JudokaModal({
  initial,
  onSave,
  onClose,
}: {
  initial: JudokaExt | null
  onSave: (form: FormData) => Promise<void>
  onClose: () => void
}) {
  const [form, setForm] = useState<FormData>(
    initial
      ? {
          full_name: initial.full_name,
          belt: initial.belt,
          club: initial.club ?? '',
          birth_date: initial.birth_date ?? '',
          license_number: initial.license_number ?? '',
          license_expiry: initial.license_expiry ?? '',
          email: initial.email ?? '',
          phone: initial.phone ?? '',
          emergency_contact: initial.emergency_contact ?? '',
          cotisation_paid: initial.cotisation_paid ?? false,
          cert_medical_ok: initial.cert_medical_ok ?? false,
        }
      : EMPTY_FORM
  )
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<'identite' | 'dossier'>('identite')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0F0F0]">
          <h2 className="font-semibold text-[#0A0A0A]">
            {initial ? 'Modifier l\'élève' : 'Ajouter un élève'}
          </h2>
          <button onClick={onClose} className="text-[#CCCCCC] hover:text-[#666666] transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex border-b border-[#F0F0F0]">
          {(['identite', 'dossier'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-xs uppercase tracking-widest transition-colors border-b-2 ${
                tab === t ? 'border-[#C41230] text-[#C41230]' : 'border-transparent text-[#999999] hover:text-[#666666]'
              }`}
            >
              {t === 'identite' ? 'Identité & Contact' : 'Dossier administratif'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {tab === 'identite' && (
            <>
              <Field label="Nom complet *">
                <input required type="text" value={form.full_name}
                  onChange={e => setForm({ ...form, full_name: e.target.value })}
                  placeholder="Prénom Nom" className={inputClass} />
              </Field>

              <Field label="Ceinture">
                <div className="grid grid-cols-4 gap-2">
                  {BELT_ORDER.map(b => (
                    <button key={b} type="button" onClick={() => setForm({ ...form, belt: b })}
                      className={`flex flex-col items-center gap-1.5 py-2 px-1 rounded-lg border text-xs transition-all ${
                        form.belt === b ? 'border-[#C41230] bg-red-50 text-[#C41230]' : 'border-[#E5E5E5] text-[#666666] hover:border-[#CCCCCC]'
                      }`}>
                      <span className="w-4 h-4 rounded-full border border-[#CCCCCC]"
                        style={{ backgroundColor: BELT_COLORS[b] }} />
                      <span className="capitalize leading-tight">{b}</span>
                    </button>
                  ))}
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Email">
                  <input type="email" value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="email@example.com" className={inputClass} />
                </Field>
                <Field label="Téléphone">
                  <input type="tel" value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="06 00 00 00 00" className={inputClass} />
                </Field>
              </div>

              <Field label="Contact d'urgence">
                <input type="text" value={form.emergency_contact}
                  onChange={e => setForm({ ...form, emergency_contact: e.target.value })}
                  placeholder="Nom — 06 00 00 00 00" className={inputClass} />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Date de naissance">
                  <input type="date" value={form.birth_date}
                    onChange={e => setForm({ ...form, birth_date: e.target.value })}
                    className={inputClass} />
                </Field>
                <Field label="Club">
                  <input type="text" value={form.club}
                    onChange={e => setForm({ ...form, club: e.target.value })}
                    placeholder="Nom du club" className={inputClass} />
                </Field>
              </div>
            </>
          )}

          {tab === 'dossier' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="N° de licence">
                  <input type="text" value={form.license_number}
                    onChange={e => setForm({ ...form, license_number: e.target.value })}
                    placeholder="123456" className={inputClass} />
                </Field>
                <Field label="Expiration licence">
                  <input type="date" value={form.license_expiry}
                    onChange={e => setForm({ ...form, license_expiry: e.target.value })}
                    className={inputClass} />
                </Field>
              </div>

              <Field label="Certificat médical">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setForm({ ...form, cert_medical_ok: !form.cert_medical_ok })}
                    className={`w-11 h-6 rounded-full transition-colors relative ${form.cert_medical_ok ? 'bg-green-500' : 'bg-[#E5E5E5]'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.cert_medical_ok ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                  <span className="text-sm text-[#333333]">{form.cert_medical_ok ? 'Reçu' : 'Non reçu'}</span>
                </label>
              </Field>

              <Field label="Cotisation">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setForm({ ...form, cotisation_paid: !form.cotisation_paid })}
                    className={`w-11 h-6 rounded-full transition-colors relative ${form.cotisation_paid ? 'bg-[#C41230]' : 'bg-[#E5E5E5]'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.cotisation_paid ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                  <span className="text-sm text-[#333333]">
                    {form.cotisation_paid ? 'Réglée' : 'Non réglée'}
                  </span>
                </label>
              </Field>
            </>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-[#E5E5E5] text-[#666666] hover:border-[#CCCCCC] py-3 rounded-lg text-sm transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-[#C41230] hover:bg-[#9B0E25] text-white py-3 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
              {saving ? '…' : initial ? 'Enregistrer' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
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
