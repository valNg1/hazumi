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
  console.log('[Shiai] composant chargé - version 5 (édition inline)')

  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [addFormData, setAddFormData] = useState({ titre: '', url: '', mots_cles: '' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState({ titre: '', url: '', mots_cles: '' })
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

  async function addVideo() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !addFormData.url || !addFormData.titre) {
      setError('Titre et URL sont obligatoires')
      return
    }
    setSaving(true)
    setError(null)

    const videoType = detectVideoType(addFormData.url)
    if (!['youtube', 'vimeo', 'instagram', 'gdrive', 'facebook', 'tiktok', 'direct'].includes(videoType)) {
      setError('URL non supportée')
      setSaving(false)
      return
    }

    const { error: err } = await supabase.from('videos').insert({
      title: addFormData.titre,
      video_url: addFormData.url,
      tags: addFormData.mots_cles || null,
      uploaded_by: user.id,
      description: '',
      belt: '',
      technique_key: '',
    })

    if (err) {
      console.error('[Shiai] erreur ajout:', JSON.stringify(err))
      setError(`Erreur: ${err.message || 'Impossible d\'ajouter'}`)
    } else {
      setAddFormData({ titre: '', url: '', mots_cles: '' })
      await loadVideos(user.id)
    }
    setSaving(false)
  }

  function startEdit(video: Video) {
    setEditingId(video.id)
    setEditFormData({ titre: video.title, url: video.video_url, mots_cles: video.tags || '' })
  }

  async function saveEdit() {
    if (!editFormData.url || !editFormData.titre) {
      setError('Titre et URL sont obligatoires')
      return
    }
    setSaving(true)
    setError(null)

    const videoType = detectVideoType(editFormData.url)
    if (!['youtube', 'vimeo', 'instagram', 'gdrive', 'facebook', 'tiktok', 'direct'].includes(videoType)) {
      setError('URL non supportée')
      setSaving(false)
      return
    }

    const { error: err } = await supabase.from('videos').update({
      title: editFormData.titre,
      video_url: editFormData.url,
      tags: editFormData.mots_cles || null,
    }).eq('id', editingId)

    if (err) {
      console.error('[Shiai] erreur édition:', JSON.stringify(err))
      setError(`Erreur: ${err.message || 'Impossible de modifier'}`)
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) await loadVideos(user.id)
      setEditingId(null)
    }
    setSaving(false)
  }

  function cancelEdit() {
    setEditingId(null)
    setError(null)
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
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
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
            <h1 className="text-3xl font-bold text-[#0A0A0A] tracking-tight">Shiai</h1>
            <p className="text-[#666666] text-sm">Mes vidéos de judo — techniques, combats, conseils</p>
          </div>
        </div>
      </div>

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
          Aucune vidéo pour le moment. Ajoutez-en une ci-dessous.
        </div>
      ) : (
        <div className="space-y-2">
          {/* Barre d'ajout rapide inline */}
          <div className="bg-[#FAFAFA] rounded-lg border border-[#E5E5E5] p-3 flex gap-3 items-center">
            <div className="flex-shrink-0 w-20 h-15 rounded bg-[#F0F0F0] border border-[#E5E5E5]" />

            <input
              type="text"
              value={addFormData.titre}
              onChange={e => setAddFormData({ ...addFormData, titre: e.target.value })}
              placeholder="Titre"
              className="flex-1 px-2 py-1.5 text-sm border border-[#E5E5E5] rounded bg-white focus:outline-none focus:border-[#C41230]"
            />

            <input
              type="text"
              value={addFormData.url}
              onChange={e => setAddFormData({ ...addFormData, url: e.target.value })}
              placeholder="URL"
              className="flex-1 px-2 py-1.5 text-sm border border-[#E5E5E5] rounded bg-white focus:outline-none focus:border-[#C41230]"
            />

            <input
              type="text"
              value={addFormData.mots_cles}
              onChange={e => setAddFormData({ ...addFormData, mots_cles: e.target.value })}
              placeholder="Mots-clés"
              className="flex-1 px-2 py-1.5 text-sm border border-[#E5E5E5] rounded bg-white focus:outline-none focus:border-[#C41230]"
            />

            <button
              onClick={addVideo}
              disabled={saving}
              className="flex-shrink-0 bg-[#C41230] hover:bg-[#9B0E25] disabled:bg-[#CCCCCC] text-white px-3 py-1.5 rounded text-sm font-semibold transition-colors"
            >
              ✓
            </button>
          </div>

          {error && <p className="text-xs text-red-600 px-2">{error}</p>}

          {/* Vidéos */}
          {filteredVideos.map(video => {
            const isEditing = editingId === video.id
            const videoType = detectVideoType(video.video_url)
            const label = getVideoLabel(videoType)
            const tags = video.tags ? video.tags.split(',').map(t => t.trim()) : []
            const thumbnailUrl = getThumbnailUrl(video.video_url)

            if (isEditing) {
              return (
                <div key={video.id} className="bg-white rounded-lg border-2 border-[#C41230] p-3 flex gap-3 items-center">
                  <div className="flex-shrink-0 w-20 h-15 rounded bg-[#F0F0F0] border border-[#E5E5E5]" />

                  <input
                    type="text"
                    value={editFormData.titre}
                    onChange={e => setEditFormData({ ...editFormData, titre: e.target.value })}
                    className="flex-1 px-2 py-1.5 text-sm border border-[#E5E5E5] rounded focus:outline-none focus:border-[#C41230]"
                  />

                  <input
                    type="text"
                    value={editFormData.url}
                    onChange={e => setEditFormData({ ...editFormData, url: e.target.value })}
                    className="flex-1 px-2 py-1.5 text-sm border border-[#E5E5E5] rounded focus:outline-none focus:border-[#C41230]"
                  />

                  <input
                    type="text"
                    value={editFormData.mots_cles}
                    onChange={e => setEditFormData({ ...editFormData, mots_cles: e.target.value })}
                    className="flex-1 px-2 py-1.5 text-sm border border-[#E5E5E5] rounded focus:outline-none focus:border-[#C41230]"
                  />

                  <div className="flex-shrink-0 flex gap-1">
                    <button
                      onClick={saveEdit}
                      disabled={saving}
                      className="bg-green-500 hover:bg-green-600 disabled:bg-[#CCCCCC] text-white px-3 py-1.5 rounded text-sm font-semibold transition-colors"
                    >
                      ✓
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="bg-[#CCCCCC] hover:bg-[#999999] text-white px-3 py-1.5 rounded text-sm font-semibold transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )
            }

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
                    {tags.map(tag => (
                      <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-[#F5F5F5] text-[#666666] rounded border border-[#E5E5E5]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex-shrink-0 flex gap-1">
                  <button
                    onClick={() => startEdit(video)}
                    className="text-[#999999] hover:text-[#0A0A0A] transition-colors p-1 text-xs font-semibold"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => deleteVideo(video.id)}
                    className="text-[#999999] hover:text-red-500 transition-colors p-1 text-xs font-semibold"
                  >
                    Supprimer
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
