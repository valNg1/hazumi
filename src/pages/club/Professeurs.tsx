import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

interface Professeur {
  id: string
  full_name: string
  email?: string
  phone?: string
  diplome?: string
  grade_arbitrage?: string
  date_naissance?: string
  notes?: string
  photo_url?: string
}

interface FormData {
  full_name: string
  email: string
  phone: string
  diplome: string
  grade_arbitrage: string
  date_naissance: string
  notes: string
}

const EMPTY: FormData = {
  full_name: '', email: '', phone: '', diplome: '',
  grade_arbitrage: '', date_naissance: '', notes: '',
}

const DIPLOMES = [
  'Animateur Judo (CAJAP)',
  'Initiateur Fédéral',
  'CQP Judo',
  'BPJEPS Judo',
  'DEJEPS Judo',
  'DESJEPS Judo',
  '1er Dan',
  '2e Dan',
  '3e Dan',
  '4e Dan',
  '5e Dan et plus',
]

export default function Professeurs() {
  const [profs, setProfs] = useState<Professeur[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected] = useState<Professeur | null>(null)

  async function load() {
    const { data } = await supabase.from('professeurs').select('*').order('full_name')
    setProfs(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleSave(form: FormData) {
    if (selected) {
      await supabase.from('professeurs').update(form).eq('id', selected.id)
    } else {
      await supabase.from('professeurs').insert(form)
    }
    await load()
    setShowModal(false)
    setSelected(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce professeur ?')) return
    await supabase.from('professeurs').delete().eq('id', id)
    await load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">Professeurs</h1>
          <p className="text-[#666666] text-sm mt-1">{profs.length} intervenant{profs.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { setSelected(null); setShowModal(true) }}
          className="bg-[#C41230] hover:bg-[#9B0E25] text-white text-xs uppercase tracking-widest px-5 py-2.5 rounded-lg transition-colors"
        >
          + Ajouter
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-[#999999] text-sm">Chargement…</div>
      ) : profs.length === 0 ? (
        <div className="text-center py-16 text-[#999999] text-sm">Aucun professeur enregistré.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {profs.map(p => (
            <ProfCard key={p.id} prof={p}
              onEdit={() => { setSelected(p); setShowModal(true) }}
              onDelete={() => handleDelete(p.id)} />
          ))}
        </div>
      )}

      {showModal && (
        <ProfModal initial={selected} onSave={handleSave} onClose={() => { setShowModal(false); setSelected(null) }} />
      )}
    </div>
  )
}

function ProfCard({ prof, onEdit, onDelete }: { prof: Professeur; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E5E5] p-5 group">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-[#0A0A0A] flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden">
          {prof.photo_url
            ? <img src={prof.photo_url} alt={prof.full_name} className="w-full h-full object-cover" />
            : prof.full_name.charAt(0).toUpperCase()
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#0A0A0A] text-sm">{prof.full_name}</p>
          {prof.diplome && (
            <span className="text-xs px-2 py-0.5 bg-[#F5F5F5] text-[#666666] rounded-full mt-1 inline-block">{prof.diplome}</span>
          )}
        </div>
      </div>
      <div className="space-y-1 text-xs text-[#666666]">
        {prof.email && <p>{prof.email}</p>}
        {prof.phone && <p>{prof.phone}</p>}
        {prof.grade_arbitrage && <p className="text-[#999999]">Arbitrage : {prof.grade_arbitrage}</p>}
        {prof.notes && <p className="text-[#999999] pt-1 border-t border-[#F5F5F5]">{prof.notes}</p>}
      </div>
      <div className="hidden group-hover:flex items-center gap-3 mt-3 pt-3 border-t border-[#F5F5F5]">
        <button onClick={onEdit} className="text-xs text-[#666666] hover:text-[#0A0A0A] transition-colors">Modifier</button>
        <button onClick={onDelete} className="text-xs text-[#CCCCCC] hover:text-[#C41230] transition-colors ml-auto">Supprimer</button>
      </div>
    </div>
  )
}

function ProfModal({ initial, onSave, onClose }: { initial: Professeur | null; onSave: (f: FormData) => Promise<void>; onClose: () => void }) {
  const [form, setForm] = useState<FormData>(
    initial ? {
      full_name: initial.full_name, email: initial.email ?? '', phone: initial.phone ?? '',
      diplome: initial.diplome ?? '', grade_arbitrage: initial.grade_arbitrage ?? '',
      date_naissance: initial.date_naissance ?? '', notes: initial.notes ?? '',
    } : EMPTY
  )
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); await onSave(form); setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0F0F0]">
          <h2 className="font-semibold text-[#0A0A0A]">{initial ? 'Modifier' : 'Ajouter un professeur'}</h2>
          <button onClick={onClose} className="text-[#CCCCCC] hover:text-[#666666]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Field label="Nom complet *">
            <input required type="text" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })}
              placeholder="Prénom Nom" className={inputClass} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email">
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="email@exemple.com" className={inputClass} />
            </Field>
            <Field label="Téléphone">
              <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="06 00 00 00 00" className={inputClass} />
            </Field>
          </div>
          <Field label="Diplôme / Grade d'enseignement">
            <select value={form.diplome} onChange={e => setForm({ ...form, diplome: e.target.value })} className={inputClass}>
              <option value="">— Sélectionner —</option>
              {DIPLOMES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Grade d'arbitrage">
              <input type="text" value={form.grade_arbitrage} onChange={e => setForm({ ...form, grade_arbitrage: e.target.value })}
                placeholder="Ex: Arbitre régional" className={inputClass} />
            </Field>
            <Field label="Date de naissance">
              <input type="date" value={form.date_naissance} onChange={e => setForm({ ...form, date_naissance: e.target.value })} className={inputClass} />
            </Field>
          </div>
          <Field label="Notes">
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              rows={2} className={`${inputClass} resize-none`} />
          </Field>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-[#E5E5E5] text-[#666666] py-3 rounded-lg text-sm">Annuler</button>
            <button type="submit" disabled={saving} className="flex-1 bg-[#C41230] hover:bg-[#9B0E25] text-white py-3 rounded-lg text-sm font-semibold disabled:opacity-50">
              {saving ? '…' : initial ? 'Enregistrer' : 'Ajouter'}
            </button>
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
