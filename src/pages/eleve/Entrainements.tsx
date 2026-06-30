import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../../lib/supabase'

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

function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  d.setHours(0, 0, 0, 0)
  return d
}

function toStr(date: Date): string {
  return date.toISOString().slice(0, 10)
}

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

export default function Entrainements() {
  const [judokaId, setJudokaId] = useState<string | null>(null)
  const [seances, setSeances] = useState<Seance[]>([])
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(new Set())
  const [competEvents, setCompetEvents] = useState<CompetEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<ViewMode>('semaine')
  const [cursor, setCursor] = useState(new Date())

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data: judoka } = await supabase.from('judokas').select('id, club_id').eq('user_id', user.id).single()
      if (!judoka) { setLoading(false); return }
      const [{ data: s }, { data: p }, { data: compParts }, { data: evtParts }] = await Promise.all([
        supabase.from('seances').select('*').eq('club_id', judoka.club_id ?? '').order('date').order('heure_debut'),
        supabase.from('presences').select('seance_id').eq('judoka_id', judoka.id),
        supabase.from('competition_participations').select('id, competition_id, competitions(nom, date, lieu, niveau)').eq('judoka_id', judoka.id),
        supabase.from('evenement_participations').select('id, evenement_id, evenements(type, titre, date, lieu)').eq('judoka_id', judoka.id),
      ])
      setJudokaId(judoka.id)
      setSeances(s ?? [])
      setConfirmedIds(new Set((p ?? []).map((x: { seance_id: string }) => x.seance_id)))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const compEvents: CompetEvent[] = (compParts ?? []).map((x: any) => {
        const c = Array.isArray(x.competitions) ? x.competitions[0] : x.competitions
        return { id: x.id, competition_id: x.competition_id, nom: c?.nom ?? '—', date: c?.date ?? '', lieu: c?.lieu, niveau: c?.niveau, eventType: 'competition' as const }
      }).filter((e: CompetEvent) => e.date)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const evtEvents: CompetEvent[] = (evtParts ?? []).map((x: any) => {
        const e = Array.isArray(x.evenements) ? x.evenements[0] : x.evenements
        return { id: x.id, competition_id: x.evenement_id, nom: e?.titre ?? '—', date: e?.date ?? '', lieu: e?.lieu, eventType: e?.type ?? 'autre' }
      }).filter((e: CompetEvent) => e.date)
      setCompetEvents([...compEvents, ...evtEvents].sort((a, b) => a.date.localeCompare(b.date)))
      setLoading(false)
    }
    load()
  }, [])

  async function togglePresence(seanceId: string) {
    if (!judokaId) return
    if (confirmedIds.has(seanceId)) {
      await supabase.from('presences').delete().eq('seance_id', seanceId).eq('judoka_id', judokaId)
      setConfirmedIds(prev => { const s = new Set(prev); s.delete(seanceId); return s })
    } else {
      await supabase.from('presences').upsert({ seance_id: seanceId, judoka_id: judokaId }, { onConflict: 'seance_id,judoka_id' })
      setConfirmedIds(prev => new Set([...prev, seanceId]))
    }
  }

  const today = toStr(new Date())
  const past = useMemo(() => seances.filter(s => s.date < today), [seances, today])
  const upcoming = useMemo(() => seances.filter(s => s.date >= today), [seances, today])

  const totalMinPast = past.reduce((sum, s) => sum + s.duree_minutes, 0)
  const confirmed = useMemo(() => upcoming.filter(s => confirmedIds.has(s.id)), [upcoming, confirmedIds])
  const pctConfirmed = upcoming.length > 0 ? Math.round((confirmed.length / upcoming.length) * 100) : 0

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">Mes entraînements</h1>
        <p className="text-[#999999] text-sm mt-0.5">Séances planifiées par le club</p>
      </div>

      {/* Recap panel */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <RecapCard label="Séances passées" value={String(past.length)} sub={fmtDuration(totalMinPast)} />
        <RecapCard label="Séances à venir" value={String(upcoming.length)} sub={`${upcoming.length} séance${upcoming.length !== 1 ? 's' : ''} planifiée${upcoming.length !== 1 ? 's' : ''}`} accent />
        <RecapCard label="Séances confirmées" value={String(confirmed.length)} sub={`sur ${upcoming.length} à venir`} accent />
        <RecapCard label="Taux de présence" value={`${pctConfirmed}%`} sub={`${confirmed.length} confirmée${confirmed.length !== 1 ? 's' : ''}`} accent />
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
        <WeekView seances={visibleSeances} competEvents={visibleCompets} cursor={cursor} today={today} confirmedIds={confirmedIds} onToggle={togglePresence} />
      ) : view === 'mois' ? (
        <MonthView seances={visibleSeances} competEvents={visibleCompets} cursor={cursor} today={today} confirmedIds={confirmedIds} onToggle={togglePresence} />
      ) : (
        <ListView seances={visibleSeances} competEvents={visibleCompets} today={today} confirmedIds={confirmedIds} onToggle={togglePresence} groupBy={view === 'annee' || view === 'trimestre' ? 'month' : 'week'} />
      )}
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

function SeancePill({ seance, today, confirmed, onToggle, compact }: {
  seance: Seance; today: string; confirmed: boolean; onToggle: (id: string) => void; compact?: boolean
}) {
  const isPast = seance.date < today
  const isToday = seance.date === today
  return (
    <div className={`rounded-lg border p-3 transition-all ${isPast ? 'border-[#F0F0F0] bg-[#FAFAFA]' : isToday ? 'border-[#C41230]/30 bg-[#FFF5F6]' : 'border-[#E5E5E5] bg-white'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${isPast ? 'text-[#999999]' : 'text-[#0A0A0A]'}`}>{seance.titre}</p>
          {!compact && (
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {seance.heure_debut && <span className="text-xs text-[#999999]">{seance.heure_debut.slice(0, 5)}</span>}
              <span className="text-xs text-[#CCCCCC]">{fmtDuration(seance.duree_minutes)}</span>
              {seance.lieu && <span className="text-xs text-[#CCCCCC]">{seance.lieu}</span>}
            </div>
          )}
        </div>
        {!isPast && (
          <button
            onClick={() => onToggle(seance.id)}
            className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full border transition-all ${confirmed ? 'bg-[#C41230] border-[#C41230] text-white' : 'border-[#E5E5E5] text-[#999999] hover:border-[#C41230] hover:text-[#C41230]'}`}
          >
            {confirmed ? '✓ Présent' : 'Je viens'}
          </button>
        )}
        {isPast && confirmed && (
          <span className="text-xs text-[#999999] flex-shrink-0">✓</span>
        )}
      </div>
    </div>
  )
}

function WeekView({ seances, competEvents, cursor, today, confirmedIds, onToggle }: {
  seances: Seance[]; competEvents: CompetEvent[]; cursor: Date; today: string; confirmedIds: Set<string>; onToggle: (id: string) => void
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
                  <SeancePill key={s.id} seance={s} today={today} confirmed={confirmedIds.has(s.id)} onToggle={onToggle} compact />
                ))
              }
            </div>
          </div>
        )
      })}
    </div>
  )
}

function MonthView({ seances, competEvents, cursor, today, confirmedIds, onToggle }: {
  seances: Seance[]; competEvents: CompetEvent[]; cursor: Date; today: string; confirmedIds: Set<string>; onToggle: (id: string) => void
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
                      <div key={s.id} className={`text-[10px] px-1.5 py-0.5 rounded truncate ${confirmedIds.has(s.id) ? 'bg-[#C41230] text-white' : 'bg-[#F0F0F0] text-[#666666]'}`} title={s.titre}>
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
            <SeancePill key={s.id} seance={s} today={today} confirmed={confirmedIds.has(s.id)} onToggle={onToggle} />
          ))}
        </div>
      )}
    </div>
  )
}

function ListView({ seances, competEvents, today, confirmedIds, onToggle, groupBy }: {
  seances: Seance[]; competEvents: CompetEvent[]; today: string; confirmedIds: Set<string>; onToggle: (id: string) => void; groupBy: 'month' | 'week'
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
                        : <SeancePill seance={item.data as Seance} today={today} confirmed={confirmedIds.has(item.data.id)} onToggle={onToggle} />
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
