import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../../lib/supabase'
import TrainingModal from '../../components/TrainingModal'
import { generateRecurrenceDates, toStr, getMonday } from '../../lib/training'
import type { TrainingForm } from '../../lib/training'

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
  statut?: 'planifie' | 'fait' | 'annule'
}

interface CompetEvent {
  id: string
  competition_id: string
  nom: string
  date: string
  lieu?: string
  niveau?: string
  eventType?: string
}

const EVENT_ICONS: Record<string, string> = {
  competition: '🏆', grade: '🥋', arbitrage: '🤝', stage: '📚', ag: '🏛️', autre: '📅',
}

type ViewMode = 'semaine' | 'mois' | 'trimestre' | 'annee'

const MOIS_LABELS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
const JOURS_COURTS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

function addDays(date: Date, n: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function fmtDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? (m > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`) : `${m}min`
}

interface PersonalTraining {
  id: string
  type: string
  date: string
  heure_debut: string | null
  heure_fin: string | null
}

export default function Entrainements() {
  const [judokaId, setJudokaId] = useState<string | null>(null)
  const [seances, setSeances] = useState<Seance[]>([])
  const [_personalTrainings, setPersonalTrainings] = useState<PersonalTraining[]>([])
  const [competEvents, setCompetEvents] = useState<CompetEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<ViewMode>('semaine')
  const [cursor, setCursor] = useState(new Date())
  const [showTrainingModal, setShowTrainingModal] = useState(false)
  const [creatingTraining, setCreatingTraining] = useState(false)

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: judoka } = await supabase.from('judokas').select('id, club_id').eq('user_id', user.id).single()
    if (!judoka) return
    const { data: s } = await supabase.from('planification_entrainements').select('*').eq('judoka_id', judoka.id).order('date')
    setJudokaId(judoka.id)
    const seancesData: Seance[] = (s ?? []).map((t: any) => ({
      id: t.id,
      titre: t.type,
      date: t.date,
      heure_debut: t.heure_debut,
      heure_fin: t.heure_fin,
      duree_minutes: 0,
      categorie: null,
      lieu: null,
      intervenant: null,
      notes: t.notes,
      statut: t.statut || 'planifie',
    }))
    setSeances(seancesData)
    setPersonalTrainings(s ?? [])
    setCompetEvents([])
  }

  async function updateStatut(seanceId: string, newStatut: 'planifie' | 'fait' | 'annule') {
    console.log('[Training] updateStatut appelé:', seanceId, newStatut)
    const { data, error } = await supabase.from('planification_entrainements').update({ statut: newStatut }).eq('id', seanceId)
    console.log('[Training] UPDATE result:', data, error)
    if (!error) {
      console.log('[Training] statut mis à jour avec succès')
      await loadData()
    } else {
      console.error('[Training] erreur UPDATE:', error)
    }
  }

  useEffect(() => {
    async function load() {
      await loadData()
      setLoading(false)
    }
    load()
  }, [])


  async function handleSaveTraining(form: TrainingForm) {
    console.log('[Training] form data:', form)
    console.log('[Training] judoka_id:', judokaId)

    if (!judokaId) {
      console.error('[Training] judoka_id is null')
      return
    }
    if (!form.heureDebut || !form.heureFin) {
      alert('Heures requises')
      return
    }
    if (!form.isRecurrent && !form.dateSingle) {
      alert('Date requise')
      return
    }
    if (form.isRecurrent && (!form.dateDebut || form.joursRecurrence.length === 0)) {
      alert('Configuration récurrence requise')
      return
    }

    setCreatingTraining(true)
    try {
      const toInsert = form.isRecurrent && form.dateDebut
        ? generateRecurrenceDates(form.dateDebut, form.dateFin ?? null, form.joursRecurrence, form.excludeWeekends, form.excludeHolidays, (form.zone as 'metropole' | 'domtom' | 'autre')).map(date => ({
            judoka_id: judokaId,
            type: form.type,
            date,
            heure_debut: form.heureDebut || null,
            heure_fin: form.heureFin || null,
            notes: form.notes || null,
            recurrent: true,
            date_debut_recurrence: form.dateDebut,
            date_fin_recurrence: form.dateFin || null,
            jours_recurrence: form.joursRecurrence,
          }))
        : [{
            judoka_id: judokaId,
            type: form.type,
            date: form.dateSingle!,
            heure_debut: form.heureDebut || null,
            heure_fin: form.heureFin || null,
            notes: form.notes || null,
            recurrent: false,
            date_debut_recurrence: undefined,
            date_fin_recurrence: null,
            jours_recurrence: [],
          } as any]

      console.log('[Training] toInsert:', toInsert)
      const { error } = await supabase.from('planification_entrainements').insert(toInsert)
      console.log('[Training] erreur:', error)

      if (error) {
        console.error('[Training] Supabase error:', error)
        alert(`Erreur: ${error.message}`)
        return
      }

      console.log('[Training] Succès - données enregistrées')
    } catch (err) {
      console.error('[Training] Exception:', err)
      console.log('[Training] erreur:', err)
      alert('Erreur lors de l\'enregistrement')
    } finally {
      setCreatingTraining(false)
    }
  }

  const today = toStr(new Date())
  const past = useMemo(() => seances.filter(s => s.date < today && s.statut === 'fait'), [seances, today])
  const upcoming = useMemo(() => seances.filter(s => s.date >= today && s.statut === 'planifie'), [seances, today])
  const realised = useMemo(() => seances.filter(s => s.date < today && s.statut === 'fait'), [seances])
  const realised_upcoming = useMemo(() => seances.filter(s => s.date >= today && s.statut === 'fait'), [seances])

  const totalMinPast = past.reduce((sum, s) => sum + s.duree_minutes, 0)
  const pctRealised = (realised.length + realised_upcoming.length) > 0 && (realised.length + realised_upcoming.length) <= (seances.length) ? Math.round(((realised.length + realised_upcoming.length) / (seances.length)) * 100) : 0

  function navigate(dir: 1 | -1) {
    const d = new Date(cursor)
    if (view === 'semaine') d.setDate(d.getDate() + dir * 7)
    else if (view === 'mois') d.setMonth(d.getMonth() + dir)
    else if (view === 'trimestre') d.setMonth(d.getMonth() + dir * 3)
    else d.setFullYear(d.getFullYear() + dir)
    setCursor(d)
  }

  const navLabel = useMemo(() => {
    if (view === 'semaine') {
      const mon = getMonday(cursor)
      const sun = addDays(mon, 6)
      const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
      return `${mon.toLocaleDateString('fr-FR', opts)} – ${sun.toLocaleDateString('fr-FR', opts)} ${sun.getFullYear()}`
    }
    if (view === 'mois') return `${MOIS_LABELS[cursor.getMonth()]} ${cursor.getFullYear()}`
    if (view === 'trimestre') {
      const q = Math.floor(cursor.getMonth() / 3)
      return `T${q + 1} ${cursor.getFullYear()}`
    }
    return String(cursor.getFullYear())
  }, [view, cursor])

  const visibleSeances = useMemo(() => {
    if (view === 'semaine') {
      const mon = getMonday(cursor)
      const sun = addDays(mon, 6)
      return seances.filter(s => s.date >= toStr(mon) && s.date <= toStr(sun))
    }
    if (view === 'mois') {
      const prefix = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`
      return seances.filter(s => s.date.startsWith(prefix))
    }
    if (view === 'trimestre') {
      const q = Math.floor(cursor.getMonth() / 3)
      const start = new Date(cursor.getFullYear(), q * 3, 1)
      const end = new Date(cursor.getFullYear(), q * 3 + 3, 0)
      return seances.filter(s => s.date >= toStr(start) && s.date <= toStr(end))
    }
    return seances.filter(s => s.date.startsWith(String(cursor.getFullYear())))
  }, [seances, view, cursor])

  const visibleCompets = useMemo(() => {
    if (view === 'semaine') {
      const mon = getMonday(cursor)
      const sun = addDays(mon, 6)
      return competEvents.filter(c => c.date >= toStr(mon) && c.date <= toStr(sun))
    }
    if (view === 'mois') {
      const prefix = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`
      return competEvents.filter(c => c.date.startsWith(prefix))
    }
    if (view === 'trimestre') {
      const q = Math.floor(cursor.getMonth() / 3)
      const start = new Date(cursor.getFullYear(), q * 3, 1)
      const end = new Date(cursor.getFullYear(), q * 3 + 3, 0)
      return competEvents.filter(c => c.date >= toStr(start) && c.date <= toStr(end))
    }
    return competEvents.filter(c => c.date.startsWith(String(cursor.getFullYear())))
  }, [competEvents, view, cursor])

  if (loading) return <div className="text-center py-16 text-[#999999] text-sm">Chargement…</div>

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">Mes entraînements</h1>
          <p className="text-[#999999] text-sm mt-0.5">Séances planifiées par le club</p>
        </div>
        <button
          onClick={() => setShowTrainingModal(true)}
          className="bg-[#C41230] hover:bg-[#9B0E25] text-white text-xs uppercase tracking-widest px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap"
        >
          Organiser mes entraînements
        </button>
      </div>

      {/* Recap panel */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <RecapCard label="Séances réalisées" value={String(realised.length)} sub={fmtDuration(totalMinPast)} accent />
        <RecapCard label="Séances à venir" value={String(upcoming.length)} sub={`${upcoming.length} séance${upcoming.length !== 1 ? 's' : ''} planifiée${upcoming.length !== 1 ? 's' : ''}`} />
        <RecapCard label="Total réalisé" value={String(realised.length + realised_upcoming.length)} sub={`${realised.length + realised_upcoming.length} séance${(realised.length + realised_upcoming.length) !== 1 ? 's' : ''}`} accent />
        <RecapCard label="Taux de réalisation" value={`${pctRealised}%`} sub={`sur ${seances.length} total`} accent />
      </div>

      {/* View tabs + navigation */}
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <div className="flex gap-1 border border-[#E5E5E5] rounded-lg p-0.5">
          {(['semaine', 'mois', 'trimestre', 'annee'] as ViewMode[]).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-md text-xs transition-all capitalize ${view === v ? 'bg-[#0A0A0A] text-white font-medium' : 'text-[#999999] hover:text-[#666666]'}`}
            >
              {v === 'annee' ? 'Année' : v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#E5E5E5] text-[#666666] hover:border-[#CCCCCC] transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="text-sm text-[#0A0A0A] font-medium min-w-48 text-center">{navLabel}</span>
          <button onClick={() => navigate(1)} className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#E5E5E5] text-[#666666] hover:border-[#CCCCCC] transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
          <button onClick={() => setCursor(new Date())} className="text-xs text-[#C41230] hover:underline ml-1">Aujourd'hui</button>
        </div>
      </div>

      {/* Agenda */}
      {view === 'semaine' ? (
        <WeekView seances={visibleSeances} competEvents={visibleCompets} cursor={cursor} today={today} onStatusChange={updateStatut} />
      ) : view === 'mois' ? (
        <MonthView seances={visibleSeances} competEvents={visibleCompets} cursor={cursor} today={today} />
      ) : (
        <ListView seances={visibleSeances} competEvents={visibleCompets} today={today} groupBy={view === 'annee' || view === 'trimestre' ? 'month' : 'week'} />
      )}

      <TrainingModal isOpen={showTrainingModal} onClose={() => setShowTrainingModal(false)} onSave={handleSaveTraining} onSuccess={loadData} isLoading={creatingTraining} />
    </div>
  )
}

function RecapCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${accent ? 'border-[#C41230]/20 bg-[#FFF5F6]' : 'border-[#E5E5E5] bg-white'}`}>
      <p className="text-xs uppercase tracking-widest text-[#999999] mb-1">{label}</p>
      <p className={`text-2xl font-bold ${accent ? 'text-[#C41230]' : 'text-[#0A0A0A]'}`}>{value}</p>
      <p className="text-xs text-[#999999] mt-0.5">{sub}</p>
    </div>
  )
}

function CompetPill({ event, compact }: { event: CompetEvent; compact?: boolean }) {
  const icon = EVENT_ICONS[event.eventType ?? 'competition'] ?? '📅'
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
      <div className="flex items-start gap-2">
        <span className="text-base leading-none flex-shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-amber-900 truncate">{event.nom}</p>
          {!compact && event.lieu && <p className="text-xs text-amber-600 mt-0.5">{event.lieu}</p>}
        </div>
      </div>
    </div>
  )
}

function SeancePill({ seance, today, compact, onStatusChange }: {
  seance: Seance; today: string; compact?: boolean; onStatusChange?: (statut: 'planifie' | 'fait' | 'annule') => void
}) {
  const isPast = seance.date < today
  const isToday = seance.date === today
  const statut = seance.statut || 'planifie'

  const bgClass = statut === 'fait' ? 'border-[#22B14C]/30 bg-[#F0FFF4]'
    : statut === 'annule' ? 'border-[#F0F0F0] bg-[#FAFAFA]'
    : isPast ? 'border-[#F0F0F0] bg-[#FAFAFA]'
    : isToday ? 'border-[#C41230]/30 bg-[#FFF5F6]'
    : 'border-[#E5E5E5] bg-white'

  const textClass = statut === 'annule' ? 'line-through text-[#999999]' : 'text-[#0A0A0A]'

  return (
    <div className={`rounded-lg border p-3 transition-all ${bgClass}`}>
      {compact && onStatusChange && (
        <div className="space-y-2">
          <p className={`text-sm font-medium whitespace-normal ${textClass}`}>{seance.titre}</p>
          <div className="flex gap-1.5">
            {statut === 'planifie' ? (
              <>
                <button onClick={() => { console.log('[Training] clic statut:', seance.id, 'fait'); onStatusChange('fait') }} className="px-2.5 py-0.5 text-[11px] rounded border border-[#E5E5E5] text-[#999999] hover:border-[#22B14C] hover:text-[#22B14C] transition-colors">Fait</button>
                <button onClick={() => { console.log('[Training] clic statut:', seance.id, 'annule'); onStatusChange('annule') }} className="px-2.5 py-0.5 text-[11px] rounded border border-[#E5E5E5] text-[#999999] hover:border-[#999999] transition-colors">Annulé</button>
              </>
            ) : statut === 'fait' ? (
              <>
                <span className="px-2.5 py-0.5 text-[11px] rounded border border-[#22B14C] text-[#22B14C] bg-white">Fait</span>
                <button onClick={() => { console.log('[Training] clic statut:', seance.id, 'planifie'); onStatusChange('planifie') }} className="px-2.5 py-0.5 text-[11px] rounded border border-[#E5E5E5] text-[#999999] hover:border-[#E5E5E5] hover:bg-[#F9F9F9]">Annuler</button>
              </>
            ) : statut === 'annule' ? (
              <>
                <span className="px-2.5 py-0.5 text-[11px] rounded border border-[#999999] text-[#999999] bg-white line-through">Annulé</span>
                <button onClick={() => { console.log('[Training] clic statut:', seance.id, 'planifie'); onStatusChange('planifie') }} className="px-2.5 py-0.5 text-[11px] rounded border border-[#E5E5E5] text-[#999999] hover:border-[#E5E5E5] hover:bg-[#F9F9F9]">Rétablir</button>
              </>
            ) : null}
          </div>
          {!compact && (
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {seance.heure_debut && seance.heure_fin ? (
                <span className="text-xs text-[#999999]">{seance.heure_debut.slice(0, 5)} — {seance.heure_fin.slice(0, 5)}</span>
              ) : seance.heure_debut ? (
                <span className="text-xs text-[#999999]">{seance.heure_debut.slice(0, 5)}</span>
              ) : null}
            </div>
          )}
        </div>
      )}
      {!compact && !onStatusChange && (
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${textClass}`}>{seance.titre}</p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {seance.heure_debut && seance.heure_fin ? (
                <span className="text-xs text-[#999999]">{seance.heure_debut.slice(0, 5)} — {seance.heure_fin.slice(0, 5)}</span>
              ) : seance.heure_debut ? (
                <span className="text-xs text-[#999999]">{seance.heure_debut.slice(0, 5)}</span>
              ) : null}
            </div>
          </div>
        </div>
      )}
      {compact && !onStatusChange && (
        <p className={`text-sm font-medium ${textClass}`}>{seance.titre}</p>
      )}
    </div>
  )
}

function WeekView({ seances, competEvents, cursor, today, onStatusChange }: {
  seances: Seance[]; competEvents: CompetEvent[]; cursor: Date; today: string; onStatusChange?: (seanceId: string, statut: 'planifie' | 'fait' | 'annule') => void
}) {
  const mon = getMonday(cursor)
  const days = Array.from({ length: 7 }, (_, i) => addDays(mon, i))

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day, i) => {
        const str = toStr(day)
        const isToday = str === today
        const daySessions = seances.filter(s => s.date === str)
        const dayCompets = competEvents.filter(c => c.date === str)
        return (
          <div key={str}>
            <div className={`text-center mb-2 py-1.5 rounded-lg ${isToday ? 'bg-[#C41230]' : ''}`}>
              <p className={`text-[10px] uppercase tracking-widest ${isToday ? 'text-white/70' : 'text-[#CCCCCC]'}`}>{JOURS_COURTS[i]}</p>
              <p className={`text-sm font-semibold ${isToday ? 'text-white' : 'text-[#0A0A0A]'}`}>{day.getDate()}</p>
            </div>
            <div className="space-y-2">
              {dayCompets.map(c => <CompetPill key={c.id} event={c} compact />)}
              {daySessions.length === 0 && dayCompets.length === 0
                ? <div className="h-16 rounded-lg border border-dashed border-[#F0F0F0]" />
                : daySessions.map(s => (
                  <SeancePill key={s.id} seance={s} today={today} compact onStatusChange={onStatusChange ? (statut) => onStatusChange(s.id, statut) : undefined} />
                ))
              }
            </div>
          </div>
        )
      })}
    </div>
  )
}

function MonthView({ seances, competEvents, cursor, today }: {
  seances: Seance[]; competEvents: CompetEvent[]; cursor: Date; today: string
}) {
  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startMon = getMonday(firstDay)

  const weeks: Date[][] = []
  let d = new Date(startMon)
  while (d <= lastDay || weeks.length === 0) {
    const week = Array.from({ length: 7 }, (_, i) => addDays(d, i))
    weeks.push(week)
    d = addDays(d, 7)
    if (d > lastDay && weeks.length >= 4) break
  }

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {JOURS_COURTS.map(j => <div key={j} className="text-center text-[10px] uppercase tracking-widest text-[#CCCCCC] py-1">{j}</div>)}
      </div>
      <div className="space-y-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1">
            {week.map(day => {
              const str = toStr(day)
              const inMonth = day.getMonth() === month
              const isToday = str === today
              const daySessions = seances.filter(s => s.date === str)
              const dayCompets = competEvents.filter(c => c.date === str)
              return (
                <div key={str} className={`min-h-16 rounded-lg p-1.5 border ${isToday ? 'border-[#C41230]/30 bg-[#FFF5F6]' : inMonth ? 'border-[#E5E5E5] bg-white' : 'border-[#F5F5F5] bg-[#FAFAFA]'}`}>
                  <p className={`text-xs font-medium mb-1 ${isToday ? 'text-[#C41230]' : inMonth ? 'text-[#0A0A0A]' : 'text-[#CCCCCC]'}`}>{day.getDate()}</p>
                  <div className="space-y-0.5">
                    {dayCompets.map(c => (
                      <div key={c.id} className="text-[10px] px-1.5 py-0.5 rounded truncate bg-amber-100 text-amber-800" title={c.nom}>🏆 {c.nom}</div>
                    ))}
                    {daySessions.map(s => (
                      <div key={s.id} className="text-[10px] px-1.5 py-0.5 rounded truncate bg-[#F0F0F0] text-[#666666]" title={s.titre}>
                        {s.titre}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
      {/* Detail list below calendar for clicked sessions */}
      {(seances.length > 0 || competEvents.length > 0) && (
        <div className="mt-6 space-y-2">
          <p className="text-xs uppercase tracking-widest text-[#999999] mb-3">{seances.length} séance{seances.length !== 1 ? 's' : ''} ce mois</p>
          {competEvents.map(c => <CompetPill key={c.id} event={c} />)}
          {seances.map(s => (
            <SeancePill key={s.id} seance={s} today={today} />
          ))}
        </div>
      )}
    </div>
  )
}

function ListView({ seances, competEvents, today, groupBy }: {
  seances: Seance[]; competEvents: CompetEvent[]; today: string; groupBy: 'month' | 'week'
}) {
  const groups = useMemo(() => {
    const map = new Map<string, { seances: Seance[]; compets: CompetEvent[] }>()
    for (const s of seances) {
      const key = groupBy === 'month' ? s.date.slice(0, 7) : toStr(getMonday(new Date(s.date + 'T12:00:00')))
      if (!map.has(key)) map.set(key, { seances: [], compets: [] })
      map.get(key)!.seances.push(s)
    }
    for (const c of competEvents) {
      const key = groupBy === 'month' ? c.date.slice(0, 7) : toStr(getMonday(new Date(c.date + 'T12:00:00')))
      if (!map.has(key)) map.set(key, { seances: [], compets: [] })
      map.get(key)!.compets.push(c)
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [seances, competEvents, groupBy])

  if (seances.length === 0 && competEvents.length === 0) return (
    <div className="text-center py-16 text-[#CCCCCC] text-sm">Aucun événement sur cette période.</div>
  )

  return (
    <div className="space-y-6">
      {groups.map(([key, { seances: items, compets }]) => {
        let label = ''
        if (groupBy === 'month') {
          const [y, m] = key.split('-')
          label = `${MOIS_LABELS[parseInt(m) - 1]} ${y}`
        } else {
          const mon = new Date(key + 'T12:00:00')
          const sun = addDays(mon, 6)
          label = `Sem. du ${mon.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} au ${sun.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`
        }
        const totalMin = items.reduce((s, x) => s + x.duree_minutes, 0)
        // Merge and sort by date
        type Item = { date: string; type: 'seance' | 'compet'; data: Seance | CompetEvent }
        const merged: Item[] = [
          ...items.map(s => ({ date: s.date, type: 'seance' as const, data: s })),
          ...compets.map(c => ({ date: c.date, type: 'compet' as const, data: c })),
        ].sort((a, b) => a.date.localeCompare(b.date))
        return (
          <div key={key}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs uppercase tracking-widest text-[#999999]">{label}</h3>
              <span className="text-xs text-[#CCCCCC]">
                {items.length > 0 && `${items.length} séance${items.length !== 1 ? 's' : ''}`}
                {items.length > 0 && totalMin > 0 && ` · ${fmtDuration(totalMin)}`}
                {compets.length > 0 && `${items.length > 0 ? ' · ' : ''}${compets.length} compét.`}
              </span>
            </div>
            <div className="space-y-2">
              {merged.map(item => {
                const d = new Date(item.date + 'T12:00:00')
                return (
                  <div key={`${item.type}-${item.data.id}`} className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-10 text-center pt-3">
                      <p className="text-[10px] uppercase text-[#CCCCCC]">{d.toLocaleDateString('fr-FR', { weekday: 'short' })}</p>
                      <p className="text-base font-bold text-[#0A0A0A] leading-none">{d.getDate()}</p>
                    </div>
                    <div className="flex-1">
                      {item.type === 'compet'
                        ? <CompetPill event={item.data as CompetEvent} />
                        : <SeancePill seance={item.data as Seance} today={today} />
                      }
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
