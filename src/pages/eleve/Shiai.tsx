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
  console.log('[Shiai] composant chargé - version 4')

  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ url: '', titre: '', mots_cles: '' })
  const [error, setError] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

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

  function getAllTags(): string[] {
    const allTags = new Set<string>()
    videos.forEach(v => {
      if (v.tags) {
        v.tags.split(',').forEach(t => allTags.add(t.trim()))
      }
    })
    return Array.from(allTags).sort()
  }

  function getFilteredVideos(): Video[] {
    if (!selectedTag) return videos
    return videos.filter(v => v.tags?.split(',').map(t => t.trim()).includes(selectedTag))
  }

  function openAddModal() {
    setEditingId(null)
    setFormData({ url: '', titre: '', mots_cles: '' })
    setError(null)
    setModalOpen(true)
  }

  function openEditModal(video: Video) {
    setEditingId(video.id)
    setFormData({ url: video.video_url, titre: video.title, mots_cles: video.tags || '' })
    setError(null)
    setModalOpen(true)
  }

  async function saveVideo() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !formData.url || !formData.titre) {
      setError('URL et nom sont obligatoires')
      return
    }
    setSaving(true)
    setError(null)

    const videoType = detectVideoType(formData.url)
    if (!['youtube', 'vimeo', 'instagram', 'gdrive', 'facebook', 'tiktok', 'direct'].includes(videoType)) {
      setError('URL non supportée')
      setSaving(false)
      return
    }

    if (editingId) {
      const { error: err } = await supabase.from('videos').update({
        title: formData.titre,
        video_url: formData.url,
        tags: formData.mots_cles || null,
      }).eq('id', editingId)

      if (err) {
        console.error('[Shiai] erreur édition:', JSON.stringify(err))
        setError(`Erreur: ${err.message || 'Impossible de modifier'}`)
      } else {
        setFormData({ url: '', titre: '', mots_cles: '' })
        setModalOpen(false)
        await loadVideos(user.id)
      }
    } else {
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
        console.error('[Shiai] erreur ajout:', JSON.stringify(err))
        setError(`Erreur: ${err.message || 'Impossible d\'ajouter'}`)
      } else {
        setFormData({ url: '', titre: '', mots_cles: '' })
        setModalOpen(false)
        await loadVideos(user.id)
      }
    }
    setSaving(false)
  }

  async function deleteVideo(videoId: string) {
    if (!window.confirm('Supprimer cette vidéo ?')) return
    await supabase.from('videos').delete().eq('id', videoId)
    setVideos(prev => prev.filter(v => v.id !== videoId))
  }

  if (loading) return <div className="text-center py-16 text-[#999999] text-sm">Chargement…</div>

  const allTags = getAllTags()
  const filteredVideos = getFilteredVideos()

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="8" r="3.5" fill="#0A0A0A" />
            <circle cx="30" cy="8" r="3.5" fill="#C41230" />
            <rect x="5" y="12" width="10" height="8" rx="1.5" fill="#0A0A0A" />
            <rect x="25" y="12" width="10" height="8" rx="1.5" fill="#C41230" />
            <line x1="10" y1="20" x2="6" y2="30" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" />
            <line x1="10" y1="20" x2="14" y2="32" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" />
            <line x1="30" y1="20" x2="34" y2="30" stroke="#C41230" strokeWidth="2" strokeLinecap="round" />
            <line x1="30" y1="20" x2="26" y2="32" stroke="#C41230" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 20 Q20 18 28 20" stroke="#999999" strokeWidth="1.5" strokeDasharray="2,2" opacity="0.5" />
          </svg>
          <div>
            <h1 className="text-3xl font-bold text-[#0A0A0A] tracking-tight mb-1">Shiai</h1>
            <p className="text-[#666666] text-sm">Mes vidéos de judo — techniques, combats, conseils</p>
          </div>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-[#C41230] hover:bg-[#9B0E25] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          + Ajouter
        </button>
      </div>

      {/* Modale d'ajout/édition */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#0A0A0A]">{editingId ? 'Modifier' : 'Ajouter'} une vidéo</h2>
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
                  onClick={saveVideo}
                  disabled={saving}
                  className="flex-1 bg-[#C41230] hover:bg-[#9B0E25] disabled:bg-[#CCCCCC] text-white text-sm font-semibold px-3 py-2 rounded-lg transition-colors"
                >
                  {saving ? 'Enregistrement…' : editingId ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtres tags */}
      {allTags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTag(null)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              selectedTag === null
                ? 'bg-[#C41230] text-white'
                : 'bg-[#F5F5F5] text-[#666666] hover:bg-[#EEEEEE]'
            }`}
          >
            Tous
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                selectedTag === tag
                  ? 'bg-[#C41230] text-white'
                  : 'bg-[#F5F5F5] text-[#666666] hover:bg-[#EEEEEE]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Liste des vidéos */}
      {videos.length === 0 ? (
        <div className="text-center py-16 text-[#999999] text-sm">
          Aucune vidéo pour le moment.
        </div>
      ) : (
        <div className="space-y-2">
          <button
            onClick={openAddModal}
            className="w-full p-3 rounded-lg border-2 border-dashed border-[#E5E5E5] hover:border-[#C41230] text-[#999999] hover:text-[#C41230] text-sm transition-colors mb-3"
          >
            + Ajouter une vidéo rapidement
          </button>

          {filteredVideos.map(video => {
            const videoType = detectVideoType(video.video_url)
            const label = getVideoLabel(videoType)
            const tags = video.tags ? video.tags.split(',').map(t => t.trim()) : []
            const thumbnailUrl = getThumbnailUrl(video.video_url)

            return (
              <div key={video.id} className="bg-white rounded-lg border border-[#E5E5E5] p-3 flex gap-3 items-center hover:shadow-sm transition-shadow">
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

                <div className="flex-shrink-0 flex gap-1">
                  <button
                    onClick={() => openEditModal(video)}
                    className="text-[#999999] hover:text-[#0A0A0A] transition-colors p-1"
                    title="Modifier"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteVideo(video.id)}
                    className="text-[#999999] hover:text-red-500 transition-colors p-1"
                    title="Supprimer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
