import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../../lib/supabase'

// Vacances scolaires Zone C (Paris) — périodes d'exclusion
const VACANCES_ZONE_C: { label: string; debut: string; fin: string }[] = [
  { label: 'Toussaint 2024',  debut: '2024-10-19', fin: '2024-11-04' },
  { label: 'Noël 2024',       debut: '2024-12-21', fin: '2025-01-06' },
  { label: 'Hiver 2025',      debut: '2025-02-22', fin: '2025-03-10' },
  { label: 'Printemps 2025',  debut: '2025-04-19', fin: '2025-05-05' },
  { label: 'Été 2025',        debut: '2025-07-05', fin: '2025-08-31' },
  { label: 'Toussaint 2025',  debut: '2025-10-18', fin: '2025-11-03' },
  { label: 'Noël 2025',       debut: '2025-12-20', fin: '2026-01-05' },
  { label: 'Hiver 2026',      debut: '2026-02-14', fin: '2026-03-02' },
  { label: 'Printemps 2026',  debut: '2026-04-18', fin: '2026-05-04' },
  { label: 'Été 2026',        debut: '2026-07-04', fin: '2026-08-31' },
]

const JOURS_SEMAINE = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
// JS getDay(): 0=dim, 1=lun ... 6=sam → mapping vers index 0=lun
const JS_DAY_TO_IDX: Record<number, number> = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 0: 6 }

function isInVacances(dateStr: string): boolean {
  return VACANCES_ZONE_C.some(v => dateStr >= v.debut && dateStr <= v.fin)
}

function generateRecurringDates(jourIdx: number, dateDebut: string, dateFin: string, skipVacances: boolean): string[] {
  const dates: string[] = []
  const d = new Date(dateDebut + 'T12:00:00')
  const end = new Date(dateFin + 'T12:00:00')
  // avancer jusqu'au bon jour de semaine
  while (JS_DAY_TO_IDX[d.getDay()] !== jourIdx) d.setDate(d.getDate() + 1)
  while (d <= end) {
    const str = d.toISOString().slice(0, 10)
    if (!skipVacances || !isInVacances(str)) dates.push(str)
    d.setDate(d.getDate() + 7)
  }
  return dates
}

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

interface Seance {
  id: string
  titre: string
  date: string
  heure_debut: string | null
  heure_fin: string | null
  duree_minutes: number
  categorie: string | null
  lieu: string | null
  intervenant: string | null
  notes: string | null
  _presenceCount?: number
}

type Tab = 'planning' | 'seances'

const inputClass = 'w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg px-3 py-2.5 text-sm text-[#0A0A0A] focus:outline-none focus:border-[#C41230] transition-colors'

export default function Planning() {
  const [tab, setTab] = useState<Tab>('planning')
  const [cours, setCours] = useState<Cours[]>([])
  const [seances, setSeances] = useState<Seance[]>([])
  const [loading, setLoading] = useState(true)
  const [showCoursModal, setShowCoursModal] = useState(false)
  const [showSeanceModal, setShowSeanceModal] = useState(false)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [selectedCours, setSelectedCours] = useState<Cours | null>(null)
  const [selectedSeance, setSelectedSeance] = useState<Seance | null>(null)
  const [generateCours, setGenerateCours] = useState<Cours | null>(null)

  async function loadCours() {
    const { data } = await supabase.from('cours').select('*').order('jour').order('heure_debut')
    setCours(data ?? [])
  }

  async function loadSeances() {
    const { data: s } = await supabase.from('seances').select('*').order('date').order('heure_debut')
    const { data: p } = await supabase.from('presences').select('seance_id')
    const counts: Record<string, number> = {}
    for (const x of p ?? []) counts[x.seance_id] = (counts[x.seance_id] ?? 0) + 1
    setSeances((s ?? []).map((x: Seance) => ({ ...x, _presenceCount: counts[x.id] ?? 0 })))
  }

  useEffect(() => {
    async function init() {
      await Promise.all([loadCours(), loadSeances()])
      setLoading(false)
    }
    init()
  }, [])

  const byJour = JOURS.reduce<Record<string, Cours[]>>((acc, j) => {
    acc[j] = cours.filter(c => c.jour === j)
    return acc
  }, {})

  const today = new Date().toISOString().slice(0, 10)
  const upcoming = seances.filter(s => s.date >= today)
  const past = seances.filter(s => s.date < today)

  async function handleSaveCours(form: CoursFormData) {
    if (selectedCours) {
      await supabase.from('cours').update(form).eq('id', selectedCours.id)
    } else {
      await supabase.from('cours').insert(form)
    }
    await loadCours()
    setShowCoursModal(false)
    setSelectedCours(null)
  }

  async function handleDeleteCours(id: string) {
    if (!confirm('Supprimer ce cours ?')) return
    await supabase.from('cours').delete().eq('id', id)
    await loadCours()
  }

  async function handleSaveSeance(form: SeanceFormData) {
    if (selectedSeance) {
      await supabase.from('seances').update(form).eq('id', selectedSeance.id)
    } else {
      await supabase.from('seances').insert(form)
    }
    await loadSeances()
    setShowSeanceModal(false)
    setSelectedSeance(null)
  }

  async function handleSaveBatchSeances(rows: SeanceFormData[]) {
    if (rows.length === 0) return
    const { error } = await supabase.from('seances').insert(rows)
    if (error) { alert(`Erreur lors de la création : ${error.message}`); return }
    await loadSeances()
    setShowSeanceModal(false)
    setSelectedSeance(null)
  }

  async function handleDeleteSeance(id: string) {
    if (!confirm('Supprimer cette séance ?')) return
    await supabase.from('seances').delete().eq('id', id)
    await loadSeances()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">Planning</h1>
        </div>
        <button
          onClick={() => {
            if (tab === 'planning') { setSelectedCours(null); setShowCoursModal(true) }
            else { setSelectedSeance(null); setShowSeanceModal(true) }
          }}
          className="bg-[#C41230] hover:bg-[#9B0E25] text-white text-xs uppercase tracking-widest px-5 py-2.5 rounded-lg transition-colors"
        >
          + Ajouter
        </button>
      </div>

      <div className="flex gap-1 mb-6 border-b border-[#E5E5E5]">
        {([['planning', 'Planning hebdo'], ['seances', 'Séances planifiées']] as [Tab, string][]).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm border-b-2 -mb-px transition-colors ${tab === t ? 'border-[#C41230] text-[#0A0A0A] font-medium' : 'border-transparent text-[#999999] hover:text-[#666666]'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-[#999999] text-sm">Chargement…</div>
      ) : tab === 'planning' ? (
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
                      onEdit={() => { setSelectedCours(c); setShowCoursModal(true) }}
                      onDelete={() => handleDeleteCours(c.id)}
                      onGenerate={() => { setGenerateCours(c); setShowGenerateModal(true) }}
                    />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          {upcoming.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xs uppercase tracking-widest text-[#999999] mb-3">À venir — {upcoming.length} séance{upcoming.length !== 1 ? 's' : ''}</h2>
              <div className="space-y-3">
                {upcoming.map(s => (
                  <SeanceCard
                    key={s.id}
                    seance={s}
                    onEdit={() => { setSelectedSeance(s); setShowSeanceModal(true) }}
                    onDelete={() => handleDeleteSeance(s.id)}
                  />
                ))}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h2 className="text-xs uppercase tracking-widest text-[#999999] mb-3">Passées — {past.length} séance{past.length !== 1 ? 's' : ''}</h2>
              <div className="space-y-3 opacity-60">
                {[...past].reverse().map(s => (
                  <SeanceCard
                    key={s.id}
                    seance={s}
                    onEdit={() => { setSelectedSeance(s); setShowSeanceModal(true) }}
                    onDelete={() => handleDeleteSeance(s.id)}
                  />
                ))}
              </div>
            </div>
          )}
          {seances.length === 0 && (
            <div className="text-center py-16 text-[#CCCCCC] text-sm">
              Aucune séance planifiée. Cliquez sur "+ Ajouter" pour créer la première.
            </div>
          )}
        </div>
      )}

      {showCoursModal && (
        <CoursModal
          initial={selectedCours}
          onSave={handleSaveCours}
          onClose={() => { setShowCoursModal(false); setSelectedCours(null) }}
        />
      )}
      {showGenerateModal && generateCours && (
        <GenerateModal
          cours={generateCours}
          onSaveBatch={handleSaveBatchSeances}
          onClose={() => { setShowGenerateModal(false); setGenerateCours(null) }}
        />
      )}
      {showSeanceModal && (
        <SeanceModal
          initial={selectedSeance}
          coursList={cours}
          onSave={handleSaveSeance}
          onSaveBatch={handleSaveBatchSeances}
          onClose={() => { setShowSeanceModal(false); setSelectedSeance(null) }}
        />
      )}
    </div>
  )
}

function CoursCard({ cours, onEdit, onDelete, onGenerate }: { cours: Cours; onEdit: () => void; onDelete: () => void; onGenerate: () => void }) {
  return (
    <div className="bg-[#FAFAFA] rounded-lg p-3 group relative">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#0A0A0A] truncate">{cours.titre}</p>
          <p className="text-xs text-[#999999] mt-0.5">
            {cours.heure_debut.slice(0, 5)} – {cours.heure_fin.slice(0, 5)}
          </p>
          {cours.intervenant && <p className="text-xs text-[#666666] mt-1">{cours.intervenant}</p>}
        </div>
        {cours.categorie && (
          <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${CATEGORIE_COLORS[cours.categorie] ?? 'bg-gray-100 text-gray-600'}`}>
            {cours.categorie}
          </span>
        )}
      </div>
      <div className="hidden group-hover:flex items-center gap-2 mt-2 pt-2 border-t border-[#EEEEEE]">
        <button onClick={onEdit} className="text-xs text-[#666666] hover:text-[#0A0A0A] transition-colors">Modifier</button>
        <button onClick={onGenerate} className="text-xs text-[#C41230] hover:text-[#9B0E25] transition-colors font-medium">Générer séances</button>
        <button onClick={onDelete} className="text-xs text-[#CCCCCC] hover:text-[#C41230] transition-colors ml-auto">Supprimer</button>
      </div>
    </div>
  )
}

function GenerateModal({ cours, onClose, onSaveBatch }: { cours: Cours; onClose: () => void; onSaveBatch: (rows: SeanceFormData[]) => Promise<void> }) {
  const now = new Date()
  const defaultFin = `${now.getMonth() < 6 ? now.getFullYear() : now.getFullYear() + 1}-06-30`
  const [dateDebut, setDateDebut] = useState(now.toISOString().slice(0, 10))
  const [dateFin, setDateFin] = useState(defaultFin)
  const [skipVacances, setSkipVacances] = useState(true)
  const [saving, setSaving] = useState(false)

  const jourIdx = JOURS.indexOf(cours.jour)
  const [h1, m1] = cours.heure_debut.split(':').map(Number)
  const [h2, m2] = cours.heure_fin.split(':').map(Number)
  const duree = Math.max((h2 * 60 + m2) - (h1 * 60 + m1), 30)

  const preview = useMemo(
    () => jourIdx >= 0 ? generateRecurringDates(jourIdx, dateDebut, dateFin, skipVacances) : [],
    [jourIdx, dateDebut, dateFin, skipVacances]
  )
  const skipped = useMemo(() => {
    if (!skipVacances || jourIdx < 0) return []
    return generateRecurringDates(jourIdx, dateDebut, dateFin, false).filter(d => isInVacances(d))
  }, [jourIdx, dateDebut, dateFin, skipVacances])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (preview.length === 0) { alert('Aucune séance générée. Vérifiez la plage de dates.'); return }
    setSaving(true)
    const rows: SeanceFormData[] = preview.map(date => ({
      titre: cours.titre,
      date,
      heure_debut: cours.heure_debut.slice(0, 5),
      heure_fin: cours.heure_fin.slice(0, 5),
      duree_minutes: duree,
      categorie: cours.categorie ?? 'tous',
      lieu: cours.lieu ?? '',
      intervenant: cours.intervenant ?? '',
      notes: '',
    }))
    await onSaveBatch(rows)
    setSaving(false)
  }

  return (
    <Modal title={`Générer les séances — ${cours.titre}`} onClose={onClose}>
      <form onSubmit={submit} className="p-6 space-y-4">
        <div className="bg-[#F5F5F5] rounded-lg px-4 py-3 text-sm text-[#666666]">
          <span className="capitalize font-medium text-[#0A0A0A]">{cours.jour}</span>
          {' · '}{cours.heure_debut.slice(0, 5)}–{cours.heure_fin.slice(0, 5)}
          {' · '}{duree} min
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Du"><input required type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} className={inputClass} /></Field>
          <Field label="Au"><input required type="date" value={dateFin} onChange={e => setDateFin(e.target.value)} className={inputClass} /></Field>
        </div>
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input type="checkbox" checked={skipVacances} onChange={e => setSkipVacances(e.target.checked)} className="w-4 h-4 accent-[#C41230]" />
          <span className="text-sm text-[#333333]">Ignorer les vacances scolaires Zone C (Paris)</span>
        </label>
        {preview.length > 0 && (
          <div className="bg-[#FAFAFA] rounded-lg p-3">
            <p className="text-xs text-[#999999] mb-2">
              <span className="font-semibold text-[#0A0A0A]">{preview.length} séance{preview.length !== 1 ? 's' : ''}</span> seront créées
              {skipped.length > 0 && ` · ${skipped.length} ignorée${skipped.length !== 1 ? 's' : ''} (vacances)`}
            </p>
            <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto">
              {preview.map(d => (
                <span key={d} className="text-xs bg-white border border-[#E5E5E5] rounded px-1.5 py-0.5 text-[#666666]">
                  {new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </span>
              ))}
            </div>
            {skipped.length > 0 && (
              <div className="mt-2 pt-2 border-t border-[#F0F0F0] flex flex-wrap gap-1">
                {skipped.map(d => (
                  <span key={d} className="text-xs bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 text-amber-600 line-through">
                    {new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
        <ModalActions onClose={onClose} saving={saving} isEdit={false} label={preview.length > 0 ? `Créer ${preview.length} séances` : 'Générer'} />
      </form>
    </Modal>
  )
}

function SeanceCard({ seance, onEdit, onDelete }: { seance: Seance; onEdit: () => void; onDelete: () => void }) {
  const d = new Date(seance.date + 'T12:00:00')
  const dateLabel = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  return (
    <div className="bg-white rounded-xl border border-[#E5E5E5] p-4 group flex items-start gap-4">
      <div className="flex-shrink-0 text-center w-12">
        <p className="text-xs text-[#999999] uppercase">{d.toLocaleDateString('fr-FR', { month: 'short' })}</p>
        <p className="text-xl font-bold text-[#0A0A0A] leading-none">{d.getDate()}</p>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-[#0A0A0A] text-sm">{seance.titre}</p>
        <p className="text-xs text-[#999999] mt-0.5 capitalize">{dateLabel}</p>
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          {seance.heure_debut && (
            <span className="text-xs text-[#666666]">{seance.heure_debut.slice(0, 5)}{seance.heure_fin ? ` – ${seance.heure_fin.slice(0, 5)}` : ''}</span>
          )}
          <span className="text-xs text-[#666666]">{seance.duree_minutes} min</span>
          {seance.categorie && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORIE_COLORS[seance.categorie] ?? 'bg-gray-100 text-gray-600'}`}>{seance.categorie}</span>
          )}
          {seance.lieu && <span className="text-xs text-[#999999]">{seance.lieu}</span>}
        </div>
        {(seance._presenceCount ?? 0) > 0 && (
          <p className="text-xs text-[#C41230] mt-1.5 font-medium">{seance._presenceCount} présence{(seance._presenceCount ?? 0) !== 1 ? 's' : ''} confirmée{(seance._presenceCount ?? 0) !== 1 ? 's' : ''}</p>
        )}
      </div>
      <div className="hidden group-hover:flex items-center gap-2 flex-shrink-0">
        <button onClick={onEdit} className="text-xs text-[#666666] hover:text-[#0A0A0A] transition-colors">Modifier</button>
        <button onClick={onDelete} className="text-xs text-[#CCCCCC] hover:text-[#C41230] transition-colors">Supprimer</button>
      </div>
    </div>
  )
}

interface CoursFormData { titre: string; jour: string; heure_debut: string; heure_fin: string; intervenant: string; categorie: string; lieu: string }
const COURS_EMPTY: CoursFormData = { titre: '', jour: 'lundi', heure_debut: '18:00', heure_fin: '19:30', intervenant: '', categorie: 'tous', lieu: '' }

function CoursModal({ initial, onSave, onClose }: { initial: Cours | null; onSave: (f: CoursFormData) => Promise<void>; onClose: () => void }) {
  const [form, setForm] = useState<CoursFormData>(
    initial ? { titre: initial.titre, jour: initial.jour, heure_debut: initial.heure_debut.slice(0, 5), heure_fin: initial.heure_fin.slice(0, 5), intervenant: initial.intervenant ?? '', categorie: initial.categorie ?? 'tous', lieu: initial.lieu ?? '' } : COURS_EMPTY
  )
  const [saving, setSaving] = useState(false)
  async function submit(e: React.FormEvent) { e.preventDefault(); setSaving(true); await onSave(form); setSaving(false) }
  return (
    <Modal title={initial ? 'Modifier le cours' : 'Ajouter un cours'} onClose={onClose}>
      <form onSubmit={submit} className="p-6 space-y-4">
        <Field label="Intitulé *"><input required type="text" value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })} className={inputClass} /></Field>
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
          <Field label="Début"><input type="time" value={form.heure_debut} onChange={e => setForm({ ...form, heure_debut: e.target.value })} className={inputClass} /></Field>
          <Field label="Fin"><input type="time" value={form.heure_fin} onChange={e => setForm({ ...form, heure_fin: e.target.value })} className={inputClass} /></Field>
        </div>
        <Field label="Intervenant"><input type="text" value={form.intervenant} onChange={e => setForm({ ...form, intervenant: e.target.value })} placeholder="Nom du professeur" className={inputClass} /></Field>
        <Field label="Lieu"><input type="text" value={form.lieu} onChange={e => setForm({ ...form, lieu: e.target.value })} placeholder="Salle, dojo…" className={inputClass} /></Field>
        <ModalActions onClose={onClose} saving={saving} isEdit={!!initial} />
      </form>
    </Modal>
  )
}

interface SeanceFormData { titre: string; date: string; heure_debut: string; heure_fin: string; duree_minutes: number; categorie: string; lieu: string; intervenant: string; notes: string }
const SEANCE_EMPTY: SeanceFormData = { titre: '', date: new Date().toISOString().slice(0, 10), heure_debut: '18:00', heure_fin: '19:30', duree_minutes: 90, categorie: 'tous', lieu: '', intervenant: '', notes: '' }

interface RecurringOpts { enabled: boolean; jourIdx: number; dateFin: string; skipVacances: boolean }

function SeanceModal({ initial, coursList, onSave, onSaveBatch, onClose }: {
  initial: Seance | null
  coursList: Cours[]
  onSave: (f: SeanceFormData) => Promise<void>
  onSaveBatch: (rows: SeanceFormData[]) => Promise<void>
  onClose: () => void
}) {
  const [form, setForm] = useState<SeanceFormData>(
    initial ? { titre: initial.titre, date: initial.date, heure_debut: initial.heure_debut?.slice(0, 5) ?? '18:00', heure_fin: initial.heure_fin?.slice(0, 5) ?? '19:30', duree_minutes: initial.duree_minutes, categorie: initial.categorie ?? 'tous', lieu: initial.lieu ?? '', intervenant: initial.intervenant ?? '', notes: initial.notes ?? '' } : SEANCE_EMPTY
  )
  const defaultDateFin = (() => {
    const now = new Date()
    // Fin de saison = 30 juin de l'année prochaine (ou cette année si on est avant juillet)
    const year = now.getMonth() < 6 ? now.getFullYear() : now.getFullYear() + 1
    return `${year}-06-30`
  })()

  const [rec, setRec] = useState<RecurringOpts>({
    enabled: false,
    jourIdx: 1,
    dateFin: defaultDateFin,
    skipVacances: true,
  })
  const [saving, setSaving] = useState(false)

  function prefill(coursId: string) {
    const c = coursList.find(x => x.id === coursId)
    if (!c) return
    const [h1, m1] = c.heure_debut.split(':').map(Number)
    const [h2, m2] = c.heure_fin.split(':').map(Number)
    const dur = (h2 * 60 + m2) - (h1 * 60 + m1)
    const jourIdx = JOURS.indexOf(c.jour)
    setForm(f => ({ ...f, titre: c.titre, heure_debut: c.heure_debut.slice(0, 5), heure_fin: c.heure_fin.slice(0, 5), duree_minutes: dur > 0 ? dur : 90, categorie: c.categorie ?? 'tous', lieu: c.lieu ?? '', intervenant: c.intervenant ?? '' }))
    if (jourIdx >= 0) setRec(r => ({ ...r, jourIdx }))
  }

  const preview = useMemo(() => {
    if (!rec.enabled) return []
    return generateRecurringDates(rec.jourIdx, form.date, rec.dateFin, rec.skipVacances)
  }, [rec, form.date])

  const vacancesSkipped = useMemo(() => {
    if (!rec.enabled || !rec.skipVacances) return []
    const all = generateRecurringDates(rec.jourIdx, form.date, rec.dateFin, false)
    return all.filter(d => isInVacances(d))
  }, [rec, form.date])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (rec.enabled && !initial && preview.length === 0) {
      alert('Aucune séance générée. Vérifiez le jour de répétition et la plage de dates.')
      return
    }
    setSaving(true)
    if (rec.enabled && !initial) {
      const rows = preview.map(date => ({ ...form, date }))
      await onSaveBatch(rows)
    } else {
      await onSave(form)
    }
    setSaving(false)
  }

  return (
    <Modal title={initial ? 'Modifier la séance' : 'Ajouter une séance'} onClose={onClose}>
      <form onSubmit={submit} className="p-6 space-y-4">
        {coursList.length > 0 && !initial && (
          <Field label="Basée sur un cours (optionnel)">
            <select onChange={e => e.target.value && prefill(e.target.value)} className={inputClass} defaultValue="">
              <option value="">— Choisir un cours —</option>
              {coursList.map(c => <option key={c.id} value={c.id}>{c.titre} ({c.jour} {c.heure_debut.slice(0, 5)})</option>)}
            </select>
          </Field>
        )}

        <Field label="Intitulé *">
          <input required type="text" value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })} placeholder="Ex: Judo adultes" className={inputClass} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Début"><input type="time" value={form.heure_debut} onChange={e => setForm({ ...form, heure_debut: e.target.value })} className={inputClass} /></Field>
          <Field label="Fin"><input type="time" value={form.heure_fin} onChange={e => setForm({ ...form, heure_fin: e.target.value })} className={inputClass} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Durée (min)"><input type="number" min={15} max={300} value={form.duree_minutes} onChange={e => setForm({ ...form, duree_minutes: Number(e.target.value) })} className={inputClass} /></Field>
          <Field label="Catégorie">
            <select value={form.categorie} onChange={e => setForm({ ...form, categorie: e.target.value })} className={inputClass}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Lieu"><input type="text" value={form.lieu} onChange={e => setForm({ ...form, lieu: e.target.value })} placeholder="Dojo, salle…" className={inputClass} /></Field>
          <Field label="Intervenant"><input type="text" value={form.intervenant} onChange={e => setForm({ ...form, intervenant: e.target.value })} placeholder="Prof…" className={inputClass} /></Field>
        </div>

        {/* Récurrence — uniquement en création */}
        {!initial && (
          <div className="border border-[#E5E5E5] rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setRec(r => ({ ...r, enabled: !r.enabled }))}
              className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-[#FAFAFA] transition-colors"
            >
              <span className="font-medium text-[#0A0A0A]">Répéter cette séance</span>
              <div className={`w-9 h-5 rounded-full transition-colors relative ${rec.enabled ? 'bg-[#C41230]' : 'bg-[#E5E5E5]'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${rec.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
            </button>

            {rec.enabled && (
              <div className="px-4 pb-4 space-y-3 border-t border-[#F0F0F0]">
                <div className="grid grid-cols-2 gap-3 pt-3">
                  <Field label="Jour de répétition">
                    <select value={rec.jourIdx} onChange={e => setRec(r => ({ ...r, jourIdx: Number(e.target.value) }))} className={inputClass}>
                      {JOURS_SEMAINE.map((j, i) => <option key={i} value={i}>{j}</option>)}
                    </select>
                  </Field>
                  <Field label="Date de début">
                    <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className={inputClass} />
                  </Field>
                </div>
                <Field label="Jusqu'au">
                  <input required type="date" value={rec.dateFin} onChange={e => setRec(r => ({ ...r, dateFin: e.target.value }))} className={inputClass} />
                </Field>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rec.skipVacances}
                    onChange={e => setRec(r => ({ ...r, skipVacances: e.target.checked }))}
                    className="w-4 h-4 accent-[#C41230]"
                  />
                  <span className="text-sm text-[#333333]">Ignorer les vacances scolaires Zone C (Paris)</span>
                </label>

                {preview.length > 0 && (
                  <div className="bg-[#FAFAFA] rounded-lg p-3">
                    <p className="text-xs text-[#999999] mb-2">
                      <span className="font-semibold text-[#0A0A0A]">{preview.length} séance{preview.length !== 1 ? 's' : ''}</span> seront créées
                      {vacancesSkipped.length > 0 && ` · ${vacancesSkipped.length} date${vacancesSkipped.length !== 1 ? 's' : ''} ignorée${vacancesSkipped.length !== 1 ? 's' : ''} (vacances)`}
                    </p>
                    <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto">
                      {preview.map(d => (
                        <span key={d} className="text-xs bg-white border border-[#E5E5E5] rounded px-1.5 py-0.5 text-[#666666]">
                          {new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </span>
                      ))}
                    </div>
                    {rec.skipVacances && vacancesSkipped.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-[#F0F0F0]">
                        <p className="text-xs text-[#CCCCCC] mb-1">Dates ignorées :</p>
                        <div className="flex flex-wrap gap-1">
                          {vacancesSkipped.map(d => (
                            <span key={d} className="text-xs bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 text-amber-600 line-through">
                              {new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {!rec.enabled && !initial && (
          <Field label="Date *">
            <input required type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className={inputClass} />
          </Field>
        )}

        <Field label="Notes">
          <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Informations complémentaires…" className={`${inputClass} resize-none`} />
        </Field>

        <ModalActions onClose={onClose} saving={saving} isEdit={!!initial} label={rec.enabled && !initial && preview.length > 0 ? `Créer ${preview.length} séances` : undefined} />
      </form>
    </Modal>
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0F0F0]">
          <h2 className="font-semibold text-[#0A0A0A]">{title}</h2>
          <button onClick={onClose} className="text-[#CCCCCC] hover:text-[#666666] transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function ModalActions({ onClose, saving, isEdit, label }: { onClose: () => void; saving: boolean; isEdit: boolean; label?: string }) {
  return (
    <div className="flex gap-3 pt-2">
      <button type="button" onClick={onClose} className="flex-1 border border-[#E5E5E5] text-[#666666] py-3 rounded-lg text-sm transition-colors hover:border-[#CCCCCC]">Annuler</button>
      <button type="submit" disabled={saving} className="flex-1 bg-[#C41230] hover:bg-[#9B0E25] text-white py-3 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
        {saving ? '…' : label ?? (isEdit ? 'Enregistrer' : 'Ajouter')}
      </button>
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
