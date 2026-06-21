import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

type EventType = 'grade' | 'arbitrage' | 'stage' | 'ag' | 'autre'

interface Evenement {
  id: string
  type: EventType
  titre: string
  date: string
  lieu?: string
  description?: string
}

interface FormData {
  type: EventType
  titre: string
  date: string
  lieu: string
  description: string
}

const EMPTY: FormData = { type: 'autre', titre: '', date: '', lieu: '', description: '' }

const TYPES: { value: EventType; label: string; color: string; icon: string }[] = [
  { value: 'grade',     label: 'Passage de grade', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: '🥋' },
  { value: 'arbitrage', label: 'Arbitrage',         color: 'bg-blue-50 text-blue-700 border-blue-200',       icon: '🤝' },
  { value: 'stage',     label: 'Stage',             color: 'bg-green-50 text-green-700 border-green-200',    icon: '📚' },
  { value: 'ag',        label: 'AG du club',        color: 'bg-amber-50 text-amber-700 border-amber-200',    icon: '🏛️' },
  { value: 'autre',     label: 'Autre événement',   color: 'bg-[#F5F5F5] text-[#666666] border-[#E5E5E5]',  icon: '📅' },
]

export function typeConfig(type: string) {
  return TYPES.find(t => t.value === type) ?? TYPES[TYPES.length - 1]
}

export default function Agenda() {
  const [evenements, setEvenements] = useState<Evenement[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected] = useState<Evenement | null>(null)

  async function load() {
    const { data } = await supabase.from('evenements').select('*').order('date')
    setEvenements(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const today = new Date().toISOString().slice(0, 10)
  const aVenir = evenements.filter(e => e.date >= today)
  const passes = evenements.filter(e => e.date < today)

  async function handleSave(form: FormData) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: judoka } = await supabase.from('judokas').select('club_id').eq('user_id', user.id).single()
    const payload = { ...form, club_id: judoka?.club_id ?? null }
    if (selected) {
      await supabase.from('evenements').update(payload).eq('id', selected.id)
    } else {
      await supabase.from('evenements').insert(payload)
    }
    await load()
    setShowModal(false)
    setSelected(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cet événement ?')) return
    await supabase.from('evenements').delete().eq('id', id)
    await load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">Agenda</h1>
          <p className="text-[#666666] text-sm mt-1">{aVenir.length} événement{aVenir.length !== 1 ? 's' : ''} à venir</p>
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
      ) : evenements.length === 0 ? (
        <div className="text-center py-16 text-[#999999] text-sm">Aucun événement planifié.</div>
      ) : (
        <div className="space-y-8">
          {aVenir.length > 0 && (
            <div>
              <h2 className="text-xs uppercase tracking-widest text-[#999999] mb-3">À venir</h2>
              <div className="space-y-3">
                {aVenir.map(e => (
                  <EventCard key={e.id} ev={e} past={false}
                    onEdit={() => { setSelected(e); setShowModal(true) }}
                    onDelete={() => handleDelete(e.id)} />
                ))}
              </div>
            </div>
          )}
          {passes.length > 0 && (
            <div>
              <h2 className="text-xs uppercase tracking-widest text-[#999999] mb-3">Passés</h2>
              <div className="space-y-3 opacity-60">
                {passes.slice().reverse().map(e => (
                  <EventCard key={e.id} ev={e} past={true}
                    onEdit={() => { setSelected(e); setShowModal(true) }}
                    onDelete={() => handleDelete(e.id)} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <EventModal initial={selected} onSave={handleSave} onClose={() => { setShowModal(false); setSelected(null) }} />
      )}
    </div>
  )
}

function EventCard({ ev, past, onEdit, onDelete }: { ev: Evenement; past: boolean; onEdit: () => void; onDelete: () => void }) {
  const cfg = typeConfig(ev.type)
  const daysLeft = Math.ceil((new Date(ev.date).getTime() - Date.now()) / 86400000)
  return (
    <div className="bg-white rounded-xl border border-[#E5E5E5] p-5 flex items-center gap-4 group">
      <div className="text-center w-12 flex-shrink-0">
        <p className="text-lg font-bold text-[#0A0A0A]">{new Date(ev.date).getDate()}</p>
        <p className="text-xs text-[#999999] uppercase">{new Date(ev.date).toLocaleDateString('fr-FR', { month: 'short' })}</p>
      </div>
      <div className="w-px h-10 bg-[#F0F0F0] flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#0A0A0A]">{ev.titre}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${cfg.color}`}>{cfg.icon} {cfg.label}</span>
          {ev.lieu && <span className="text-xs text-[#999999]">{ev.lieu}</span>}
        </div>
        {ev.description && <p className="text-xs text-[#999999] mt-1 line-clamp-1">{ev.description}</p>}
      </div>
      {!past && daysLeft >= 0 && (
        <span className={`text-xs font-medium flex-shrink-0 ${daysLeft <= 7 ? 'text-[#C41230]' : 'text-[#999999]'}`}>J-{daysLeft}</span>
      )}
      <div className="hidden group-hover:flex items-center gap-3">
        <button onClick={onEdit} className="text-xs text-[#666666] hover:text-[#0A0A0A] transition-colors">Modifier</button>
        <button onClick={onDelete} className="text-xs text-[#CCCCCC] hover:text-[#C41230] transition-colors">Supprimer</button>
      </div>
    </div>
  )
}

function EventModal({ initial, onSave, onClose }: { initial: Evenement | null; onSave: (f: FormData) => Promise<void>; onClose: () => void }) {
  const [form, setForm] = useState<FormData>(
    initial
      ? { type: initial.type, titre: initial.titre, date: initial.date, lieu: initial.lieu ?? '', description: initial.description ?? '' }
      : EMPTY
  )
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); await onSave(form); setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0F0F0]">
          <h2 className="font-semibold text-[#0A0A0A]">{initial ? 'Modifier' : 'Ajouter un événement'}</h2>
          <button onClick={onClose} className="text-[#CCCCCC] hover:text-[#666666]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs text-[#666666] mb-2">Type d'événement</label>
            <div className="grid grid-cols-2 gap-2">
              {TYPES.map(t => (
                <button key={t.value} type="button" onClick={() => setForm({ ...form, type: t.value })}
                  className={`text-xs px-3 py-2 rounded-lg border text-left transition-all ${form.type === t.value ? 'border-[#C41230] bg-red-50 text-[#C41230]' : 'border-[#E5E5E5] text-[#666666] hover:border-[#CCCCCC]'}`}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>
          <Field label="Titre *"><input required type="text" value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })} placeholder="Ex: Passage de grade ceinture bleue" className={inputClass} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date *"><input required type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className={inputClass} /></Field>
            <Field label="Lieu"><input type="text" value={form.lieu} onChange={e => setForm({ ...form, lieu: e.target.value })} placeholder="Dojo, salle…" className={inputClass} /></Field>
          </div>
          <Field label="Description"><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className={`${inputClass} resize-none`} placeholder="Informations complémentaires…" /></Field>
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
