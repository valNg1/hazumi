import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { CURRICULUM, getBeltIndex } from '../../lib/curriculum'
import type { Belt } from '../../types'
import type { TechniqueStatus } from '../../lib/curriculum'

const BELT_COLORS: Record<Belt, string> = {
  blanche: '#E5E5E5', jaune: '#FFD700', orange: '#FF8C00',
  verte: '#228B22', bleue: '#1565C0', marron: '#6D3B1E', noire: '#0A0A0A',
}

export default function Accueil() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [club, setClub] = useState('')
  const [belt, setBelt] = useState<Belt | null>(null)
  const [loading, setLoading] = useState(true)
  const [pctGrade, setPctGrade] = useState(0)
  const [acquis, setAcquis] = useState(0)
  const [total, setTotal] = useState(0)
  const [clubLogo, setClubLogo] = useState<string | null>(null)
  const [playlistCount, setPlaylistCount] = useState(0)
  const [entrainementCount, setEntrainementCount] = useState(0)
  const [confirmedCount, setConfirmedCount] = useState(0)
  const [totalUpcoming, setTotalUpcoming] = useState(0)
  const [confirmedMinutes, setConfirmedMinutes] = useState(0)
  const [coursTotal, setCoursTotal] = useState(0)
  const [coursVus, setCoursVus] = useState(0)
  const [coursNouveaux, setCoursNouveaux] = useState(0)
  const [dossierDone, setDossierDone] = useState(0)
  const [dossierTotal] = useState(3)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: j } = await supabase.from('judokas').select('*').eq('user_id', user.id).single()
      if (!j) { setLoading(false); return }

      setName(j.full_name ?? '')
      setPhotoUrl(j.photo_url ?? null)
      setClub(j.club ?? '')
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

      // Logo club (table peut ne pas encore exister)
      try {
        const { data: clubData } = await supabase.from('clubs').select('logo_url').limit(1).single()
        setClubLogo(clubData?.logo_url ?? null)
      } catch { /* table absente, on ignore */ }

      // Playlists
      const { count: plCount } = await supabase.from('playlists').select('*', { count: 'exact', head: true }).eq('judoka_id', j.id)
      setPlaylistCount(plCount ?? 0)

      // Entraînements
      const today = new Date()
      const todayStr = today.toISOString().slice(0, 10)
      const in7 = new Date(today); in7.setDate(today.getDate() + 7)
      const in7Str = in7.toISOString().slice(0, 10)
      const [{ data: allSeances }, { data: presencesData }] = await Promise.all([
        supabase.from('seances').select('id, date, duree_minutes').gte('date', todayStr),
        supabase.from('presences').select('seances(date, duree_minutes)').eq('judoka_id', j.id),
      ])
      type SeanceRef = { date: string; duree_minutes: number }
      const allPresences = (presencesData ?? []).map((p: { seances: SeanceRef | SeanceRef[] | null }) => {
        const s = p.seances
        return Array.isArray(s) ? s[0] : s
      }).filter(Boolean) as SeanceRef[]
      const upcomingPresences = allPresences.filter(s => s.date >= todayStr && s.date <= in7Str)
      const futureConfirmed = allPresences.filter(s => s.date >= todayStr)
      setEntrainementCount(upcomingPresences.length)
      setTotalUpcoming((allSeances ?? []).length)
      setConfirmedCount(futureConfirmed.length)
      setConfirmedMinutes(futureConfirmed.reduce((sum, s) => sum + s.duree_minutes, 0))

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
              {firstName ? `Bonjour, ${firstName}` : 'Bienvenue sur Hazumi'}
            </h1>
            <p className="text-[#999999] text-sm mt-0.5">Voici un résumé de ta progression.</p>
          </div>
        </div>
        <img src={clubLogo ?? '/logo.png'} alt={club || 'Club'} title={club || 'Club'} className="h-12 w-12 object-contain opacity-80" />
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

        {/* 3 blocs stats en grille */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            onClick={() => navigate('/eleve/cours')}
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
