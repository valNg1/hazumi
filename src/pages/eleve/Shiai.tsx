import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { detectVideoType, getVideoLabel } from '../../lib/video'

interface Video {
  id: string
  url: string
  titre: string
  mots_cles: string
}

export default function Shiai() {
  const [judokaId, setJudokaId] = useState<string | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [formData, setFormData] = useState({ url: '', titre: '', mots_cles: '' })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: judoka } = await supabase.from('judokas').select('id').eq('user_id', user.id).single()
      if (!judoka) { setLoading(false); return }
      setJudokaId(judoka.id)
      await loadVideos(judoka.id)
      setLoading(false)
    }
    load()
  }, [])

  async function loadVideos(jid: string) {
    const { data } = await supabase
      .from('playlists')
      .select('id, external_url, external_title, mots_cles')
      .eq('judoka_id', jid)
      .order('created_at', { ascending: false })
    if (data) {
      setVideos(data.map(v => ({
        id: v.id,
        url: v.external_url || '',
        titre: v.external_title || '',
        mots_cles: v.mots_cles || '',
      })))
    }
  }

  async function addVideo() {
    if (!judokaId || !formData.url || !formData.titre) {
      setError('URL et nom sont obligatoires')
      return
    }
    setAdding(true)
    setError(null)

    const videoType = detectVideoType(formData.url)
    if (!['youtube', 'vimeo', 'instagram'].includes(videoType)) {
      setError('URL non supportée (YouTube, Vimeo, Instagram)')
      setAdding(false)
      return
    }

    const { error: err } = await supabase.from('playlists').insert({
      judoka_id: judokaId,
      name: formData.titre,
      external_url: formData.url,
      external_title: formData.titre,
      mots_cles: formData.mots_cles || null,
    })

    if (err) {
      setError('Erreur lors de l\'ajout')
    } else {
      setFormData({ url: '', titre: '', mots_cles: '' })
      await loadVideos(judokaId)
    }
    setAdding(false)
  }

  async function deleteVideo(videoId: string) {
    if (!window.confirm('Supprimer cette vidéo ?')) return
    await supabase.from('playlists').delete().eq('id', videoId)
    setVideos(prev => prev.filter(v => v.id !== videoId))
  }

  if (loading) return <div className="text-center py-16 text-[#999999] text-sm">Chargement…</div>

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0A0A0A] tracking-tight mb-2">🥊 Shiai</h1>
        <p className="text-[#666666] text-sm">Mes vidéos de judo — techniques, combats, conseils</p>
      </div>

      {/* Formulaire d'ajout */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-6 mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-[#666666] mb-4">Ajouter une vidéo</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-[#666666] mb-1.5 block">URL (YouTube, Vimeo, Instagram)</label>
            <input
              type="text"
              value={formData.url}
              onChange={e => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full px-3 py-2.5 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:border-[#C41230]"
            />
          </div>

          <div>
            <label className="text-xs text-[#666666] mb-1.5 block">Nom de la vidéo</label>
            <input
              type="text"
              value={formData.titre}
              onChange={e => setFormData({ ...formData, titre: e.target.value })}
              placeholder="Ex: O goshi sur judoka grand"
              className="w-full px-3 py-2.5 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:border-[#C41230]"
            />
          </div>

          <div>
            <label className="text-xs text-[#666666] mb-1.5 block">Mots-clés (optionnel)</label>
            <input
              type="text"
              value={formData.mots_cles}
              onChange={e => setFormData({ ...formData, mots_cles: e.target.value })}
              placeholder="o goshi, judo, technique, shiai"
              className="w-full px-3 py-2.5 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:border-[#C41230]"
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            onClick={addVideo}
            disabled={adding}
            className="w-full bg-[#C41230] hover:bg-[#9B0E25] disabled:bg-[#CCCCCC] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
          >
            {adding ? 'Ajout en cours…' : 'Ajouter la vidéo'}
          </button>
        </div>
      </div>

      {/* Liste des vidéos */}
      {videos.length === 0 ? (
        <div className="text-center py-12 text-[#999999] text-sm">
          Aucune vidéo pour le moment. Ajoutez-en une !
        </div>
      ) : (
        <div className="space-y-4">
          {videos.map(video => {
            const videoType = detectVideoType(video.url)
            const label = getVideoLabel(videoType)
            const tags = video.mots_cles ? video.mots_cles.split(',').map(t => t.trim()) : []

            let thumbnailUrl = ''
            if (videoType === 'youtube') {
              const match = video.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&/?]+)/)
              if (match) thumbnailUrl = `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`
            }

            return (
              <div key={video.id} className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden hover:shadow-sm transition-shadow">
                <div className="flex gap-4 p-5">
                  {thumbnailUrl && (
                    <div className="flex-shrink-0">
                      <img
                        src={thumbnailUrl}
                        alt={video.titre}
                        className="w-32 h-24 rounded-lg object-cover border border-[#E5E5E5]"
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-semibold text-[#0A0A0A] text-sm leading-snug">{video.titre}</h3>
                      <button
                        onClick={() => deleteVideo(video.id)}
                        className="flex-shrink-0 text-[#CCCCCC] hover:text-red-500 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                        videoType === 'youtube' ? 'bg-red-50 text-red-600 border-red-200' :
                        videoType === 'vimeo' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                        'bg-pink-50 text-pink-600 border-pink-200'
                      }`}>
                        {label}
                      </span>
                    </div>

                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {tags.map(tag => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 bg-[#F5F5F5] text-[#666666] rounded-full border border-[#E5E5E5]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-5 py-2 bg-[#FAFAFA] border-t border-[#E5E5E5] text-xs text-[#999999] truncate">
                  {video.url}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
