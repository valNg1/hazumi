import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { detectVideoType, getVideoLabel, getThumbnailUrl } from '../../lib/video'

interface Video {
  id: string
  title: string
  video_url: string
  tags: string | null
}

export default function Shiai() {
  console.log('[Shiai] composant chargé - version 3')

  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState({ url: '', titre: '', mots_cles: '' })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      await loadVideos(user.id)
      setLoading(false)
    }
    load()
  }, [])

  async function loadVideos(uid: string) {
    const { data } = await supabase
      .from('videos')
      .select('id, title, video_url, tags')
      .eq('uploaded_by', uid)
      .order('created_at', { ascending: false })
    if (data) {
      setVideos(data)
    }
  }

  async function addVideo() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !formData.url || !formData.titre) {
      setError('URL et nom sont obligatoires')
      return
    }
    setAdding(true)
    setError(null)

    const videoType = detectVideoType(formData.url)
    if (!['youtube', 'vimeo', 'instagram', 'gdrive', 'facebook', 'tiktok', 'direct'].includes(videoType)) {
      setError('URL non supportée')
      setAdding(false)
      return
    }

    const { error: err } = await supabase.from('videos').insert({
      title: formData.titre,
      video_url: formData.url,
      tags: formData.mots_cles || null,
      uploaded_by: user.id,
      description: '',
      belt: '',
      technique_key: '',
    })

    if (err) {
      console.error('[Shiai] erreur:', JSON.stringify(err))
      setError(`Erreur: ${err.message || 'Impossible d\'ajouter la vidéo'}`)
    } else {
      setFormData({ url: '', titre: '', mots_cles: '' })
      setModalOpen(false)
      await loadVideos(user.id)
    }
    setAdding(false)
  }

  async function deleteVideo(videoId: string) {
    if (!window.confirm('Supprimer cette vidéo ?')) return
    await supabase.from('videos').delete().eq('id', videoId)
    setVideos(prev => prev.filter(v => v.id !== videoId))
  }

  if (loading) return <div className="text-center py-16 text-[#999999] text-sm">Chargement…</div>

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0A0A0A] tracking-tight mb-1">🥊 Shiai</h1>
          <p className="text-[#666666] text-sm">Mes vidéos de judo — techniques, combats, conseils</p>
        </div>
        <button
          onClick={() => { setModalOpen(true); setError(null) }}
          className="flex items-center gap-2 bg-[#C41230] hover:bg-[#9B0E25] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter une vidéo
        </button>
      </div>

      {/* Modale d'ajout */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#0A0A0A]">Ajouter une vidéo</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-[#CCCCCC] hover:text-[#666666] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#666666] mb-1 block">URL</label>
                <input
                  type="text"
                  value={formData.url}
                  onChange={e => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:border-[#C41230]"
                />
              </div>

              <div>
                <label className="text-xs text-[#666666] mb-1 block">Nom de la vidéo</label>
                <input
                  type="text"
                  value={formData.titre}
                  onChange={e => setFormData({ ...formData, titre: e.target.value })}
                  placeholder="Ex: O goshi sur judoka grand"
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:border-[#C41230]"
                />
              </div>

              <div>
                <label className="text-xs text-[#666666] mb-1 block">Mots-clés (optionnel)</label>
                <input
                  type="text"
                  value={formData.mots_cles}
                  onChange={e => setFormData({ ...formData, mots_cles: e.target.value })}
                  placeholder="o goshi, judo, technique"
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:border-[#C41230]"
                />
              </div>

              {error && <p className="text-xs text-red-600">{error}</p>}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-3 py-2 border border-[#E5E5E5] text-[#666666] text-sm font-medium rounded-lg hover:bg-[#FAFAFA] transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={addVideo}
                  disabled={adding}
                  className="flex-1 bg-[#C41230] hover:bg-[#9B0E25] disabled:bg-[#CCCCCC] text-white text-sm font-semibold px-3 py-2 rounded-lg transition-colors"
                >
                  {adding ? 'Ajout…' : 'Ajouter'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Liste des vidéos */}
      {videos.length === 0 ? (
        <div className="text-center py-16 text-[#999999] text-sm">
          Aucune vidéo pour le moment.
        </div>
      ) : (
        <div className="space-y-2">
          {videos.map(video => {
            const videoType = detectVideoType(video.video_url)
            const label = getVideoLabel(videoType)
            const tags = video.tags ? video.tags.split(',').map(t => t.trim()) : []
            const thumbnailUrl = getThumbnailUrl(video.video_url)

            return (
              <div key={video.id} className="bg-white rounded-lg border border-[#E5E5E5] p-3 flex gap-3 items-center hover:shadow-sm transition-shadow group">
                {thumbnailUrl && (
                  <div className="flex-shrink-0 w-20 h-15">
                    <img
                      src={thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full rounded object-cover border border-[#E5E5E5]"
                      onError={e => e.currentTarget.style.display = 'none'}
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-[#0A0A0A] text-sm leading-snug line-clamp-1">{video.title}</h3>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium ${
                      videoType === 'youtube' ? 'bg-red-50 text-red-600 border-red-200' :
                      videoType === 'vimeo' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                      videoType === 'instagram' ? 'bg-pink-50 text-pink-600 border-pink-200' :
                      videoType === 'gdrive' ? 'bg-green-50 text-green-600 border-green-200' :
                      videoType === 'facebook' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                      'bg-[#F5F5F5] text-[#666666] border-[#E5E5E5]'
                    }`}>
                      {label}
                    </span>
                    {tags.length > 0 && tags.slice(0, 1).map(tag => (
                      <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-[#F5F5F5] text-[#666666] rounded border border-[#E5E5E5]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => deleteVideo(video.id)}
                  className="flex-shrink-0 text-[#CCCCCC] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  title="Supprimer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
