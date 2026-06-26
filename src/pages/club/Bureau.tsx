import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

interface CR {
  id: string
  titre: string
  date: string
  type: string
  contenu: string
  created_at: string
}

interface FormData {
  titre: string
  date: string
  type: string
  contenu: string
}

const TYPES = ['Réunion de bureau', 'AG', 'Réunion technique', 'Autre']

const EMPTY: FormData = {
  titre: '',
  date: new Date().toISOString().slice(0, 10),
  type: 'Réunion de bureau',
  contenu: '',
}

export default function Bureau() {
  const [crs, setCrs] = useState<CR[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected] = useState<CR | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [clubId, setClubId] = useState<string | null>(null)
  const [clubCode, setClubCode] = useState<string | null>(null)
  const [codeCopied, setCodeCopied] = useState(false)
  const [clubPlan, setClubPlan] = useState<string>('basic')
  const [payLoading, setPayLoading] = useState(false)

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    const [{ data: crData }, { data: judokaData }, { data: clubData }] = await Promise.all([
      supabase.from('bureau_cr').select('*').order('date', { ascending: false }),
      user ? supabase.from('judokas').select('club_id').eq('user_id', user.id).single() : Promise.resolve({ data: null, error: null }),
      user ? supabase.from('judokas').select('club_id').eq('user_id', user.id).single().then(async ({ data: j }) => {
        if (j?.club_id) {
          return await supabase.from('clubs').select('*').eq('id', j.club_id).single()
        }
        return { data: null, error: null }
      }) : Promise.resolve({ data: null, error: null }),
    ])
    setCrs(crData ?? [])
    if (clubData && clubData.data) {
      setClubId(clubData.data.id)
      setClubCode(clubData.data.code_invitation ?? null)
      setClubPlan(clubData.data.plan ?? 'basic')
    }
    setLoading(false)
  }

  async function handleClubPay() {
    setPayLoading(true)
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
          priceId: import.meta.env.VITE_STRIPE_PRICE_CLUB,
          type: 'club',
        }),
      })
      const json = await res.json()
      if (json.url) window.location.href = json.url
    } finally {
      setPayLoading(false)
    }
  }

  async function generateCode() {
    if (!clubId) return
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    await supabase.from('clubs').update({ code_invitation: code }).eq('id', clubId)
    setClubCode(code)
  }

  function copyCode() {
    if (!clubCode) return
    navigator.clipboard.writeText(clubCode)
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  useEffect(() => { load() }, [])

  async function handleSave(form: FormData) {
    if (selected) {
      await supabase.from('bureau_cr').update(form).eq('id', selected.id)
    } else {
      await supabase.from('bureau_cr').insert({ ...form, club_id: clubId })
    }
    await load()
    setShowModal(false)
    setSelected(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce document ?')) return
    await supabase.from('bureau_cr').delete().eq('id', id)
    await load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">Le bureau</h1>
          <p className="text-[#666666] text-sm mt-1">Comptes-rendus et documents</p>
        </div>
        <button
          onClick={() => { setSelected(null); setShowModal(true) }}
          className="bg-[#C41230] hover:bg-[#9B0E25] text-white text-xs uppercase tracking-widest px-5 py-2.5 rounded-lg transition-colors"
        >
          + Nouveau CR
        </button>
      </div>

      {/* Abonnement club */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-5 mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#0A0A0A]">
            {clubPlan === 'pro' ? '✦ Hazumi Pro Club' : 'Hazumi Club — Plan Basic'}
          </p>
          <p className="text-xs text-[#999999] mt-0.5">
            {clubPlan === 'pro'
              ? 'Effectif illimité · Toutes les fonctionnalités activées'
              : 'Jusqu\'à 10 judokas inclus — passez Pro pour un effectif illimité'}
          </p>
        </div>
        {clubPlan !== 'pro' && (
          <button
            onClick={handleClubPay}
            disabled={payLoading}
            className="flex-shrink-0 flex items-center gap-2 bg-[#0A0A0A] hover:bg-[#222] text-white text-xs font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {payLoading
              ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
              : '✦'
            }
            Passer Pro — Contactez-nous
          </button>
        )}
      </div>


      {/* Code d'invitation judokas */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-5 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#0A0A0A]">Code d'invitation</p>
            <p className="text-xs text-[#999999] mt-0.5">Partagez ce code avec vos judokas pour qu'ils créent leur compte.</p>
          </div>
          {clubCode ? (
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="font-mono font-bold text-xl tracking-widest text-[#0A0A0A] bg-[#F5F5F5] px-4 py-2 rounded-lg border border-[#E5E5E5]">
                {clubCode}
              </span>
              <button
                onClick={copyCode}
                className={`text-xs px-3 py-2 rounded-lg border transition-all ${codeCopied ? 'bg-green-50 border-green-200 text-green-700' : 'border-[#E5E5E5] text-[#666666] hover:border-[#CCCCCC]'}`}
              >
                {codeCopied ? '✓ Copié' : 'Copier'}
              </button>
            </div>
          ) : (
            <button
              onClick={generateCode}
              className="text-xs bg-[#C41230] hover:bg-[#9B0E25] text-white px-4 py-2 rounded-lg transition-colors flex-shrink-0"
            >
              Générer un code
            </button>
          )}
        </div>
        {clubCode && (
          <div className="mt-3 pt-3 border-t border-[#F5F5F5] flex items-center justify-between">
            <p className="text-xs text-[#CCCCCC]">Le judoka entre ce code lors de la création de son compte sur l'app.</p>
            <button onClick={generateCode} className="text-xs text-[#CCCCCC] hover:text-[#999999] transition-colors">
              Régénérer
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16 text-[#999999] text-sm">Chargement…</div>
      ) : crs.length === 0 ? (
        <div className="text-center py-16 text-[#999999] text-sm">Aucun document pour l'instant.</div>
      ) : (
        <div className="space-y-3">
          {crs.map(cr => (
            <div key={cr.id} className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden group">
              <div
                className="flex items-center gap-4 px-5 py-4 cursor-pointer"
                onClick={() => setExpanded(expanded === cr.id ? null : cr.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xs px-2 py-0.5 bg-[#F5F5F5] text-[#666666] rounded-full">{cr.type}</span>
                    <span className="text-xs text-[#CCCCCC]">
                      {new Date(cr.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-[#0A0A0A] mt-1">{cr.titre}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden group-hover:flex items-center gap-3">
                    <button
                      onClick={e => { e.stopPropagation(); setSelected(cr); setShowModal(true) }}
                      className="text-xs text-[#666666] hover:text-[#0A0A0A] transition-colors"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(cr.id) }}
                      className="text-xs text-[#CCCCCC] hover:text-[#C41230] transition-colors"
                    >
                      Supprimer
                    </button>
                  </div>
                  <svg
                    className={`w-4 h-4 text-[#CCCCCC] transition-transform ${expanded === cr.id ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {expanded === cr.id && cr.contenu && (
                <div className="px-5 pb-5 border-t border-[#F5F5F5]">
                  <p className="text-sm text-[#333333] leading-relaxed whitespace-pre-wrap pt-4">{cr.contenu}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <CRModal initial={selected} onSave={handleSave} onClose={() => { setShowModal(false); setSelected(null) }} />
      )}
    </div>
  )
}

function CRModal({ initial, onSave, onClose }: { initial: CR | null; onSave: (f: FormData) => Promise<void>; onClose: () => void }) {
  const [form, setForm] = useState<FormData>(
    initial ? { titre: initial.titre, date: initial.date, type: initial.type, contenu: initial.contenu } : EMPTY
  )
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); await onSave(form); setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0F0F0]">
          <h2 className="font-semibold text-[#0A0A0A]">{initial ? 'Modifier le CR' : 'Nouveau compte-rendu'}</h2>
          <button onClick={onClose} className="text-[#CCCCCC] hover:text-[#666666]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Field label="Titre *">
            <input required type="text" value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })} placeholder="Ex: Réunion de bureau — janvier 2026" className={inputClass} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date *">
              <input required type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Type">
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className={inputClass}>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Contenu">
            <textarea value={form.contenu} onChange={e => setForm({ ...form, contenu: e.target.value })}
              placeholder="Ordre du jour, décisions, actions…" rows={8} className={`${inputClass} resize-none`} />
          </Field>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-[#E5E5E5] text-[#666666] py-3 rounded-lg text-sm">Annuler</button>
            <button type="submit" disabled={saving} className="flex-1 bg-[#C41230] hover:bg-[#9B0E25] text-white py-3 rounded-lg text-sm font-semibold disabled:opacity-50">{saving ? '…' : initial ? 'Enregistrer' : 'Créer'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-xs text-[#666666] mb-1.5">{label}</label>{children}</div>
}

const inputClass = 'w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg px-3 py-2.5 text-sm text-[#0A0A0A] focus:outline-none focus:border-[#C41230] transition-colors'
