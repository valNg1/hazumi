import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

interface Competition {
  id: string
  nom: string
  date: string
  lieu?: string
  niveau?: string
  tranche_age?: string[]
  notes?: string
}

interface FormData {
  nom: string
  date: string
  lieu: string
  niveau: string
  tranche_age: string[]
  notes: string
}

const EMPTY: FormData = { nom: '', date: '', lieu: '', niveau: '', tranche_age: [], notes: '' }

const NIVEAUX = ['club', 'départemental', 'régional', 'national', 'international']
const TRANCHES_AGE = ['poussins', 'benjamins', 'minimes', 'cadets', 'juniors', 'seniors', 'vétérans']

export default function Competitions() {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected] = useState<Competition | null>(null)

  async function load() {
    const { data } = await supabase.from('competitions').select('*').order('date')
    setCompetitions(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const today = new Date().toISOString().slice(0, 10)
  const aVenir = competitions.filter(c => c.date >= today)
  const passees = competitions.filter(c => c.date < today)

  async function handleSave(form: FormData) {
    if (selected) {
      await supabase.from('competitions').update(form).eq('id', selected.id)
    } else {
      await supabase.from('competitions').insert(form)
    }
    await load()
    setShowModal(false)
    setSelected(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette compétition ?')) return
    await supabase.from('competitions').delete().eq('id', id)
    await load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">Compétitions</h1>
          <p className="text-[#666666] text-sm mt-1">{aVenir.length} à venir</p>
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
      ) : competitions.length === 0 ? (
        <div className="text-center py-16 text-[#999999] text-sm">Aucune compétition planifiée.</div>
      ) : (
        <div className="space-y-8">
          {aVenir.length > 0 && (
            <div>
              <h2 className="text-xs uppercase tracking-widest text-[#999999] mb-3">À venir</h2>
              <div className="space-y-3">
                {aVenir.map(c => (
                  <CompetCard key={c.id} comp={c} past={false}
                    onEdit={() => { setSelected(c); setShowModal(true) }}
                    onDelete={() => handleDelete(c.id)} />
                ))}
              </div>
            </div>
          )}
          {passees.length > 0 && (
            <div>
              <h2 className="text-xs uppercase tracking-widest text-[#999999] mb-3">Passées</h2>
              <div className="space-y-3 opacity-60">
                {passees.slice().reverse().map(c => (
                  <CompetCard key={c.id} comp={c} past={true}
                    onEdit={() => { setSelected(c); setShowModal(true) }}
                    onDelete={() => handleDelete(c.id)} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <CompetModal initial={selected} onSave={handleSave} onClose={() => { setShowModal(false); setSelected(null) }} />
      )}
    </div>
  )
}

function CompetCard({ comp, past, onEdit, onDelete }: { comp: Competition; past: boolean; onEdit: () => void; onDelete: () => void }) {
  const daysLeft = Math.ceil((new Date(comp.date).getTime() - Date.now()) / 86400000)
  const tranches = comp.tranche_age ?? []
  return (
    <div className="bg-white rounded-xl border border-[#E5E5E5] p-5 flex items-center gap-4 group">
      <div className="text-center w-12 flex-shrink-0">
        <p className="text-lg font-bold text-[#0A0A0A]">{new Date(comp.date).getDate()}</p>
        <p className="text-xs text-[#999999] uppercase">{new Date(comp.date).toLocaleDateString('fr-FR', { month: 'short' })}</p>
      </div>
      <div className="w-px h-10 bg-[#F0F0F0] flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#0A0A0A]">{comp.nom}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {comp.lieu && <span className="text-xs text-[#999999]">{comp.lieu}</span>}
          {comp.niveau && (
            <span className="text-xs px-2 py-0.5 bg-[#F5F5F5] text-[#666666] rounded-full capitalize">{comp.niveau}</span>
          )}
          {tranches.map(t => (
            <span key={t} className="text-xs px-2 py-0.5 bg-[#FFF5F6] text-[#C41230] border border-[#C41230]/20 rounded-full capitalize">{t}</span>
          ))}
        </div>
      </div>
      {!past && daysLeft >= 0 && (
        <span className={`text-xs font-medium flex-shrink-0 ${daysLeft <= 7 ? 'text-[#C41230]' : 'text-[#999999]'}`}>
          J-{daysLeft}
        </span>
      )}
      <div className="hidden group-hover:flex items-center gap-3">
        <button onClick={onEdit} className="text-xs text-[#666666] hover:text-[#0A0A0A] transition-colors">Modifier</button>
        <button onClick={onDelete} className="text-xs text-[#CCCCCC] hover:text-[#C41230] transition-colors">Supprimer</button>
      </div>
    </div>
  )
}

function CompetModal({ initial, onSave, onClose }: { initial: Competition | null; onSave: (f: FormData) => Promise<void>; onClose: () => void }) {
  const [form, setForm] = useState<FormData>(
    initial
      ? { nom: initial.nom, date: initial.date, lieu: initial.lieu ?? '', niveau: initial.niveau ?? '', tranche_age: initial.tranche_age ?? [], notes: initial.notes ?? '' }
      : EMPTY
  )
  const [saving, setSaving] = useState(false)

  function toggleTranche(t: string) {
    setForm(f => ({
      ...f,
      tranche_age: f.tranche_age.includes(t)
        ? f.tranche_age.filter(x => x !== t)
        : [...f.tranche_age, t],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); await onSave(form); setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0F0F0] sticky top-0 bg-white">
          <h2 className="font-semibold text-[#0A0A0A]">{initial ? 'Modifier' : 'Ajouter une compétition'}</h2>
          <button onClick={onClose} className="text-[#CCCCCC] hover:text-[#666666]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Field label="Nom *"><input required type="text" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} placeholder="Ex: Tournoi de Paris" className={inputClass} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date *"><input required type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className={inputClass} /></Field>
            <Field label="Échelon">
              <select value={form.niveau} onChange={e => setForm({ ...form, niveau: e.target.value })} className={inputClass}>
                <option value="">—</option>
                {NIVEAUX.map(n => <option key={n} value={n}>{n.charAt(0).toUpperCase() + n.slice(1)}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Lieu"><input type="text" value={form.lieu} onChange={e => setForm({ ...form, lieu: e.target.value })} placeholder="Ville, salle…" className={inputClass} /></Field>

          <div>
            <label className="block text-xs text-[#666666] mb-2">Catégories d'âge</label>
            <div className="flex flex-wrap gap-2">
              {TRANCHES_AGE.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTranche(t)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all capitalize ${
                    form.tranche_age.includes(t)
                      ? 'bg-[#C41230] border-[#C41230] text-white'
                      : 'border-[#E5E5E5] text-[#666666] hover:border-[#C41230] hover:text-[#C41230]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            {form.tranche_age.length === 0 && (
              <p className="text-xs text-[#CCCCCC] mt-1.5">Aucune sélection = compétition visible par tous</p>
            )}
          </div>

          <Field label="Notes"><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className={`${inputClass} resize-none`} /></Field>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-[#E5E5E5] text-[#666666] py-3 rounded-lg text-sm">Annuler</button>
            <button type="submit" disabled={saving} className="flex-1 bg-[#C41230] hover:bg-[#9B0E25] text-white py-3 rounded-lg text-sm font-semibold disabled:opacity-50">{saving ? '…' : initial ? 'Enregistrer' : 'Ajouter'}</button>
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
