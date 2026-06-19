import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

interface Entrainement {
  id: string
  judoka_id: string
  date: string
  duree_minutes: number
  objectif?: string
  feedback?: string
  niveau_effort?: number
  created_at: string
}

interface FormData {
  date: string
  duree_minutes: number
  objectif: string
  feedback: string
  niveau_effort: number
}

const EMPTY: FormData = {
  date: new Date().toISOString().slice(0, 10),
  duree_minutes: 90,
  objectif: '',
  feedback: '',
  niveau_effort: 3,
}

const EFFORT_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Léger', color: 'text-blue-500' },
  2: { label: 'Modéré', color: 'text-green-500' },
  3: { label: 'Intense', color: 'text-yellow-500' },
  4: { label: 'Très intense', color: 'text-orange-500' },
  5: { label: 'Maximum', color: 'text-[#C41230]' },
}

export default function Entrainements() {
  const [judokaId, setJudokaId] = useState<string | null>(null)
  const [entrainements, setEntrainements] = useState<Entrainement[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected] = useState<Entrainement | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: judoka } = await supabase.from('judokas').select('id').eq('user_id', user.id).single()
      if (!judoka) { setLoading(false); return }
      setJudokaId(judoka.id)
      const { data } = await supabase.from('entrainements').select('*').eq('judoka_id', judoka.id).order('date', { ascending: false })
      setEntrainements(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function reload() {
    if (!judokaId) return
    const { data } = await supabase.from('entrainements').select('*').eq('judoka_id', judokaId).order('date', { ascending: false })
    setEntrainements(data ?? [])
  }

  async function handleSave(form: FormData) {
    if (!judokaId) return
    if (selected) {
      await supabase.from('entrainements').update(form).eq('id', selected.id)
    } else {
      await supabase.from('entrainements').insert({ ...form, judoka_id: judokaId })
    }
    await reload()
    setShowModal(false)
    setSelected(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette séance ?')) return
    await supabase.from('entrainements').delete().eq('id', id)
    await reload()
  }

  const totalHeures = Math.round(entrainements.reduce((s, e) => s + e.duree_minutes, 0) / 60)
  const ce_mois = entrainements.filter(e => e.date.startsWith(new Date().toISOString().slice(0, 7))).length

  if (loading) return <div className="text-center py-16 text-[#999999] text-sm">Chargement…</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">Mes entraînements</h1>
          <p className="text-[#666666] text-sm mt-1">{entrainements.length} séance{entrainements.length !== 1 ? 's' : ''} enregistrée{entrainements.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { setSelected(null); setShowModal(true) }}
          className="bg-[#C41230] hover:bg-[#9B0E25] text-white text-xs uppercase tracking-widest px-5 py-2.5 rounded-lg transition-colors"
        >
          + Ajouter
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <Stat label="Séances ce mois" value={String(ce_mois)} />
        <Stat label="Total séances" value={String(entrainements.length)} />
        <Stat label="Heures au total" value={`${totalHeures}h`} />
      </div>

      {!judokaId ? (
        <div className="text-center py-16 text-[#999999] text-sm">
          Complétez votre profil élève pour accéder à vos entraînements.
        </div>
      ) : entrainements.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[#999999] text-sm mb-4">Aucune séance enregistrée.</p>
          <button
            onClick={() => setShowModal(true)}
            className="text-xs text-[#C41230] uppercase tracking-widest font-semibold hover:underline"
          >
            + Ajouter ma première séance
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {entrainements.map(e => (
            <EntrainementCard
              key={e.id}
              e={e}
              onEdit={() => { setSelected(e); setShowModal(true) }}
              onDelete={() => handleDelete(e.id)}
            />
          ))}
        </div>
      )}

      {showModal && (
        <EntrainementModal
          initial={selected}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setSelected(null) }}
        />
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E5E5] p-4">
      <p className="text-xs uppercase tracking-widest text-[#999999] mb-2">{label}</p>
      <p className="text-2xl font-bold text-[#0A0A0A]">{value}</p>
    </div>
  )
}

function EntrainementCard({ e, onEdit, onDelete }: { e: Entrainement; onEdit: () => void; onDelete: () => void }) {
  const effort = e.niveau_effort ? EFFORT_LABELS[e.niveau_effort] : null
  return (
    <div className="bg-white rounded-xl border border-[#E5E5E5] p-5 group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-semibold text-[#0A0A0A]">
              {new Date(e.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
            <span className="text-xs text-[#999999]">{e.duree_minutes} min</span>
            {effort && (
              <span className={`text-xs font-medium ${effort.color}`}>{effort.label}</span>
            )}
          </div>
          {e.objectif && (
            <p className="text-sm text-[#333333] mb-1">
              <span className="text-xs uppercase tracking-widest text-[#CCCCCC] mr-2">Objectif</span>
              {e.objectif}
            </p>
          )}
          {e.feedback && (
            <p className="text-sm text-[#666666]">
              <span className="text-xs uppercase tracking-widest text-[#CCCCCC] mr-2">Ressenti</span>
              {e.feedback}
            </p>
          )}
        </div>
        <div className="hidden group-hover:flex items-center gap-3 flex-shrink-0">
          <button onClick={onEdit} className="text-xs text-[#666666] hover:text-[#0A0A0A] transition-colors">Modifier</button>
          <button onClick={onDelete} className="text-xs text-[#CCCCCC] hover:text-[#C41230] transition-colors">Supprimer</button>
        </div>
      </div>
      {e.niveau_effort && (
        <div className="mt-3 flex gap-1">
          {[1, 2, 3, 4, 5].map(n => (
            <div key={n} className={`h-1 flex-1 rounded-full ${n <= e.niveau_effort! ? 'bg-[#C41230]' : 'bg-[#F0F0F0]'}`} />
          ))}
        </div>
      )}
    </div>
  )
}

function EntrainementModal({
  initial, onSave, onClose,
}: {
  initial: Entrainement | null
  onSave: (f: FormData) => Promise<void>
  onClose: () => void
}) {
  const [form, setForm] = useState<FormData>(
    initial
      ? { date: initial.date, duree_minutes: initial.duree_minutes, objectif: initial.objectif ?? '', feedback: initial.feedback ?? '', niveau_effort: initial.niveau_effort ?? 3 }
      : EMPTY
  )
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0F0F0]">
          <h2 className="font-semibold text-[#0A0A0A]">{initial ? 'Modifier la séance' : 'Ajouter une séance'}</h2>
          <button onClick={onClose} className="text-[#CCCCCC] hover:text-[#666666] transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date *">
              <input required type="date" value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Durée (min)">
              <input type="number" min={15} max={300} value={form.duree_minutes}
                onChange={e => setForm({ ...form, duree_minutes: Number(e.target.value) })} className={inputClass} />
            </Field>
          </div>

          <Field label="Objectif de la séance">
            <input type="text" value={form.objectif}
              onChange={e => setForm({ ...form, objectif: e.target.value })}
              placeholder="Ex: travailler mon uchi-mata" className={inputClass} />
          </Field>

          <Field label="Ressenti / Feedback">
            <textarea value={form.feedback}
              onChange={e => setForm({ ...form, feedback: e.target.value })}
              placeholder="Comment s'est passé l'entraînement ?"
              rows={3} className={`${inputClass} resize-none`} />
          </Field>

          <Field label={`Niveau d'effort — ${EFFORT_LABELS[form.niveau_effort].label}`}>
            <div className="flex gap-2 mt-1">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setForm({ ...form, niveau_effort: n })}
                  className={`flex-1 h-8 rounded-lg border transition-all text-xs font-medium ${
                    n <= form.niveau_effort
                      ? 'bg-[#C41230] border-[#C41230] text-white'
                      : 'bg-[#FAFAFA] border-[#E5E5E5] text-[#CCCCCC]'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </Field>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-[#E5E5E5] text-[#666666] py-3 rounded-lg text-sm transition-colors hover:border-[#CCCCCC]">
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
