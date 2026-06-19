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
  const [belt, setBelt] = useState<Belt | null>(null)
  const [loading, setLoading] = useState(true)
  const [pctGrade, setPctGrade] = useState(0)
  const [acquis, setAcquis] = useState(0)
  const [total, setTotal] = useState(0)
  const [playlistCount, setPlaylistCount] = useState(0)
  const [dossierDone, setDossierDone] = useState(0)
  const [dossierTotal] = useState(3)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: j } = await supabase.from('judokas').select('*').eq('user_id', user.id).single()
      if (!j) { setLoading(false); return }

      setName(j.full_name ?? '')
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
      const { count } = await supabase.from('playlists').select('*', { count: 'exact', head: true }).eq('judoka_id', j.id)
      setPlaylistCount(count ?? 0)

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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">
          {firstName ? `Bonjour, ${firstName} 👋` : 'Bienvenue sur Hazumi'}
        </h1>
        <p className="text-[#666666] text-sm mt-1">Voici un résumé de ta progression.</p>
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

        {/* Bloc playlists */}
        <div
          className="bg-white rounded-xl border border-[#E5E5E5] p-5 cursor-pointer hover:border-[#CCCCCC] transition-all group"
          onClick={() => navigate('/eleve/progression?mode=playlist')}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-widest text-[#999999]">Mes playlists</span>
            <svg className="w-4 h-4 text-[#CCCCCC] group-hover:text-[#C41230] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#F5F5F5] rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-[#CCCCCC]" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="3.5" r="1.5" />
                <path d="M9 7.5c0-.3.2-.5.5-.5h5c.3 0 .5.2.5.5v.1L16.5 11H14l-.5-2h-3L10 11H7.5L9 7.6V7.5z" />
                <path d="M7.5 11l-2 5h2l1-2.5 1.5 1.5v4h2v-4.5l-1.8-1.8L11 11H7.5z" />
                <path d="M16.5 11l2 5h-2l-1-2.5-1.5 1.5v4h-2v-4.5l1.8-1.8L13 11h3.5z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#0A0A0A]">{playlistCount}</p>
              <p className="text-xs text-[#999999]">playlist{playlistCount !== 1 ? 's' : ''} créée{playlistCount !== 1 ? 's' : ''}</p>
            </div>
            {playlistCount === 0 && (
              <p className="text-xs text-[#CCCCCC] ml-2">Créez votre première playlist dans Ma progression.</p>
            )}
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
