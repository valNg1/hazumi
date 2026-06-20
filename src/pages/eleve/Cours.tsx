import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { CURRICULUM, getBeltIndex } from '../../lib/curriculum'
import { detectVideoType, getEmbedUrl, getVideoLabel, getThumbnailUrl } from '../../lib/video'

interface Video {
  id: string
  title: string
  description: string | null
  belt: string | null
  technique_key: string | null
  video_url: string
  tags: string | null
  created_at: string
}

const BELT_COLORS: Record<string, string> = {
  blanche: '#E5E5E5', jaune: '#FFD700', orange: '#FF8C00',
  verte: '#228B22', bleue: '#1565C0', marron: '#6D3B1E', noire: '#0A0A0A',
  'noire-2': '#0A0A0A', 'noire-3': '#0A0A0A', 'noire-4': '#0A0A0A', 'noire-5': '#0A0A0A',
}

const SOURCE_BADGE: Record<string, string> = {
  youtube: 'bg-red-50 text-red-500',
  vimeo: 'bg-blue-50 text-blue-500',
  gdrive: 'bg-green-50 text-green-600',
  direct: 'bg-[#F5F5F5] text-[#999999]',
}

const COL = '1fr 0.6fr 0.5fr auto'

export default function Cours() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [filterBelt, setFilterBelt] = useState('')
  const [active, setActive] = useState<Video | null>(null)
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set())
  const [userId, setUserId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id ?? null)
      const [{ data: vids }, { data: views }] = await Promise.all([
        supabase.from('videos').select('*').order('created_at', { ascending: false }),
        user ? supabase.from('video_views').select('video_id').eq('user_id', user.id) : Promise.resolve({ data: [] }),
      ])
      setVideos(vids ?? [])
      setViewedIds(new Set((views ?? []).map((v: { video_id: string }) => v.video_id)))
      setLoading(false)
    }
    load()
  }, [])

  async function openVideo(video: Video) {
    setActive(video)
    if (userId && !viewedIds.has(video.id)) {
      await supabase.from('video_views').upsert({ user_id: userId, video_id: video.id }, { onConflict: 'user_id,video_id' })
      setViewedIds(prev => new Set([...prev, video.id]))
    }
  }

  const filterIdx = filterBelt ? getBeltIndex(filterBelt as any) : -1
  const filtered = filterBelt
    ? videos.filter(v => v.belt && getBeltIndex(v.belt as any) <= filterIdx)
    : videos

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">Mes cours</h1>
          <p className="text-[#999999] text-sm mt-0.5">Vidéos partagées par votre professeur</p>
        </div>
        <div className="flex border border-[#E5E5E5] rounded-lg overflow-hidden">
          <button onClick={() => setViewMode('list')}
            className={`px-3 py-2 transition-colors ${viewMode === 'list' ? 'bg-[#0A0A0A] text-white' : 'text-[#999999] hover:text-[#666666]'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
          <button onClick={() => setViewMode('grid')}
            className={`px-3 py-2 transition-colors ${viewMode === 'grid' ? 'bg-[#0A0A0A] text-white' : 'text-[#999999] hover:text-[#666666]'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        <button onClick={() => setFilterBelt('')}
          className={`px-3 py-1.5 rounded-lg text-xs border transition-all whitespace-nowrap ${!filterBelt ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]' : 'border-[#E5E5E5] text-[#666666] hover:border-[#CCCCCC]'}`}>
          Toutes
        </button>
        {CURRICULUM.map(c => (
          <button key={c.belt} onClick={() => setFilterBelt(filterBelt === c.belt ? '' : c.belt)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all whitespace-nowrap ${filterBelt === c.belt ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]' : 'border-[#E5E5E5] text-[#666666] hover:border-[#CCCCCC]'}`}>
            <span className="w-2.5 h-2.5 rounded-full border border-[#CCCCCC]" style={{ backgroundColor: BELT_COLORS[c.belt] }} />
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-[#999999] text-sm">Chargement…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-12 h-12 text-[#E5E5E5] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
          </svg>
          <p className="text-[#CCCCCC] text-sm">Aucune vidéo disponible pour l'instant.</p>
        </div>

      ) : viewMode === 'list' ? (
        <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
          {/* Header */}
          <div className="px-4 py-2 border-b border-[#F0F0F0] bg-[#FAFAFA]"
            style={{ display: 'grid', gridTemplateColumns: COL, gap: '0.75rem', alignItems: 'center' }}>
            <span className="text-xs uppercase tracking-widest text-[#999999]">Titre</span>
            <span className="text-xs uppercase tracking-widest text-[#999999]">Ceinture</span>
            <span className="text-xs uppercase tracking-widest text-[#999999]">Tags</span>
            <span />
          </div>

          {filtered.map((video, idx) => {
            const type = detectVideoType(video.video_url)
            const thumb = getThumbnailUrl(video.video_url)
            const viewed = viewedIds.has(video.id)
            return (
              <div key={video.id} className={`px-4 py-3 hover:bg-[#FAFAFA] transition-colors cursor-pointer group ${idx > 0 ? 'border-t border-[#F5F5F5]' : ''}`}
                style={{ display: 'grid', gridTemplateColumns: COL, gap: '0.75rem', alignItems: 'center' }}
                onClick={() => openVideo(video)}>
                {/* Titre + thumbnail */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-16 h-10 rounded-lg overflow-hidden bg-[#0A0A0A] flex-shrink-0 relative">
                    {thumb
                      ? <img src={thumb} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] flex items-center justify-center">
                          <svg className="w-4 h-4 text-white/30" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                    }
                    {viewed && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#0A0A0A] truncate">{video.title}</p>
                    {video.description && <p className="text-xs text-[#CCCCCC] truncate">{video.description}</p>}
                  </div>
                </div>
                {/* Ceinture */}
                <div>
                  {video.belt ? (
                    <span className="flex items-center gap-1.5 text-xs text-[#666666]">
                      <span className="w-2.5 h-2.5 rounded-full border border-[#CCCCCC] flex-shrink-0" style={{ backgroundColor: BELT_COLORS[video.belt] ?? '#0A0A0A' }} />
                      {CURRICULUM.find(c => c.belt === video.belt)?.label ?? video.belt}
                    </span>
                  ) : <span className="text-xs text-[#CCCCCC]">—</span>}
                </div>
                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {video.tags
                    ? video.tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 2).map(t => (
                        <span key={t} className="text-xs bg-[#F5F0FF] text-[#7C3AED] px-1.5 py-0.5 rounded-full">{t}</span>
                      ))
                    : <span className="text-xs text-[#CCCCCC]">—</span>
                  }
                </div>
                {/* Play */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SOURCE_BADGE[type]}`}>{getVideoLabel(video.video_url)}</span>
                  <div className="w-7 h-7 rounded-full bg-[#F5F5F5] group-hover:bg-[#C41230] flex items-center justify-center transition-colors flex-shrink-0">
                    <svg className="w-3 h-3 text-[#999999] group-hover:text-white ml-0.5 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(video => {
            const type = detectVideoType(video.video_url)
            return (
              <div key={video.id} onClick={() => openVideo(video)}
                className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden cursor-pointer group hover:border-[#C41230] transition-colors">
                <div className="relative bg-[#0A0A0A] aspect-video flex items-center justify-center overflow-hidden">
                  {viewedIds.has(video.id) && (
                    <div className="absolute top-2 left-2 z-10 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Vu
                    </div>
                  )}
                  {type === 'youtube' && (() => {
                    const match = video.video_url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
                    const id = match?.[1]
                    return id
                      ? <img src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={video.title} />
                      : null
                  })()}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5 text-[#C41230] ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="font-semibold text-[#0A0A0A] text-sm leading-snug flex-1">{video.title}</p>
                    <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${SOURCE_BADGE[type]}`}>{getVideoLabel(video.video_url)}</span>
                  </div>
                  {video.description && <p className="text-xs text-[#999999] line-clamp-2 mb-2">{video.description}</p>}
                  <div className="flex items-center gap-2 flex-wrap">
                    {video.belt && (
                      <span className="flex items-center gap-1 text-xs text-[#999999] bg-[#F5F5F5] px-2 py-0.5 rounded-full">
                        <span className="w-2 h-2 rounded-full border border-[#CCCCCC]" style={{ backgroundColor: BELT_COLORS[video.belt] }} />
                        {CURRICULUM.find(c => c.belt === video.belt)?.label ?? video.belt}
                      </span>
                    )}
                    {video.tags && video.tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 2).map(t => (
                      <span key={t} className="text-xs bg-[#F5F0FF] text-[#7C3AED] px-2 py-0.5 rounded-full">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Player modal */}
      {active && (() => {
        const type = detectVideoType(active.video_url)
        const embedUrl = getEmbedUrl(active.video_url)
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
            <div className="absolute inset-0 bg-black/80" onClick={() => setActive(null)} />
            <div className="relative bg-[#0A0A0A] rounded-2xl overflow-hidden w-full max-w-3xl shadow-2xl">
              <div className="aspect-video">
                {type === 'direct'
                  ? <video src={active.video_url} className="w-full h-full" controls autoPlay />
                  : <iframe src={embedUrl} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                }
              </div>
              <div className="p-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-white font-semibold">{active.title}</p>
                  {active.description && <p className="text-[#999999] text-sm mt-1">{active.description}</p>}
                  {active.tags && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {active.tags.split(',').map(t => t.trim()).filter(Boolean).map(t => (
                        <span key={t} className="text-xs bg-[#2D1B69] text-[#A78BFA] px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => setActive(null)} className="text-[#666666] hover:text-white transition-colors flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
