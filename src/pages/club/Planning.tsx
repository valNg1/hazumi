import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
const CATEGORIES = ['enfants', 'ados', 'adultes', 'tous']

const CATEGORIE_COLORS: Record<string, string> = {
  enfants: 'bg-blue-50 text-blue-700',
  ados: 'bg-purple-50 text-purple-700',
  adultes: 'bg-green-50 text-green-700',
  tous: 'bg-gray-100 text-gray-700',
}

interface Cours {
  id: string
  titre: string
  jour: string
  heure_debut: string
  heure_fin: string
  intervenant?: string
  categorie?: string
  lieu?: string
}

interface FormData {
  titre: string
  jour: string
  heure_debut: string
  heure_fin: string
  intervenant: string
  categorie: string
  lieu: string
}

const EMPTY: FormData = {
  titre: '',
  jour: 'lundi',
  heure_debut: '18:00',
  heure_fin: '19:30',
  intervenant: '',
  categorie: 'tous',
  lieu: '',
}

export default function Planning() {
  const [cours, setCours] = useState<Cours[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected] = useState<Cours | null>(null)

  async function load() {
    const { data } = await supabase.from('cours').select('*').order('jour').order('heure_debut')
    setCours(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const byJour = JOURS.reduce<Record<string, Cours[]>>((acc, j) => {
    acc[j] = cours.filter(c => c.jour === j)
    return acc
  }, {})

  async function handleSave(form: FormData) {
    if (selected) {
      await supabase.from('cours').update(form).eq('id', selected.id)
    } else {
      await supabase.from('cours').insert(form)
    }
    await load()
    setShowModal(false)
    setSelected(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce cours ?')) return
    await supabase.from('cours').delete().eq('id', id)
    await load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">Planning des cours</h1>
          <p className="text-[#666666] text-sm mt-1">{cours.length} cours planifié{cours.length !== 1 ? 's' : ''}</p>
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {JOURS.map(jour => (
            <div key={jour} className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#F0F0F0] flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-[#0A0A0A] capitalize">{jour}</h2>
                <span className="text-xs text-[#CCCCCC]">{byJour[jour].length} cours</span>
              </div>
              <div className="p-3 space-y-2 min-h-16">
                {byJour[jour].length === 0 ? (
                  <p className="text-xs text-[#CCCCCC] text-center py-4">Aucun cours</p>
                ) : (
                  byJour[jour].map(c => (
                    <CoursCard
                      key={c.id}
                      cours={c}
                      onEdit={() => { setSelected(c); setShowModal(true) }}
                      onDelete={() => handleDelete(c.id)}
                    />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <CoursModal
          initial={selected}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setSelected(null) }}
        />
      )}
    </div>
  )
}

function CoursCard({ cours, onEdit, onDelete }: { cours: Cours; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="bg-[#FAFAFA] rounded-lg p-3 group relative">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#0A0A0A] truncate">{cours.titre}</p>
          <p className="text-xs text-[#999999] mt-0.5">
            {cours.heure_debut.slice(0, 5)} – {cours.heure_fin.slice(0, 5)}
          </p>
          {cours.intervenant && (
            <p className="text-xs text-[#666666] mt-1">{cours.intervenant}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          {cours.categorie && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORIE_COLORS[cours.categorie] ?? 'bg-gray-100 text-gray-600'}`}>
              {cours.categorie}
            </span>
          )}
        </div>
      </div>
      <div className="hidden group-hover:flex items-center gap-2 mt-2 pt-2 border-t border-[#EEEEEE]">
        <button onClick={onEdit} className="text-xs text-[#666666] hover:text-[#0A0A0A] transition-colors">Modifier</button>
        <button onClick={onDelete} className="text-xs text-[#CCCCCC] hover:text-[#C41230] transition-colors ml-auto">Supprimer</button>
      </div>
    </div>
  )
}

function CoursModal({
  initial, onSave, onClose,
}: {
  initial: Cours | null
  onSave: (f: FormData) => Promise<void>
  onClose: () => void
}) {
  const [form, setForm] = useState<FormData>(
    initial
      ? { titre: initial.titre, jour: initial.jour, heure_debut: initial.heure_debut.slice(0, 5), heure_fin: initial.heure_fin.slice(0, 5), intervenant: initial.intervenant ?? '', categorie: initial.categorie ?? 'tous', lieu: initial.lieu ?? '' }
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
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0F0F0]">
          <h2 className="font-semibold text-[#0A0A0A]">{initial ? 'Modifier le cours' : 'Ajouter un cours'}</h2>
          <button onClick={onClose} className="text-[#CCCCCC] hover:text-[#666666] transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Field label="Intitulé *">
            <input required type="text" value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })}
              placeholder="Ex: Judo adultes" className={inputClass} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Jour">
              <select value={form.jour} onChange={e => setForm({ ...form, jour: e.target.value })} className={inputClass}>
                {JOURS.map(j => <option key={j} value={j}>{j.charAt(0).toUpperCase() + j.slice(1)}</option>)}
              </select>
            </Field>
            <Field label="Catégorie">
              <select value={form.categorie} onChange={e => setForm({ ...form, categorie: e.target.value })} className={inputClass}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Début">
              <input type="time" value={form.heure_debut} onChange={e => setForm({ ...form, heure_debut: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Fin">
              <input type="time" value={form.heure_fin} onChange={e => setForm({ ...form, heure_fin: e.target.value })} className={inputClass} />
            </Field>
          </div>
          <Field label="Intervenant">
            <input type="text" value={form.intervenant} onChange={e => setForm({ ...form, intervenant: e.target.value })}
              placeholder="Nom du professeur" className={inputClass} />
          </Field>
          <Field label="Lieu">
            <input type="text" value={form.lieu} onChange={e => setForm({ ...form, lieu: e.target.value })}
              placeholder="Salle, dojo…" className={inputClass} />
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
