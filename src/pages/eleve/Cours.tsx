import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { CURRICULUM, getBeltIndex } from '../../lib/curriculum'
import { detectVideoType, getEmbedUrl, getVideoLabel } from '../../lib/video'

interface Video {
  id: string
  title: string
  description: string | null
  belt: string | null
  technique_key: string | null
  video_url: string
  created_at: string
}

const BELT_COLORS: Record<string, string> = {
  blanche: '#E5E5E5', jaune: '#FFD700', orange: '#FF8C00',
  verte: '#228B22', bleue: '#1565C0', marron: '#6D3B1E', noire: '#0A0A0A',
}

const SOURCE_BADGE: Record<string, string> = {
  youtube: 'bg-red-50 text-red-500',
  vimeo: 'bg-blue-50 text-blue-500',
  gdrive: 'bg-green-50 text-green-600',
  direct: 'bg-[#F5F5F5] text-[#999999]',
}

export default function Cours() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [filterBelt, setFilterBelt] = useState('')
  const [active, setActive] = useState<Video | null>(null)

  useEffect(() => {
    supabase.from('videos').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setVideos(data ?? []); setLoading(false) })
  }, [])

  const filterIdx = filterBelt ? getBeltIndex(filterBelt as any) : -1
  const filtered = filterBelt
    ? videos.filter(v => v.belt && getBeltIndex(v.belt as any) <= filterIdx)
    : videos

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">Mes cours</h1>
        <p className="text-[#999999] text-sm mt-0.5">Vidéos partagées par votre professeur</p>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterBelt('')}
          className={`px-3 py-1.5 rounded-lg text-xs border transition-all whitespace-nowrap ${!filterBelt ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]' : 'border-[#E5E5E5] text-[#666666] hover:border-[#CCCCCC]'}`}
        >
          Toutes
        </button>
        {CURRICULUM.map(c => (
          <button
            key={c.belt}
            onClick={() => setFilterBelt(filterBelt === c.belt ? '' : c.belt)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all whitespace-nowrap ${filterBelt === c.belt ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]' : 'border-[#E5E5E5] text-[#666666] hover:border-[#CCCCCC]'}`}
          >
            <span className="w-2.5 h-2.5 rounded-full border border-[#CCCCCC]" style={{ backgroundColor: BELT_COLORS[c.belt] }} />
            {c.label.replace('Ceinture ', '')}
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
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(video => {
            const type = detectVideoType(video.video_url)
            return (
              <div
                key={video.id}
                onClick={() => setActive(video)}
                className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden cursor-pointer group hover:border-[#C41230] transition-colors"
              >
                <div className="relative bg-[#0A0A0A] aspect-video flex items-center justify-center overflow-hidden">
                  {type === 'youtube' && (() => {
                    const match = video.video_url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
                    const id = match?.[1]
                    return id
                      ? <img src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={video.title} />
                      : null
                  })()}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5 text-[#C41230] ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="font-semibold text-[#0A0A0A] text-sm leading-snug flex-1">{video.title}</p>
                    <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${SOURCE_BADGE[type]}`}>
                      {getVideoLabel(video.video_url)}
                    </span>
                  </div>
                  {video.description && (
                    <p className="text-xs text-[#999999] line-clamp-2 mb-2">{video.description}</p>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    {video.belt && (
                      <span className="flex items-center gap-1 text-xs text-[#999999] bg-[#F5F5F5] px-2 py-0.5 rounded-full">
                        <span className="w-2 h-2 rounded-full border border-[#CCCCCC]" style={{ backgroundColor: BELT_COLORS[video.belt] }} />
                        {video.belt.charAt(0).toUpperCase() + video.belt.slice(1)}
                      </span>
                    )}
                    {video.technique_key && (
                      <span className="text-xs text-[#999999] bg-[#F5F5F5] px-2 py-0.5 rounded-full">
                        # {video.technique_key}
                      </span>
                    )}
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
