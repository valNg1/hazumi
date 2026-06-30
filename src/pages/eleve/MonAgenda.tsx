import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../../lib/supabase'

type EventType = 'competition' | 'grade' | 'arbitrage' | 'stage' | 'ag' | 'autre'

interface AgendaItem {
  key: string
  sourceId: string
  sourceType: 'competition' | 'evenement'
  type: EventType
  titre: string
  date: string
  lieu?: string
  description?: string
  niveau?: string
  tranche_age?: string[]
}

const TYPE_CONFIG: Record<EventType, { icon: string; label: string; bg: string; border: string; text: string; badge: string }> = {
  competition: { icon: '🏆', label: 'Compétition',      bg: 'bg-[#FFF5F6]', border: 'border-[#C41230]/20', text: 'text-[#0A0A0A]', badge: 'bg-[#FFF5F6] text-[#C41230] border-[#C41230]/30' },
  grade:       { icon: '🥋', label: 'Passage de grade', bg: 'bg-purple-50',  border: 'border-purple-200',   text: 'text-[#0A0A0A]', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
  arbitrage:   { icon: '🤝', label: 'Arbitrage',        bg: 'bg-blue-50',    border: 'border-blue-200',     text: 'text-[#0A0A0A]', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  stage:       { icon: '📚', label: 'Stage',            bg: 'bg-green-50',   border: 'border-green-200',    text: 'text-[#0A0A0A]', badge: 'bg-green-50 text-green-700 border-green-200' },
  ag:          { icon: '🏛️', label: 'AG du club',       bg: 'bg-amber-50',   border: 'border-amber-200',    text: 'text-[#0A0A0A]', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  autre:       { icon: '📅', label: 'Événement',        bg: 'bg-white',      border: 'border-[#E5E5E5]',    text: 'text-[#0A0A0A]', badge: 'bg-[#F5F5F5] text-[#666666] border-[#E5E5E5]' },
}

const TRANCHES_AGE_BOUNDS: [string, number, number][] = [
  ['poussins', 8, 9], ['benjamins', 10, 11], ['minimes', 12, 13],
  ['cadets', 14, 15], ['juniors', 16, 20], ['seniors', 21, 34], ['vétérans', 35, 99],
]

function getAgeCategory(birthDate: string): string {
  const birth = new Date(birthDate)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age--
  for (const [cat, min, max] of TRANCHES_AGE_BOUNDS) if (age >= min && age <= max) return cat
  return 'seniors'
}

const TYPE_ORDER: EventType[] = ['competition', 'grade', 'arbitrage', 'stage', 'ag', 'autre']

type CalView = 'semaine' | 'mois' | 'trimestre' | 'annee'

function addDays(date: Date, n: number): Date {
  const d = new Date(date); d.setDate(d.getDate() + n); return d
}

function toYMD(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function startOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay() === 0 ? 6 : d.getDay() - 1
  d.setDate(d.getDate() - day)
  return d
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function MonthGrid({ year, month, itemsByDate, onClickDay }: {
  year: number
  month: number
  itemsByDate: Map<string, AgendaItem[]>
  onClickDay: (date: string, items: AgendaItem[]) => void
}) {
  const firstDay = new Date(year, month, 1)
  const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
  const total = daysInMonth(year, month)
  const cells: (number | null)[] = [...Array(startOffset).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)]
  while (cells.length % 7 !== 0) cells.push(null)
  const monthLabel = new Date(year, month, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  const todayStr = toYMD(new Date())

  return (
    <div>
      <p className="text-xs font-semibold text-[#0A0A0A] mb-2 capitalize">{monthLabel}</p>
      <div className="grid grid-cols-7 gap-px text-center">
        {['L','M','M','J','V','S','D'].map((d, i) => (
          <div key={i} className="text-[10px] text-[#CCCCCC] pb-1">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={i} />
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const dayItems = itemsByDate.get(dateStr) ?? []
          const isToday = dateStr === todayStr
          return (
            <div
              key={i}
              onClick={() => dayItems.length > 0 && onClickDay(dateStr, dayItems)}
              className={`relative flex flex-col items-center py-1 rounded-lg transition-colors ${dayItems.length > 0 ? 'cursor-pointer hover:bg-[#F5F5F5]' : ''}`}
            >
              <span className={`text-xs w-6 h-6 flex items-center justify-center rounded-full leading-none ${isToday ? 'bg-[#0A0A0A] text-white font-bold' : 'text-[#333333]'}`}>
                {day}
              </span>
              {dayItems.length > 0 && (
                <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                  {dayItems.slice(0, 3).map(item => (
                    <div key={item.key} className={`w-1.5 h-1.5 rounded-full ${dotColor(item.type)}`} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function dotColor(type: EventType): string {
  const map: Record<EventType, string> = {
    competition: 'bg-[#C41230]', grade: 'bg-purple-500', arbitrage: 'bg-blue-500',
    stage: 'bg-green-500', ag: 'bg-amber-500', autre: 'bg-gray-400',
  }
  return map[type]
}

export default function MonAgenda() {
  const [items, setItems] = useState<AgendaItem[]>([])
  const [participationIds, setParticipationIds] = useState<Set<string>>(new Set())
  const [judokaId, setJudokaId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<EventType | 'tous'>('tous')
  const [selectedItem, setSelectedItem] = useState<AgendaItem | null>(null)
  const [calView, setCalView] = useState<CalView>('mois')
  const [calOffset, setCalOffset] = useState(0)
  const [calDayItems, setCalDayItems] = useState<{ date: string; items: AgendaItem[] } | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createFormData, setCreateFormData] = useState({ titre: '', date: '', heure_debut: '', heure_fin: '', type: 'autre' as EventType, lieu: '', description: '' })
  const [creatingEvent, setCreatingEvent] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: j } = await supabase.from('judokas').select('id, birth_date').eq('user_id', user.id).single()
      if (!j) { setLoading(false); return }
      setJudokaId(j.id)

      const today = new Date().toISOString().slice(0, 10)
      const ageCategory = j.birth_date ? getAgeCategory(j.birth_date) : null

      const [{ data: comps }, { data: evts }, { data: compParts }, { data: evtParts }] = await Promise.all([
        supabase.from('competitions').select('id, nom, date, lieu, niveau, tranche_age, notes').gte('date', today).order('date'),
        supabase.from('evenements').select('id, type, titre, date, lieu, description').gte('date', today).order('date'),
        supabase.from('competition_participations').select('competition_id').eq('judoka_id', j.id),
        supabase.from('evenement_participations').select('evenement_id').eq('judoka_id', j.id),
      ])

      const agenda: AgendaItem[] = [
        ...(comps ?? [])
          .filter((c: { tranche_age?: string[] }) => { const t = c.tranche_age ?? []; return t.length === 0 || (ageCategory && t.includes(ageCategory)) })
          .map((c: { id: string; nom: string; date: string; lieu?: string; niveau?: string; notes?: string; tranche_age?: string[] }) => ({
            key: `comp:${c.id}`,
            sourceId: c.id,
            sourceType: 'competition' as const,
            type: 'competition' as EventType,
            titre: c.nom,
            date: c.date,
            lieu: c.lieu,
            description: c.notes,
            niveau: c.niveau,
            tranche_age: c.tranche_age,
          })),
        ...(evts ?? []).map((e: { id: string; type: string; titre: string; date: string; lieu?: string; description?: string }) => ({
          key: `evt:${e.id}`,
          sourceId: e.id,
          sourceType: 'evenement' as const,
          type: (e.type ?? 'autre') as EventType,
          titre: e.titre,
          date: e.date,
          lieu: e.lieu,
          description: e.description,
        })),
      ].sort((a, b) => a.date.localeCompare(b.date))

      setItems(agenda)
      setParticipationIds(new Set([
        ...(compParts ?? []).map((p: { competition_id: string }) => `comp:${p.competition_id}`),
        ...(evtParts ?? []).map((p: { evenement_id: string }) => `evt:${p.evenement_id}`),
      ]))
      setLoading(false)
    }
    load()
  }, [])

  async function createEvent(e: React.FormEvent) {
    e.preventDefault()
    console.log('[Agenda] formData:', createFormData)
    console.log('[Agenda] judokaId:', judokaId)
    if (!judokaId || !createFormData.titre || !createFormData.date) {
      console.log('[Agenda] validation échouée - retour')
      return
    }
    setCreatingEvent(true)
    const { data, error } = await supabase.from('evenements').insert({
      type: createFormData.type,
      titre: createFormData.titre,
      date: createFormData.date,
      heure_debut: createFormData.heure_debut || null,
      heure_fin: createFormData.heure_fin || null,
      lieu: createFormData.lieu || null,
      description: createFormData.description || null,
    }).select()
    console.log('[Agenda] résultat insertion:', { data, error })
    if (!error && data && data.length > 0) {
      const eventId = data[0].id
      await supabase.from('evenement_participations').insert({ evenement_id: eventId, judoka_id: judokaId })
      setCreateModalOpen(false)
      setCreateFormData({ titre: '', date: '', heure_debut: '', heure_fin: '', type: 'autre', lieu: '', description: '' })
      const { data: evts } = await supabase.from('evenements').select('id, type, titre, date, lieu, description').gte('date', new Date().toISOString().slice(0, 10)).order('date')
      const agenda: AgendaItem[] = items.filter(i => i.sourceType !== 'evenement').concat((evts ?? []).map(e => ({
        key: `evt:${e.id}`,
        sourceId: e.id,
        sourceType: 'evenement' as const,
        type: (e.type ?? 'autre') as EventType,
        titre: e.titre,
        date: e.date,
        lieu: e.lieu,
        description: e.description,
      }))).sort((a, b) => a.date.localeCompare(b.date))
      setItems(agenda)
    }
    setCreatingEvent(false)
  }

  async function setParticipation(item: AgendaItem, viens: boolean) {
    if (!judokaId) return
    if (viens) {
      if (item.sourceType === 'competition') {
        await supabase.from('competition_participations').upsert({ competition_id: item.sourceId, judoka_id: judokaId }, { onConflict: 'competition_id,judoka_id' })
      } else {
        await supabase.from('evenement_participations').upsert({ evenement_id: item.sourceId, judoka_id: judokaId }, { onConflict: 'evenement_id,judoka_id' })
      }
      setParticipationIds(prev => new Set([...prev, item.key]))
    } else {
      if (item.sourceType === 'competition') {
        await supabase.from('competition_participations').delete().eq('competition_id', item.sourceId).eq('judoka_id', judokaId)
      } else {
        await supabase.from('evenement_participations').delete().eq('evenement_id', item.sourceId).eq('judoka_id', judokaId)
      }
      setParticipationIds(prev => { const s = new Set(prev); s.delete(item.key); return s })
    }
  }

  const typesPresents = TYPE_ORDER.filter(t => items.some(i => i.type === t))
  const filtered = filter === 'tous' ? items : items.filter(i => i.type === filter)

  const itemsByDate = useMemo(() => {
    const map = new Map<string, AgendaItem[]>()
    for (const item of filtered) {
      const list = map.get(item.date) ?? []
      list.push(item)
      map.set(item.date, list)
    }
    return map
  }, [filtered])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (loading) return <div className="text-center py-16 text-[#999999] text-sm">Chargement…</div>

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">Mes événements</h1>
          <p className="text-[#999999] text-sm mt-1">{items.length} événement{items.length !== 1 ? 's' : ''} à venir · {participationIds.size} confirmé{participationIds.size !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 bg-[#C41230] hover:bg-[#9B0E25] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter
        </button>
      </div>

      {/* Filtres par type */}
      {typesPresents.length > 1 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setFilter('tous')}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${filter === 'tous' ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]' : 'border-[#E5E5E5] text-[#666666] hover:border-[#CCCCCC]'}`}
          >
            Tous ({items.length})
          </button>
          {typesPresents.map(t => {
            const cfg = TYPE_CONFIG[t]
            const count = items.filter(i => i.type === t).length
            return (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${filter === t ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]' : 'border-[#E5E5E5] text-[#666666] hover:border-[#CCCCCC]'}`}
              >
                {cfg.icon} {cfg.label} ({count})
              </button>
            )
          })}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[#999999] text-sm">Aucun événement à venir.</div>
      ) : (
        <div className="space-y-4">
          {filtered.map(item => {
            const cfg = TYPE_CONFIG[item.type]
            const participating = participationIds.has(item.key)
            const daysLeft = Math.ceil((new Date(item.date).getTime() - Date.now()) / 86400000)
            const dateStr = new Date(item.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
            return (
              <div
                key={item.key}
                className={`rounded-xl border p-5 transition-all cursor-pointer hover:shadow-sm ${cfg.bg} ${cfg.border}`}
                onClick={() => setSelectedItem(item)}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <span className="text-2xl flex-shrink-0">{cfg.icon}</span>
                    <div className="min-w-0">
                      <p className="text-base font-bold text-[#0A0A0A] leading-tight">{item.titre}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${cfg.badge}`}>{cfg.label}</span>
                        {item.niveau && <span className="text-[10px] px-2 py-0.5 bg-white/70 text-[#666666] border border-[#E5E5E5] rounded-full capitalize">{item.niveau}</span>}
                        {(item.tranche_age ?? []).map(t => (
                          <span key={t} className="text-[10px] px-2 py-0.5 bg-white/70 text-[#666666] border border-[#E5E5E5] rounded-full capitalize">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`text-sm font-bold ${daysLeft <= 7 ? 'text-[#C41230]' : 'text-[#0A0A0A]'}`}>J-{daysLeft}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-[#666666] mb-4">
                  <span>📅 {dateStr}</span>
                  {item.lieu && <span>📍 {item.lieu}</span>}
                </div>

                {item.description && (
                  <p className="text-sm text-[#666666] mb-4 line-clamp-2 leading-relaxed">{item.description}</p>
                )}

                {/* Boutons de participation */}
                <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => setParticipation(item, true)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                      participating
                        ? 'bg-[#C41230] border-[#C41230] text-white'
                        : 'bg-white border-[#E5E5E5] text-[#666666] hover:border-[#C41230] hover:text-[#C41230]'
                    }`}
                  >
                    {participating ? '✓ Je viens' : 'Je viens'}
                  </button>
                  <button
                    onClick={() => setParticipation(item, false)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                      !participating
                        ? 'bg-[#F5F5F5] border-[#E5E5E5] text-[#999999]'
                        : 'bg-white border-[#E5E5E5] text-[#999999] hover:border-[#CCCCCC]'
                    }`}
                  >
                    Je ne viens pas
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Planning calendaire */}
      {items.length > 0 && (
        <div className="mt-8 bg-white rounded-xl border border-[#E5E5E5] p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-widest text-[#999999]">Planning</span>
            <div className="flex gap-1">
              {(['semaine', 'mois', 'trimestre', 'annee'] as CalView[]).map(v => (
                <button
                  key={v}
                  onClick={() => { setCalView(v); setCalOffset(0) }}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors ${calView === v ? 'bg-[#0A0A0A] text-white' : 'text-[#999999] hover:text-[#0A0A0A]'}`}
                >
                  {v === 'semaine' ? 'Sem.' : v === 'mois' ? 'Mois' : v === 'trimestre' ? 'Trim.' : 'Année'}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          {calView !== 'annee' && (
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setCalOffset(o => o - 1)} className="text-[#CCCCCC] hover:text-[#0A0A0A] transition-colors p-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={() => setCalOffset(0)} className="text-xs text-[#999999] hover:text-[#0A0A0A] transition-colors px-2">Aujourd'hui</button>
              <button onClick={() => setCalOffset(o => o + 1)} className="text-[#CCCCCC] hover:text-[#0A0A0A] transition-colors p-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          )}

          {calView === 'semaine' && (() => {
            const weekStart = addDays(startOfWeek(today), calOffset * 7)
            const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
            const weekLabel = `${days[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} – ${days[6].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`
            return (
              <div>
                <p className="text-xs font-semibold text-[#0A0A0A] mb-3 text-center">{weekLabel}</p>
                <div className="space-y-1">
                  {days.map(day => {
                    const dateStr = toYMD(day)
                    const dayItems = itemsByDate.get(dateStr) ?? []
                    const isToday = dateStr === toYMD(new Date())
                    return (
                      <div key={dateStr} className={`flex items-start gap-3 rounded-lg px-3 py-2 ${isToday ? 'bg-[#F5F5F5]' : ''}`}>
                        <div className="w-16 flex-shrink-0">
                          <span className={`text-xs ${isToday ? 'font-bold text-[#C41230]' : 'text-[#999999]'}`}>
                            {day.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex-1 space-y-1">
                          {dayItems.length === 0 ? (
                            <div className="h-5" />
                          ) : dayItems.map(item => {
                            const cfg = TYPE_CONFIG[item.type]
                            return (
                              <button key={item.key} onClick={() => setSelectedItem(item)}
                                className={`w-full text-left text-xs px-2 py-1 rounded border ${cfg.bg} ${cfg.border} flex items-center gap-1.5`}>
                                <span>{cfg.icon}</span>
                                <span className="truncate font-medium text-[#0A0A0A]">{item.titre}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })()}

          {calView === 'mois' && (() => {
            const ref = new Date(today.getFullYear(), today.getMonth() + calOffset, 1)
            return (
              <MonthGrid year={ref.getFullYear()} month={ref.getMonth()}
                itemsByDate={itemsByDate}
                onClickDay={(date, its) => setCalDayItems({ date, items: its })} />
            )
          })()}

          {calView === 'trimestre' && (() => {
            const months = Array.from({ length: 3 }, (_, i) => {
              const d = new Date(today.getFullYear(), today.getMonth() + calOffset * 3 + i, 1)
              return { year: d.getFullYear(), month: d.getMonth() }
            })
            return (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {months.map(({ year, month }) => (
                  <MonthGrid key={`${year}-${month}`} year={year} month={month}
                    itemsByDate={itemsByDate}
                    onClickDay={(date, its) => setCalDayItems({ date, items: its })} />
                ))}
              </div>
            )
          })()}

          {calView === 'annee' && (() => {
            const schoolY = today.getMonth() >= 8 ? today.getFullYear() : today.getFullYear() - 1
            const months = Array.from({ length: 12 }, (_, i) => {
              const mIdx = (8 + i) % 12
              const year = mIdx >= 8 ? schoolY : schoolY + 1
              return { year, month: mIdx }
            })
            return (
              <div>
                <p className="text-xs font-semibold text-[#0A0A0A] mb-4 text-center">Saison {schoolY}–{schoolY + 1}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {months.map(({ year, month }) => (
                    <MonthGrid key={`${year}-${month}`} year={year} month={month}
                      itemsByDate={itemsByDate}
                      onClickDay={(date, its) => setCalDayItems({ date, items: its })} />
                  ))}
                </div>
              </div>
            )
          })()}

          {/* Légende */}
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-[#F5F5F5]">
            {typesPresents.map(t => (
              <div key={t} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${dotColor(t)}`} />
                <span className="text-[10px] text-[#999999]">{TYPE_CONFIG[t].label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popup jour cliqué */}
      {calDayItems && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setCalDayItems(null)} />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-sm p-5">
            <button onClick={() => setCalDayItems(null)} className="absolute top-4 right-4 text-[#CCCCCC] hover:text-[#666666]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <p className="text-sm font-semibold text-[#0A0A0A] mb-3 capitalize">
              {new Date(calDayItems.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <div className="space-y-2">
              {calDayItems.items.map(item => {
                const cfg = TYPE_CONFIG[item.type]
                const participating = participationIds.has(item.key)
                return (
                  <button key={item.key} onClick={() => { setCalDayItems(null); setSelectedItem(item) }}
                    className={`w-full text-left p-3 rounded-xl border ${cfg.bg} ${cfg.border} flex items-center gap-3`}>
                    <span className="text-xl">{cfg.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0A0A0A] truncate">{item.titre}</p>
                      {item.lieu && <p className="text-xs text-[#999999] truncate">{item.lieu}</p>}
                    </div>
                    {participating && <span className="text-[10px] text-[#C41230] font-bold flex-shrink-0">✓</span>}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal détail */}
      {selectedItem && (
        <EventDetail item={selectedItem} participating={participationIds.has(selectedItem.key)}
          onParticipate={v => setParticipation(selectedItem, v)}
          onClose={() => setSelectedItem(null)} />
      )}

      {/* Modal création événement */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-lg font-semibold text-[#0A0A0A] mb-4">Créer un événement</h2>
            <form onSubmit={createEvent} className="space-y-3">
              <input
                type="text"
                placeholder="Titre"
                value={createFormData.titre}
                onChange={e => setCreateFormData({ ...createFormData, titre: e.target.value })}
                required
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:border-[#C41230]"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={createFormData.date}
                  onChange={e => setCreateFormData({ ...createFormData, date: e.target.value })}
                  required
                  className="px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:border-[#C41230]"
                />
                <select
                  value={createFormData.type}
                  onChange={e => setCreateFormData({ ...createFormData, type: e.target.value as EventType })}
                  className="px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:border-[#C41230]"
                >
                  {['competition', 'grade', 'arbitrage', 'stage', 'ag', 'autre'].map(t => (
                    <option key={t} value={t}>{TYPE_CONFIG[t as EventType].label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="time"
                  placeholder="Heure début"
                  value={createFormData.heure_debut}
                  onChange={e => setCreateFormData({ ...createFormData, heure_debut: e.target.value })}
                  className="px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:border-[#C41230]"
                />
                <input
                  type="time"
                  placeholder="Heure fin"
                  value={createFormData.heure_fin}
                  onChange={e => setCreateFormData({ ...createFormData, heure_fin: e.target.value })}
                  className="px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:border-[#C41230]"
                />
              </div>
              <input
                type="text"
                placeholder="Lieu (optionnel)"
                value={createFormData.lieu}
                onChange={e => setCreateFormData({ ...createFormData, lieu: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:border-[#C41230]"
              />
              <textarea
                placeholder="Notes/Description (optionnel)"
                value={createFormData.description}
                onChange={e => setCreateFormData({ ...createFormData, description: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:border-[#C41230] resize-none"
                rows={3}
              />
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold bg-white border border-[#E5E5E5] text-[#666666] hover:border-[#CCCCCC] transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creatingEvent}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold bg-[#C41230] hover:bg-[#9B0E25] disabled:bg-[#CCCCCC] text-white transition-colors"
                >
                  {creatingEvent ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function EventDetail({ item, participating, onParticipate, onClose }: {
  item: AgendaItem
  participating: boolean
  onParticipate: (v: boolean) => void
  onClose: () => void
}) {
  const cfg = TYPE_CONFIG[item.type]
  const daysLeft = Math.ceil((new Date(item.date).getTime() - Date.now()) / 86400000)
  const dateStr = new Date(item.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-xl p-6 ${cfg.bg} border ${cfg.border}`}>
        <button onClick={onClose} className="absolute top-4 right-4 text-[#CCCCCC] hover:text-[#666666]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="flex items-start gap-3 mb-5">
          <span className="text-3xl flex-shrink-0">{cfg.icon}</span>
          <div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${cfg.badge}`}>{cfg.label}</span>
            <h2 className="text-xl font-bold text-[#0A0A0A] mt-1">{item.titre}</h2>
          </div>
        </div>

        <div className="space-y-2 mb-5">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-[#999999] w-16">Date</span>
            <div>
              <span className="font-medium text-[#0A0A0A]">{dateStr}</span>
              <span className={`ml-2 text-xs font-bold ${daysLeft <= 7 ? 'text-[#C41230]' : 'text-[#666666]'}`}>J-{daysLeft}</span>
            </div>
          </div>
          {item.lieu && (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-[#999999] w-16">Lieu</span>
              <span className="font-medium text-[#0A0A0A]">{item.lieu}</span>
            </div>
          )}
          {item.niveau && (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-[#999999] w-16">Échelon</span>
              <span className="font-medium text-[#0A0A0A] capitalize">{item.niveau}</span>
            </div>
          )}
          {(item.tranche_age ?? []).length > 0 && (
            <div className="flex items-start gap-3 text-sm">
              <span className="text-[#999999] w-16">Catégories</span>
              <div className="flex flex-wrap gap-1">
                {(item.tranche_age ?? []).map(t => (
                  <span key={t} className="text-xs px-2 py-0.5 bg-white/70 border border-[#E5E5E5] rounded-full capitalize">{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {item.description && (
          <p className="text-sm text-[#666666] leading-relaxed mb-5 bg-white/60 rounded-lg p-3">{item.description}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => { onParticipate(true); onClose() }}
            className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all ${participating ? 'bg-[#C41230] border-[#C41230] text-white' : 'bg-white border-[#E5E5E5] text-[#666666] hover:border-[#C41230] hover:text-[#C41230]'}`}
          >
            {participating ? '✓ Je viens' : 'Je viens'}
          </button>
          <button
            onClick={() => { onParticipate(false); onClose() }}
            className="flex-1 py-3 rounded-xl text-sm font-semibold bg-white border border-[#E5E5E5] text-[#999999] hover:border-[#CCCCCC] transition-all"
          >
            Je ne viens pas
          </button>
        </div>
      </div>
    </div>
  )
}
