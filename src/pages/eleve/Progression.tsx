import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { isBenDemoAccount } from '../../lib/demo'
import { CURRICULUM, getCategorieLabel, getBeltIndex } from '../../lib/curriculum'
import type { Belt } from '../../types'
import type { TechniqueStatus } from '../../lib/curriculum'
import MesPlaylists from './MesPlaylists'
import ProGate from '../../components/ProGate'
import { getThumbnailUrl, getEmbedUrl, getVideoLabel, detectVideoType } from '../../lib/video'

interface BibVideo {
  id: string
  title: string
  description: string | null
  belt: string | null
  technique_key: string | null
  video_url: string
  tags: string | null
}
const BELT_COLORS: Record<Belt, string> = {
  blanche: '#FFFFFF', jaune: '#FFD700', orange: '#FF8C00',
  verte: '#228B22', bleue: '#1565C0', marron: '#6D3B1E',
  noire: '#0A0A0A', 'noire-2': '#0A0A0A', 'noire-3': '#0A0A0A', 'noire-4': '#0A0A0A', 'noire-5': '#0A0A0A',
}


const ENCOURAGEMENTS = [
  'Technique acquise ! Osae-komi ! 🎯',
  'Bien joué ! Le tatami retient tes progrès. 💪',
  'Ippon ! Une technique de plus maîtrisée. ⚡',
  'Excellent travail ! Chaque répétition compte. 🥋',
]

const BELT_COMPLETE_MSG: Record<string, string> = {
  blanche: 'Les bases sont acquises. Tu es prêt(e) pour la ceinture jaune ! 🌟',
  jaune: 'Beau travail ! Tu maîtrises les fondamentaux du judo. En route vers l\'orange ! 🔥',
  orange: 'Impressionnant ! Ta technique s\'affirme. La ceinture verte t\'attend ! 🚀',
  verte: 'Tu progresses vite ! La moitié du chemin est faite. 💫',
  bleue: 'Niveau avancé atteint ! Tu te rapproches de la ceinture marron. 🏆',
  marron: 'Exceptionnel ! Tu es aux portes de la ceinture noire. Tout l\'effort en valait la peine ! ⭐',
  noire: 'IPPON ! Tu as atteint le sommet. 1er Dan — la voie du judo continue, pour toujours. 🥋🖤',
}

export default function Progression() {
  const navigate = useNavigate()
  const [judokaId, setJudokaId] = useState<string | null>(null)
  const [currentBelt, setCurrentBelt] = useState<Belt | null>(null)
  const [objectif, setObjectif] = useState('')
  const [mastery, setMastery] = useState<Record<string, TechniqueStatus>>({})
  const [loading, setLoading] = useState(true)
  const [selectedBelt, setSelectedBelt] = useState<Belt | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [beltComplete, setBeltComplete] = useState(false)
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState<'grade' | 'playlist'>(searchParams.get('mode') === 'playlist' ? 'playlist' : 'grade')
  const [bibVideos, setBibVideos] = useState<BibVideo[]>([])
  const [playerVideo, setPlayerVideo] = useState<BibVideo | null>(null)
  const [videoViewMode, setVideoViewMode] = useState<'grid' | 'list'>('list')
  const [isPro, setIsPro] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: judoka } = await supabase.from('judokas').select('id, belt, objectif, cotisation_paid').eq('user_id', user.id).single()
      if (!judoka) { setLoading(false); return }
      setJudokaId(judoka.id)
      setCurrentBelt(judoka.belt)
      setObjectif(judoka.objectif ?? '')
      setSelectedBelt(judoka.belt)
      const isBen = await isBenDemoAccount(user.email)
      setIsPro(isBen || (judoka.cotisation_paid ?? false))
      const { data: items } = await supabase.from('technique_mastery').select('technique_key, status').eq('judoka_id', judoka.id)
      const map: Record<string, TechniqueStatus> = {}
      for (const item of items ?? []) map[item.technique_key] = item.status as TechniqueStatus
      setMastery(map)
      setLoading(false)
    }
    load()
  }, [])

  async function setMasteryTo(techniqueKey: string, status: TechniqueStatus) {
    if (!judokaId) return
    const newMastery = { ...mastery, [techniqueKey]: status }
    setMastery(newMastery)
    await supabase.from('technique_mastery').upsert(
      { judoka_id: judokaId, technique_key: techniqueKey, status, updated_at: new Date().toISOString() },
      { onConflict: 'judoka_id,technique_key' }
    )
    if (status === 'acquis') {
      const msg = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]
      setToast(msg)
      setTimeout(() => setToast(null), 3000)

      const activeCurriculum = CURRICULUM.find(c => c.belt === selectedBelt)
      if (activeCurriculum) {
        const allAcquis = activeCurriculum.techniques.every(
          t => (t.key === techniqueKey ? 'acquis' : newMastery[t.key]) === 'acquis'
        )
        if (allAcquis) {
          setTimeout(() => setBeltComplete(true), 500)
        }
      }
    }
  }

  useEffect(() => {
    if (!selectedBelt) return
    supabase.from('videos').select('id, title, description, belt, technique_key, video_url, tags')
      .eq('belt', selectedBelt)
      .order('created_at', { ascending: false })
      .then(({ data }) => setBibVideos(data ?? []))
  }, [selectedBelt])

  if (loading) return <div className="text-center py-16 text-[#999999] text-sm">Chargement…</div>

  if (!currentBelt) return (
    <div className="text-center py-16">
      <p className="text-[#666666] text-sm mb-4">Complétez votre profil pour accéder à votre progression.</p>
      <button onClick={() => navigate('/eleve/profil')}
        className="bg-[#C41230] text-white text-xs uppercase tracking-widest px-5 py-2.5 rounded-lg">
        Compléter mon profil
      </button>
    </div>
  )

  const currentIndex = getBeltIndex(currentBelt)
  const activeCurriculum = CURRICULUM.find(c => c.belt === (selectedBelt ?? currentBelt))
  const techniques = activeCurriculum?.techniques ?? []

  const byCategorie = techniques.reduce<Record<string, typeof techniques>>((acc, t) => {
    if (!acc[t.categorie]) acc[t.categorie] = []
    acc[t.categorie].push(t)
    return acc
  }, {})

  const acquis = techniques.filter(t => mastery[t.key] === 'acquis').length
  const enCours = techniques.filter(t => mastery[t.key] === 'en_cours').length
  const pct = techniques.length > 0 ? Math.round((acquis / techniques.length) * 100) : 0

  return (
    <div>
      {/* Titre + onglets */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0A0A0A] tracking-tight mb-4">Ma progression</h1>
        <div className="flex gap-1 bg-[#F5F5F5] p-1 rounded-lg w-fit">
          <button
            onClick={() => setMode('grade')}
            className={`px-4 py-2 text-xs rounded-md transition-all ${mode === 'grade' ? 'bg-white text-[#0A0A0A] shadow-sm font-semibold' : 'text-[#999999] hover:text-[#666666]'}`}
          >
            Passage de grades
          </button>
          <button
            onClick={() => setMode('playlist')}
            className={`px-4 py-2 text-xs sm:text-sm rounded-md transition-all flex items-center gap-1.5 font-medium ${mode === 'playlist' ? 'bg-white text-[#0A0A0A] shadow-sm font-semibold' : 'text-[#C41230] bg-red-50 hover:bg-red-100'}`}
          >
            <span className="text-sm">▶</span>
            Mes playlists
          </button>
        </div>
      </div>

      {mode === 'playlist' && (
        <ProGate isPro={isPro} type="judoka" feature="Mes playlists">
          <MesPlaylists />
        </ProGate>
      )}
      {mode === 'grade' && <>

      {/* Toast encouragement */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0A0A0A] text-white text-sm px-5 py-3 rounded-xl shadow-lg animate-pulse">
          {toast}
        </div>
      )}

      {/* Modal ceinture complète */}
      {beltComplete && activeCurriculum && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setBeltComplete(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 border-4 border-[#C41230] flex items-center justify-center"
              style={{ backgroundColor: activeCurriculum.color }}>
              <svg className="w-8 h-8 text-[#C41230]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#0A0A0A] mb-2">Tu as atteint le niveau pour obtenir ta {activeCurriculum.label.toLowerCase()} !</h2>
            <p className="text-[#666666] text-sm leading-relaxed mb-6">
              {BELT_COMPLETE_MSG[activeCurriculum.belt]}
            </p>
            <button
              onClick={() => setBeltComplete(false)}
              className="bg-[#C41230] hover:bg-[#9B0E25] text-white text-xs uppercase tracking-widest px-6 py-3 rounded-lg transition-colors w-full"
            >
              Continuer
            </button>
          </div>
        </div>
      )}

      <div className="mb-6">
        {objectif && (
          <div className="mt-3 bg-white border border-[#E5E5E5] rounded-xl px-4 py-3 flex gap-3 items-start max-w-xl">
            <svg className="w-4 h-4 text-[#C41230] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <div>
              <p className="text-xs uppercase tracking-widest text-[#999999] mb-0.5">Mon objectif</p>
              <p className="text-sm text-[#333333]">{objectif}</p>
            </div>
          </div>
        )}
      </div>

      {/* Sélecteur de ceinture */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {CURRICULUM.map((c, i) => {
          const isCurrent = c.belt === currentBelt
          const isUnlocked = i <= currentIndex + 1
          return (
            <button
              key={c.belt}
              onClick={() => isUnlocked && setSelectedBelt(c.belt)}
              disabled={!isUnlocked}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs whitespace-nowrap transition-all ${
                selectedBelt === c.belt
                  ? 'border-[#C41230] bg-[#C41230] text-white'
                  : isUnlocked
                  ? 'border-[#E5E5E5] bg-white text-[#666666] hover:border-[#CCCCCC]'
                  : 'border-[#F0F0F0] bg-[#FAFAFA] text-[#DDDDDD] cursor-not-allowed'
              }`}
            >
              <span className="w-3 h-3 rounded-full border border-[#DDDDDD] flex-shrink-0"
                style={{ backgroundColor: BELT_COLORS[c.belt] }} />
              {isCurrent && <span className="font-semibold">{c.label}</span>}
              {!isCurrent && c.label}
            </button>
          )
        })}
      </div>

      {activeCurriculum && (
        <div>
          {/* Header ceinture sélectionnée */}
          <div className="bg-white rounded-xl border border-[#E5E5E5] p-5 mb-4">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-4 h-4 rounded-full border border-[#CCCCCC]"
                    style={{ backgroundColor: BELT_COLORS[activeCurriculum.belt] }} />
                  <h2 className="font-bold text-[#0A0A0A]">{activeCurriculum.label}</h2>
                  <span className="text-xs text-[#999999]">— {activeCurriculum.kyu}</span>
                </div>
                <p className="text-sm text-[#666666]">{activeCurriculum.objectif}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-2xl font-bold text-[#0A0A0A]">{pct}%</p>
                <p className="text-xs text-[#999999]">{acquis}/{techniques.length} acquis</p>
              </div>
            </div>
            <div className="h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
              <div className="h-full bg-[#C41230] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
            {enCours > 0 && (
              <p className="text-xs text-amber-600 mt-2">{enCours} technique{enCours > 1 ? 's' : ''} en cours de travail</p>
            )}
          </div>

          {/* Techniques par catégorie */}
          <ProGate isPro={isPro} type="judoka" feature="Suivi de progression détaillé">
          <div className="space-y-3">
            {Object.entries(byCategorie).map(([cat, techs]) => {
              const catAcquis = techs.filter(t => mastery[t.key] === 'acquis').length
              return (
                <div key={cat} className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-[#F5F5F5]">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-[#666666]">
                      {getCategorieLabel(cat)}
                    </h3>
                    <span className="text-xs text-[#999999]">{catAcquis}/{techs.length}</span>
                  </div>
                  <div className="divide-y divide-[#F8F8F8]">
                    {techs.map(tech => {
                      const status = mastery[tech.key] ?? 'a_travailler'
                      return (
                        <div key={tech.key} className="flex items-center gap-4 px-5 py-3 hover:bg-[#FAFAFA] transition-colors group">
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${status === 'acquis' ? 'text-[#999999]' : 'text-[#0A0A0A]'}`}>
                              {tech.nom}
                            </p>
                            {tech.description && (
                              <p className="text-xs text-[#CCCCCC]">{tech.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {status !== 'en_cours' && status !== 'acquis' && (
                              <button
                                onClick={() => setMasteryTo(tech.key, 'en_cours')}
                                className="text-xs px-3 py-1.5 rounded-lg border border-[#E5E5E5] text-[#999999] hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50 transition-all opacity-0 group-hover:opacity-100"
                              >
                                En cours
                              </button>
                            )}
                            {status === 'en_cours' && (
                              <span className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-600">En cours</span>
                            )}
                            <button
                              onClick={() => setMasteryTo(tech.key, status === 'acquis' ? 'a_travailler' : 'acquis')}
                              className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                                status === 'acquis'
                                  ? 'bg-green-500 border-green-500'
                                  : 'border-[#E5E5E5] hover:border-green-400 group-hover:border-[#CCCCCC]'
                              }`}
                              title={status === 'acquis' ? 'Marquer comme non acquis' : 'Marquer comme acquis'}
                            >
                              <svg className={`w-3.5 h-3.5 transition-colors ${status === 'acquis' ? 'text-white' : 'text-[#DDDDDD] group-hover:text-[#CCCCCC]'}`}
                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          <p className="text-xs text-[#CCCCCC] text-center mt-4">
            Cliquez sur une technique pour faire tourner son statut : À travailler → En cours → Acquis
          </p>
          </ProGate>

          {bibVideos.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-[#999999]">
                  Vidéos — {activeCurriculum.label}
                </h3>
                <div className="flex border border-[#E5E5E5] rounded-lg overflow-hidden">
                  <button onClick={() => setVideoViewMode('list')}
                    className={`px-2.5 py-1.5 transition-colors ${videoViewMode === 'list' ? 'bg-[#0A0A0A] text-white' : 'text-[#999999] hover:text-[#666666]'}`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                  <button onClick={() => setVideoViewMode('grid')}
                    className={`px-2.5 py-1.5 transition-colors ${videoViewMode === 'grid' ? 'bg-[#0A0A0A] text-white' : 'text-[#999999] hover:text-[#666666]'}`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                    </svg>
                  </button>
                </div>
              </div>

              {videoViewMode === 'list' ? (
                <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
                  {bibVideos.map((v, idx) => {
                    const thumb = getThumbnailUrl(v.video_url)
                    return (
                      <div key={v.id} onClick={() => setPlayerVideo(v)}
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#FAFAFA] transition-colors group ${idx > 0 ? 'border-t border-[#F5F5F5]' : ''}`}>
                        <div className="w-16 h-10 rounded-lg overflow-hidden bg-[#0A0A0A] flex-shrink-0">
                          {thumb
                            ? <img src={thumb} alt={v.title} className="w-full h-full object-cover" />
                            : <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] flex items-center justify-center">
                                <svg className="w-4 h-4 text-white/30" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                              </div>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#0A0A0A] truncate">{v.title}</p>
                          <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                            <span className="text-xs text-[#999999]">{getVideoLabel(v.video_url)}</span>
                            {v.tags && v.tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 2).map(t => (
                              <span key={t} className="text-xs bg-[#F5F0FF] text-[#7C3AED] px-1.5 py-0.5 rounded-full">{t}</span>
                            ))}
                          </div>
                        </div>
                        <div className="w-7 h-7 rounded-full bg-[#F5F5F5] group-hover:bg-[#C41230] flex items-center justify-center transition-colors flex-shrink-0">
                          <svg className="w-3 h-3 text-[#999999] group-hover:text-white ml-0.5 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {bibVideos.map(v => {
                    const thumb = getThumbnailUrl(v.video_url)
                    return (
                      <div key={v.id} onClick={() => setPlayerVideo(v)}
                        className="cursor-pointer group bg-white rounded-xl border border-[#E5E5E5] overflow-hidden hover:border-[#C41230] transition-all">
                        <div className="aspect-video bg-[#0A0A0A] relative overflow-hidden">
                          {thumb
                            ? <img src={thumb} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            : <div className="w-full h-full flex items-center justify-center text-[#444444] text-2xl">▶</div>
                          }
                        </div>
                        <div className="p-3">
                          <p className="text-xs font-semibold text-[#0A0A0A] line-clamp-2">{v.title}</p>
                          {v.tags && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {v.tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 2).map(t => (
                                <span key={t} className="text-xs bg-[#F5F0FF] text-[#7C3AED] px-1.5 py-0.5 rounded-full">{t}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {playerVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setPlayerVideo(null)} />
          <div className="relative bg-[#0A0A0A] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1A1A1A]">
              <div>
                <p className="text-sm font-semibold text-white">{playerVideo.title}</p>
                {playerVideo.description && <p className="text-xs text-[#666666] mt-0.5">{playerVideo.description}</p>}
              </div>
              <button onClick={() => setPlayerVideo(null)}
                className="w-8 h-8 flex items-center justify-center text-[#666666] hover:text-white transition-colors flex-shrink-0 ml-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="aspect-video w-full">
              {detectVideoType(playerVideo.video_url) !== 'direct'
                ? <iframe
                    src={getEmbedUrl(playerVideo.video_url)}
                    className="w-full h-full"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                  />
                : <video src={playerVideo.video_url} controls className="w-full h-full" />
              }
            </div>
          </div>
        </div>
      )}
      </>}
    </div>
  )
}
