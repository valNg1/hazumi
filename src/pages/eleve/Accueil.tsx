import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { supabase } from '../../lib/supabase'
import { CURRICULUM, getBeltIndex } from '../../lib/curriculum'
import type { Belt } from '../../types'
import type { TechniqueStatus } from '../../lib/curriculum'

interface AgendaItem {
  key: string
  sourceId: string
  sourceType: 'competition' | 'evenement'
  type: 'competition' | 'grade' | 'arbitrage' | 'stage' | 'ag' | 'autre'
  titre: string
  date: string
  lieu?: string
  niveau?: string
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

type ChartView = 'mois' | 'trimestre' | 'annee'
type RawData = { seancesList: { date: string; duree_minutes: number }[]; confirmedList: { date: string; duree_minutes: number }[]; schoolY: number }

function buildChartData(raw: RawData, view: ChartView): { label: string; possible: number; realise: number }[] {
  const { seancesList, confirmedList, schoolY } = raw
  const toH = (min: number) => Math.round((min / 60) * 10) / 10

  const periods: { label: string; keys: string[] }[] = []

  if (view === 'mois') {
    for (const m of [9,10,11,12,1,2,3,4,5,6]) {
      const y = m >= 9 ? schoolY : schoolY + 1
      const key = `${y}-${String(m).padStart(2,'0')}`
      const label = new Date(y, m - 1, 1).toLocaleDateString('fr-FR', { month: 'short' }).replace('.','')
      periods.push({ label, keys: [key] })
    }
  } else if (view === 'trimestre') {
    const TRIMS = [
      { label: 'T1 Sep–Nov', months: [9,10,11] },
      { label: 'T2 Déc–Fév', months: [12,1,2] },
      { label: 'T3 Mar–Mai', months: [3,4,5] },
      { label: 'T4 Jun', months: [6] },
    ]
    for (const { label, months } of TRIMS) {
      const keys = months.map(m => `${m >= 9 ? schoolY : schoolY + 1}-${String(m).padStart(2,'0')}`)
      periods.push({ label, keys })
    }
  } else {
    periods.push({ label: `${schoolY}–${schoolY+1}`, keys: [] })
  }

  let cumulPossible = 0
  let cumulRealise = 0
  return periods.map(({ label, keys }) => {
    const matchP = (s: { date: string }) => keys.length === 0 || keys.some(k => s.date.startsWith(k))
    cumulPossible += seancesList.filter(matchP).reduce((a,s) => a + s.duree_minutes, 0)
    cumulRealise += confirmedList.filter(matchP).reduce((a,s) => a + s.duree_minutes, 0)
    return { label, possible: toH(cumulPossible), realise: toH(cumulRealise) }
  })
}

const BELT_COLORS: Record<Belt, string> = {
  blanche: '#E5E5E5', jaune: '#FFD700', orange: '#FF8C00',
  verte: '#228B22', bleue: '#1565C0', marron: '#6D3B1E',
  noire: '#0A0A0A', 'noire-2': '#0A0A0A', 'noire-3': '#0A0A0A', 'noire-4': '#0A0A0A', 'noire-5': '#0A0A0A',
}

export default function Accueil() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [belt, setBelt] = useState<Belt | null>(null)
  const [loading, setLoading] = useState(true)
  const [pctGrade, setPctGrade] = useState(0)
  const [acquis, setAcquis] = useState(0)
  const [total, setTotal] = useState(0)
  const [playlistCount, setPlaylistCount] = useState(0)
  const [entrainementCount, setEntrainementCount] = useState(0)
  const [confirmedCount, setConfirmedCount] = useState(0)
  const [totalUpcoming, setTotalUpcoming] = useState(0)
  const [confirmedMinutes, setConfirmedMinutes] = useState(0)
  const [chartData, setChartData] = useState<{ label: string; possible: number; realise: number }[]>([])
  const [chartView, setChartView] = useState<ChartView>('mois')
  const [rawData, setRawData] = useState<RawData | null>(null)
  const [coursTotal, setCoursTotal] = useState(0)
  const [coursVus, setCoursVus] = useState(0)
  const [coursNouveaux, setCoursNouveaux] = useState(0)
  const [dossierDone, setDossierDone] = useState(0)
  const [dossierTotal] = useState(3)
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([])
  const [participationIds, setParticipationIds] = useState<Set<string>>(new Set()) // "src:id"

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: j } = await supabase.from('judokas').select('*').eq('user_id', user.id).single()
      if (!j) { setLoading(false); return }
      if (!j.full_name) { navigate('/eleve/onboarding', { replace: true }); return }

      setName(j.full_name ?? '')
      setPhotoUrl(j.photo_url ?? null)
      setBelt(j.belt ?? null)


      // Dossier
      const done = [!!(j.full_name && j.birth_date && j.phone), !!j.cert_medical_url, !!j.virement_url].filter(Boolean).length
      setDossierDone(done)

      // Progression grade
      const beltCurriculum = CURRICULUM.find(c => c.belt === j.belt)
      if (beltCurriculum) {
        const { data: mastery } = await supabase.from('technique_mastery').select('technique_key, status').eq('judoka_id', j.id)
        const map: Record<string, TechniqueStatus> = {}
        for (const m of mastery ?? []) map[m.technique_key] = m.status as TechniqueStatus
        const t = beltCurriculum.techniques.length
        const a = beltCurriculum.techniques.filter(tech => map[tech.key] === 'acquis').length
        setTotal(t)
        setAcquis(a)
        setPctGrade(t > 0 ? Math.round((a / t) * 100) : 0)
      }

      // Playlists
      const { count: plCount } = await supabase.from('playlists').select('*', { count: 'exact', head: true }).eq('judoka_id', j.id)
      setPlaylistCount(plCount ?? 0)

      // Entraînements
      const today = new Date()
      const todayStr = today.toISOString().slice(0, 10)
      const in7 = new Date(today); in7.setDate(today.getDate() + 7)
      const in7Str = in7.toISOString().slice(0, 10)
      const schoolY = today.getMonth() >= 8 ? today.getFullYear() : today.getFullYear() - 1
      const schoolStart = `${schoolY}-09-01`
      const schoolEnd = `${schoolY + 1}-06-30`
      type SeanceRef = { date: string; duree_minutes: number }
      const [{ data: seancesAll }, { data: presencesData }] = await Promise.all([
        supabase.from('seances').select('id, date, duree_minutes').gte('date', schoolStart).lte('date', schoolEnd),
        supabase.from('presences').select('seances(date, duree_minutes)').eq('judoka_id', j.id),
      ])
      const allPresences = (presencesData ?? []).map((p: { seances: SeanceRef | SeanceRef[] | null }) => {
        const s = p.seances; return Array.isArray(s) ? s[0] : s
      }).filter(Boolean) as SeanceRef[]
      const upcomingPresences = allPresences.filter(s => s.date >= todayStr && s.date <= in7Str)
      const futureConfirmed = allPresences.filter(s => s.date >= todayStr)
      setEntrainementCount(upcomingPresences.length)
      setTotalUpcoming((seancesAll ?? []).filter(s => s.date >= todayStr).length)
      setConfirmedCount(futureConfirmed.length)
      setConfirmedMinutes(futureConfirmed.reduce((sum, s) => sum + s.duree_minutes, 0))

      // Données brutes pour le graph (année scolaire)
      const seancesList = (seancesAll ?? []) as SeanceRef[]
      const confirmedList = allPresences.filter(s => s.date >= schoolStart && s.date <= schoolEnd)
      const raw = { seancesList, confirmedList, schoolY }
      setRawData(raw)
      setChartData(buildChartData(raw, 'mois'))

      // Cours stats
      const sevenDaysAgo = new Date(today); sevenDaysAgo.setDate(today.getDate() - 7)
      const sevenDaysAgoStr = sevenDaysAgo.toISOString()
      const [{ count: totalVids }, { count: vuCount }, { count: newCount }] = await Promise.all([
        supabase.from('videos').select('*', { count: 'exact', head: true }),
        supabase.from('video_views').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('videos').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgoStr),
      ])
      setCoursTotal(totalVids ?? 0)
      setCoursVus(vuCount ?? 0)
      setCoursNouveaux(newCount ?? 0)

      // Agenda à venir (compétitions + événements)
      const todayStr2 = new Date().toISOString().slice(0, 10)
      const [{ data: comps }, { data: evts }, { data: compParts }, { data: evtParts }] = await Promise.all([
        supabase.from('competitions').select('id, nom, date, lieu, niveau, tranche_age').gte('date', todayStr2).order('date'),
        supabase.from('evenements').select('id, type, titre, date, lieu').gte('date', todayStr2).order('date'),
        supabase.from('competition_participations').select('competition_id').eq('judoka_id', j.id),
        supabase.from('evenement_participations').select('evenement_id').eq('judoka_id', j.id),
      ])
      const ageCategory = j.birth_date ? getAgeCategory(j.birth_date) : null
      const items: AgendaItem[] = [
        ...(comps ?? [])
          .filter((c: { tranche_age?: string[] }) => { const t = c.tranche_age ?? []; return t.length === 0 || (ageCategory && t.includes(ageCategory)) })
          .map((c: { id: string; nom: string; date: string; lieu?: string; niveau?: string }) => ({
            key: `comp:${c.id}`, sourceId: c.id, sourceType: 'competition' as const,
            type: 'competition' as const, titre: c.nom, date: c.date, lieu: c.lieu, niveau: c.niveau,
          })),
        ...(evts ?? []).map((e: { id: string; type: string; titre: string; date: string; lieu?: string }) => ({
          key: `evt:${e.id}`, sourceId: e.id, sourceType: 'evenement' as const,
          type: e.type as AgendaItem['type'], titre: e.titre, date: e.date, lieu: e.lieu,
        })),
      ].sort((a, b) => a.date.localeCompare(b.date))
      setAgendaItems(items)
      const ids = new Set([
        ...(compParts ?? []).map((p: { competition_id: string }) => `comp:${p.competition_id}`),
        ...(evtParts ?? []).map((p: { evenement_id: string }) => `evt:${p.evenement_id}`),
      ])
      setParticipationIds(ids)

      setLoading(false)
    }
    load()
  }, [])



  if (loading) return <div className="text-center py-16 text-[#999999] text-sm">Chargement…</div>

  const firstName = name ? name.split(' ')[0] : ''
  const beltCurriculum = belt ? CURRICULUM.find(c => c.belt === belt) : null
  const nextBeltIndex = belt ? getBeltIndex(belt) + 1 : -1
  const nextBelt = nextBeltIndex < CURRICULUM.length ? CURRICULUM[nextBeltIndex] : null

  return (
    <div className="max-w-2xl mx-auto">
      {/* Greeting */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {photoUrl ? (
            <img src={photoUrl} alt={name} className="w-14 h-14 rounded-full object-cover border-2 border-[#E5E5E5]" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-[#F0F0F0] border-2 border-[#E5E5E5] flex items-center justify-center text-[#CCCCCC] text-lg font-bold">
              {firstName ? firstName[0].toUpperCase() : '?'}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">
              Coup d'œil sur ta progression! 📊
            </h1>
            <p className="text-[#999999] text-sm mt-0.5">Découvre où tu en es.</p>
          </div>
        </div>
        <img src="/logo.png" alt="Hazumi" title="Hazumi" className="h-12 w-12 object-contain opacity-80" />
      </div>

      <div className="space-y-4">
        {/* Bloc grade actuel */}
        <div
          className="bg-white rounded-xl border border-[#E5E5E5] p-5 cursor-pointer hover:border-[#CCCCCC] transition-all group"
          onClick={() => navigate('/eleve/progression?mode=grade')}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-widest text-[#999999]">Mon grade actuel</span>
            <svg className="w-4 h-4 text-[#CCCCCC] group-hover:text-[#C41230] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>

          {belt ? (
            <>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full border-4 border-[#E5E5E5] flex-shrink-0"
                  style={{ backgroundColor: BELT_COLORS[belt] }} />
                <div>
                  <p className="text-lg font-bold text-[#0A0A0A]">{beltCurriculum?.label ?? belt}</p>
                  <p className="text-xs text-[#999999]">{beltCurriculum?.kyu}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-2xl font-bold text-[#0A0A0A]">{pctGrade}%</p>
                  <p className="text-xs text-[#999999]">{acquis}/{total} techniques</p>
                </div>
              </div>
              <div className="h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
                <div className="h-full bg-[#C41230] rounded-full transition-all duration-500" style={{ width: `${pctGrade}%` }} />
              </div>
              {nextBelt && (
                <p className="text-xs text-[#CCCCCC] mt-2">
                  Prochain objectif : <span className="text-[#999999]">{nextBelt.label}</span>
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-[#CCCCCC]">Complétez votre profil pour voir votre grade.</p>
          )}
        </div>

        {/* 4 blocs stats en grille */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Mes playlists */}
          <div
            className="bg-white rounded-xl border border-[#E5E5E5] p-5 cursor-pointer hover:border-[#CCCCCC] transition-all group"
            onClick={() => navigate('/eleve/progression?mode=playlist')}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-widest text-[#999999]">Mes playlists</span>
              <svg className="w-3.5 h-3.5 text-[#CCCCCC] group-hover:text-[#C41230] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-[#0A0A0A]">{playlistCount}</p>
            <p className="text-xs text-[#999999] mt-1">playlist{playlistCount !== 1 ? 's' : ''}</p>
          </div>

          {/* Mes entraînements */}
          <div
            className="bg-white rounded-xl border border-[#E5E5E5] p-5 cursor-pointer hover:border-[#CCCCCC] transition-all group"
            onClick={() => navigate('/eleve/entrainements')}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-widest text-[#999999]">Entraînements</span>
              <svg className="w-3.5 h-3.5 text-[#CCCCCC] group-hover:text-[#C41230] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-[#0A0A0A]">{entrainementCount}</p>
            <p className="text-xs text-[#999999] mt-1">cette semaine</p>
            <div className="mt-2 pt-2 border-t border-[#F5F5F5] space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-[#999999]">Confirmées</span>
                <span className="text-[#0A0A0A] font-medium">{confirmedCount}/{totalUpcoming}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#999999]">Taux</span>
                <span className="text-[#0A0A0A] font-medium">{totalUpcoming > 0 ? Math.round((confirmedCount / totalUpcoming) * 100) : 0}%</span>
              </div>
              {confirmedMinutes > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-[#999999]">Heures</span>
                  <span className="text-[#C41230] font-semibold">{Math.floor(confirmedMinutes / 60)}h{String(confirmedMinutes % 60).padStart(2, '0')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Mes cours */}
          <div
            className="bg-white rounded-xl border border-[#E5E5E5] p-5 cursor-pointer hover:border-[#CCCCCC] transition-all group"
            onClick={() => navigate('/eleve/progression?mode=playlist')}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-widest text-[#999999]">Mes cours</span>
              <svg className="w-3.5 h-3.5 text-[#CCCCCC] group-hover:text-[#C41230] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-[#0A0A0A]">{coursTotal}</p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-[#999999]">Vues</span>
                <span className="text-[#0A0A0A] font-medium">{coursVus}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#999999]">À voir</span>
                <span className="text-[#0A0A0A] font-medium">{coursTotal - coursVus}</span>
              </div>
              {coursNouveaux > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-[#C41230]">Nouvelles</span>
                  <span className="text-[#C41230] font-semibold">+{coursNouveaux}</span>
                </div>
              )}
            </div>
          </div>

          {/* Événements à venir */}
          {(() => {
            const EVT_META: Record<string, { icon: string; label: string }> = {
              competition: { icon: '🏆', label: 'Compét.' },
              grade:       { icon: '🥋', label: 'Grade' },
              arbitrage:   { icon: '🤝', label: 'Arbitrage' },
              stage:       { icon: '📚', label: 'Stage' },
              ag:          { icon: '🏛️', label: 'AG' },
              autre:       { icon: '📅', label: 'Autre' },
            }
            const byType = agendaItems.reduce<Record<string, { total: number; confirmed: number }>>((acc, item) => {
              if (!acc[item.type]) acc[item.type] = { total: 0, confirmed: 0 }
              acc[item.type].total++
              if (participationIds.has(item.key)) acc[item.type].confirmed++
              return acc
            }, {})
            const typeEntries = Object.entries(byType)
            return (
              <div
                className="bg-white rounded-xl border border-[#E5E5E5] p-5 cursor-pointer hover:border-[#CCCCCC] transition-all group"
                onClick={() => navigate('/eleve/agenda')}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs uppercase tracking-widest text-[#999999]">Événements</span>
                  <svg className="w-3.5 h-3.5 text-[#CCCCCC] group-hover:text-[#C41230] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-[#0A0A0A]">{agendaItems.length}</p>
                {typeEntries.length === 0 ? (
                  <p className="text-xs text-[#CCCCCC] mt-1">aucun à venir</p>
                ) : (
                  <div className="mt-2 space-y-1">
                    {typeEntries.map(([type, counts]) => {
                      const meta = EVT_META[type] ?? { icon: '📅', label: type }
                      const allConfirmed = counts.confirmed === counts.total
                      const someConfirmed = counts.confirmed > 0 && counts.confirmed < counts.total
                      return (
                        <div key={type} className="flex items-center justify-between text-xs">
                          <span className="text-[#999999]">{meta.icon} {meta.label}</span>
                          <span className={`font-semibold tabular-nums ${allConfirmed ? 'text-[#C41230]' : someConfirmed ? 'text-amber-600' : 'text-[#CCCCCC]'}`}>
                            {counts.confirmed > 0 ? `${counts.confirmed}/` : ''}{counts.total}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })()}
        </div>

        {/* Graph heures : possible vs réalisé */}
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-widest text-[#999999]">Heures d'entraînement</span>
            <div className="flex gap-1">
              {(['mois', 'trimestre', 'annee'] as ChartView[]).map(v => (
                <button
                  key={v}
                  onClick={() => { setChartView(v); if (rawData) setChartData(buildChartData(rawData, v)) }}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors ${chartView === v ? 'bg-[#0A0A0A] text-white' : 'text-[#999999] hover:text-[#0A0A0A]'}`}
                >
                  {v === 'annee' ? 'Année' : v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={chartData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gPossible" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#CCCCCC" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#CCCCCC" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gRealise" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C41230" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#C41230" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#AAAAAA' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#AAAAAA' }} axisLine={false} tickLine={false} unit="h" />
              <Tooltip
                contentStyle={{ fontSize: 11, border: '1px solid #E5E5E5', borderRadius: 8, boxShadow: 'none' }}
                formatter={(v: unknown, name: unknown) => [`${v}h`, name === 'possible' ? 'Possible' : 'Réalisé']}
                labelStyle={{ color: '#333', fontWeight: 600 }}
              />
              <Legend formatter={(v) => v === 'possible' ? 'Possible' : 'Réalisé'} wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
              <Area type="monotone" dataKey="possible" stroke="#CCCCCC" strokeWidth={1.5} fill="url(#gPossible)" dot={false} />
              <Area type="monotone" dataKey="realise" stroke="#C41230" strokeWidth={2} fill="url(#gRealise)" dot={false} activeDot={{ r: 4, fill: '#C41230' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Dossier d'inscription — secondaire */}
        <div
          className="bg-white rounded-xl border border-[#E5E5E5] p-5 cursor-pointer hover:border-[#CCCCCC] transition-all group"
          onClick={() => navigate('/eleve/profil')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-widest text-[#999999]">Dossier d'inscription</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${dossierDone === dossierTotal ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                {dossierDone}/{dossierTotal}
              </span>
            </div>
            <svg className="w-4 h-4 text-[#CCCCCC] group-hover:text-[#C41230] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <div className="mt-3 h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${dossierDone === dossierTotal ? 'bg-green-500' : 'bg-[#C41230]'}`}
              style={{ width: `${Math.round((dossierDone / dossierTotal) * 100)}%` }}
            />
          </div>
          {dossierDone < dossierTotal && (
            <p className="text-xs text-[#CCCCCC] mt-2">Des documents sont manquants — cliquez pour compléter.</p>
          )}
        </div>
      </div>
    </div>
  )
}
