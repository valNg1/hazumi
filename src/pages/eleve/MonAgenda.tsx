import { useEffect, useState } from 'react'
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

export default function MonAgenda() {
  const [items, setItems] = useState<AgendaItem[]>([])
  const [participationIds, setParticipationIds] = useState<Set<string>>(new Set())
  const [judokaId, setJudokaId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<EventType | 'tous'>('tous')
  const [selectedItem, setSelectedItem] = useState<AgendaItem | null>(null)

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

  if (loading) return <div className="text-center py-16 text-[#999999] text-sm">Chargement…</div>

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">Mes événements</h1>
        <p className="text-[#999999] text-sm mt-1">{items.length} événement{items.length !== 1 ? 's' : ''} à venir · {participationIds.size} confirmé{participationIds.size !== 1 ? 's' : ''}</p>
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

      {/* Modal détail */}
      {selectedItem && (
        <EventDetail item={selectedItem} participating={participationIds.has(selectedItem.key)}
          onParticipate={v => setParticipation(selectedItem, v)}
          onClose={() => setSelectedItem(null)} />
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
