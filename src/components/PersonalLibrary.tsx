import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { detectVideoType, getVideoLabel, getThumbnailUrl, getEmbedUrl } from '../lib/video'

type Parcours = 'shiai' | 'judo-ka' | 'kyu'
type ContentType = 'video' | 'article' | 'pdf'

interface Video {
  id: string
  title: string
  video_url: string
  tags: string | null
}

interface RawCatalogueItem {
  id: string
  titre: string
  type: ContentType
  parcours: Parcours
  url: string | null
  contenu: string | null
  tags: string[] | null
}

interface ContentItem {
  id: string
  titre: string
  type: ContentType
  url?: string | null
  contenu?: string | null
  tags: string[]
  source: 'hazumi' | 'perso'
  parcours: Parcours
}

interface PlaylistCollection {
  id: string
  nom: string
  tags: string[]
}

function normalizeTag(tag: string): string {
  return tag
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function splitTags(tags: string | null): string[] {
  return tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []
}

function videoToItem(v: Video, parcours: Parcours): ContentItem {
  return {
    id: v.id,
    titre: v.title,
    type: 'video',
    url: v.video_url,
    tags: splitTags(v.tags),
    source: 'perso',
    parcours,
  }
}

function catalogueToItem(c: RawCatalogueItem): ContentItem {
  return {
    id: c.id,
    titre: c.titre,
    type: c.type,
    url: c.url,
    contenu: c.contenu,
    tags: c.tags ?? [],
    source: 'hazumi',
    parcours: c.parcours,
  }
}

interface PersonalLibraryProps {
  parcours: Parcours
  titre: string
  icone: string
  description: string
}

export default function PersonalLibrary({
  parcours,
  titre,
  icone,
  description,
}: PersonalLibraryProps) {
  const [videos, setVideos] = useState<Video[]>([])
  const [catalogueItems, setCatalogueItems] = useState<RawCatalogueItem[]>([])
  const [playlists, setPlaylists] = useState<PlaylistCollection[]>([])
  const [judokaId, setJudokaId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [addFormData, setAddFormData] = useState({ titre: '', url: '', mots_cles: '' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState({ titre: '', url: '', mots_cles: '' })
  const [error, setError] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null)
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false)
  const [playlistSelectedTags, setPlaylistSelectedTags] = useState<string[]>([])
  const [playlistName, setPlaylistName] = useState('')
  const quickAddRef = useRef<HTMLDivElement>(null)
  const [playingVideoUrl, setPlayingVideoUrl] = useState<string | null>(null)
  const [articleOpen, setArticleOpen] = useState<ContentItem | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data: judoka } = await supabase.from('judokas').select('id').eq('user_id', user.id).single()
      if (judoka) {
        setJudokaId(judoka.id)
        await loadVideos(user.id)
        await loadPlaylists(judoka.id)
        await loadCatalogue()
      }
      setLoading(false)
    }
    load()
  }, [parcours])

  function playVideoUrl(url: string) {
    const videoType = detectVideoType(url)
    if (videoType === 'youtube' || videoType === 'vimeo') {
      setPlayingVideoUrl(url)
    } else {
      window.open(url, '_blank')
    }
  }

  async function loadVideos(uid: string) {
    const { data } = await supabase
      .from('videos')
      .select('id, title, video_url, tags')
      .eq('uploaded_by', uid)
      .eq('parcours', parcours)
      .order('created_at', { ascending: false })
    if (data) {
      setVideos(data)
    }
  }

  async function loadCatalogue() {
    const { data } = await supabase
      .from('catalogue_hazumi')
      .select('*')
      .eq('parcours', parcours)
      .order('created_at', { ascending: false })
    setCatalogueItems((data as RawCatalogueItem[]) ?? [])
  }

  function getCombinedTags(): string[] {
    const tagMap = new Map<string, string>()
    const registerTags = (tags: string[]) => {
      tags.forEach(t => {
        const trimmed = t.trim()
        if (!trimmed) return
        const normalized = normalizeTag(trimmed)
        if (!tagMap.has(normalized)) tagMap.set(normalized, trimmed)
      })
    }
    videos.forEach(v => registerTags(splitTags(v.tags)))
    catalogueItems.forEach(c => registerTags(c.tags ?? []))
    return Array.from(tagMap.values()).sort()
  }

  async function loadPlaylists(jid: string) {
    const { data } = await supabase
      .from('playlists_collections')
      .select('id, nom, tags')
      .eq('judoka_id', jid)
      .eq('parcours', parcours)
      .order('created_at', { ascending: false })
    if (data) {
      setPlaylists(data)
    }
  }

  async function createPlaylist() {
    if (!judokaId || !playlistName) {
      setError('Nom de playlist requis')
      return
    }
    setSaving(true)
    setError(null)

    const tagsToUse = playlistSelectedTags.length > 0
      ? playlistSelectedTags
      : playlistName.split(',').map(t => t.trim()).filter(t => t.length > 0)

    if (tagsToUse.length === 0) {
      setError('Au moins un tag requis')
      setSaving(false)
      return
    }

    const { error: err } = await supabase.from('playlists_collections').insert({
      judoka_id: judokaId,
      nom: playlistName,
      tags: tagsToUse,
      parcours,
    })

    if (err) {
      setError(`Erreur: ${err.message || 'Impossible de créer'}`)
    } else {
      setPlaylistModalOpen(false)
      setPlaylistSelectedTags([])
      setPlaylistName('')
      await loadPlaylists(judokaId)
    }
    setSaving(false)
  }

  async function deletePlaylist(playlistId: string) {
    if (!window.confirm('Supprimer cette playlist ?')) return
    await supabase.from('playlists_collections').delete().eq('id', playlistId)
    setPlaylists(prev => prev.filter(p => p.id !== playlistId))
    if (selectedPlaylistId === playlistId) setSelectedPlaylistId(null)
  }

  function getFilteredItems(items: ContentItem[]): ContentItem[] {
    if (selectedPlaylistId) {
      const playlist = playlists.find(p => p.id === selectedPlaylistId)
      if (!playlist) return items
      const normalizedPlaylistTags = playlist.tags.map(normalizeTag)
      return items.filter(item =>
        item.tags.some(t => normalizedPlaylistTags.includes(normalizeTag(t)))
      )
    }
    if (!selectedTag) return items
    const normalizedSelected = normalizeTag(selectedTag)
    return items.filter(item => item.tags.some(t => normalizeTag(t) === normalizedSelected))
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
      parcours,
    })

    if (err) {
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

  function renderThumbnail(item: ContentItem) {
    if (item.type === 'video' && item.url) {
      const thumb = getThumbnailUrl(item.url)
      return (
        <div
          className="flex-shrink-0 w-20 h-15 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => playVideoUrl(item.url!)}
        >
          {thumb ? (
            <img
              src={thumb}
              alt={item.titre}
              className="w-full h-full rounded object-cover border border-[#E5E5E5]"
              onError={e => e.currentTarget.style.display = 'none'}
            />
          ) : (
            <div className="w-full h-full rounded bg-[#0A0A0A] flex items-center justify-center">
              <span className="text-white text-[8px] text-center px-1">{getVideoLabel(detectVideoType(item.url))}</span>
            </div>
          )}
        </div>
      )
    }
    if (item.type === 'pdf') {
      return (
        <div className="flex-shrink-0 w-20 h-15 rounded bg-red-50 border border-red-200 flex items-center justify-center">
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      )
    }
    return (
      <div className="flex-shrink-0 w-20 h-15 rounded bg-[#F0F0F0] border border-[#E5E5E5] flex items-center justify-center">
        <svg className="w-6 h-6 text-[#999999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      </div>
    )
  }

  function renderBadge(item: ContentItem) {
    if (item.type === 'video' && item.url) {
      const videoType = detectVideoType(item.url)
      const label = getVideoLabel(videoType)
      const cls =
        videoType === 'youtube' ? 'bg-red-50 text-red-600 border-red-200' :
        videoType === 'vimeo' ? 'bg-blue-50 text-blue-600 border-blue-200' :
        videoType === 'instagram' ? 'bg-pink-50 text-pink-600 border-pink-200' :
        videoType === 'gdrive' ? 'bg-green-50 text-green-600 border-green-200' :
        videoType === 'facebook' ? 'bg-blue-100 text-blue-700 border-blue-300' :
        'bg-[#F5F5F5] text-[#666666] border-[#E5E5E5]'
      return <span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium ${cls}`}>{label}</span>
    }
    if (item.type === 'pdf') {
      return <span className="text-[9px] px-1.5 py-0.5 rounded border font-medium bg-red-50 text-red-600 border-red-200">PDF</span>
    }
    return <span className="text-[9px] px-1.5 py-0.5 rounded border font-medium bg-[#F5F5F5] text-[#666666] border-[#E5E5E5]">Article</span>
  }

  function renderHazumiAction(item: ContentItem) {
    if (item.type === 'video') {
      return (
        <button
          onClick={() => item.url && playVideoUrl(item.url)}
          className="text-[#999999] hover:text-[#0A0A0A] transition-colors p-1 text-xs font-semibold"
        >
          Voir
        </button>
      )
    }
    if (item.type === 'pdf') {
      return (
        <a
          href={item.url ?? '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#999999] hover:text-[#0A0A0A] transition-colors p-1 text-xs font-semibold"
        >
          Voir
        </a>
      )
    }
    return (
      <button
        onClick={() => setArticleOpen(item)}
        className="text-[#999999] hover:text-[#0A0A0A] transition-colors p-1 text-xs font-semibold"
      >
        Lire
      </button>
    )
  }

  function renderItemRow(item: ContentItem) {
    return (
      <div key={item.id} className="bg-white rounded-lg border border-[#E5E5E5] p-3 flex gap-3 items-center hover:shadow-sm transition-shadow">
        {renderThumbnail(item)}

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-[#0A0A0A] text-sm leading-snug line-clamp-1">{item.titre}</h3>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {renderBadge(item)}
            {item.tags.map(tag => (
              <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-[#F5F5F5] text-[#666666] rounded border border-[#E5E5E5]">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex-shrink-0 flex gap-1">
          {renderHazumiAction(item)}
        </div>
      </div>
    )
  }

  if (loading) return <div className="text-center py-16 text-[#999999] text-sm">Chargement…</div>

  const combinedTags = getCombinedTags()
  const hazumiItems = catalogueItems.map(catalogueToItem)
  const persoItems = videos.map(v => videoToItem(v, parcours))
  const filteredHazumi = getFilteredItems(hazumiItems)
  const filteredPersoItems = getFilteredItems(persoItems)
  const filteredPersoIds = new Set(filteredPersoItems.map(i => i.id))
  const filteredVideos = videos.filter(v => filteredPersoIds.has(v.id))

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl sm:text-3xl font-bold" style={{ color: '#C41230' }}>{icone}</span>
          <div>
            <h1 className="text-3xl font-bold text-[#0A0A0A] tracking-tight">{titre}</h1>
            <p className="text-[#666666] text-sm">{description}</p>
          </div>
        </div>
      </div>

      {hazumiItems.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-[#0A0A0A] mb-3">Contenu Hazumi</h2>
          <div className="space-y-2">
            {filteredHazumi.map(item => renderItemRow(item))}
          </div>
        </div>
      )}

      <h2 className="text-lg font-bold text-[#0A0A0A] mb-3">Ma bibliothèque</h2>

      {/* Bouton + Filtres en 2 lignes */}
      {combinedTags.length > 0 && (
        <div className="mb-4 space-y-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPlaylistModalOpen(true)}
              className="text-xs px-4 py-2.5 rounded-lg font-semibold bg-[#C41230] hover:bg-[#9B0E25] text-white transition-colors whitespace-nowrap"
            >
              Créer une playlist
            </button>
          </div>

          {/* Ligne 1 — Playlists */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setSelectedTag(null); setSelectedPlaylistId(null) }}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                selectedTag === null && selectedPlaylistId === null
                  ? 'bg-[#C41230] text-white'
                  : 'bg-[#F5F5F5] text-[#666666] hover:bg-[#EEEEEE]'
              }`}
            >
              Tous
            </button>
            {playlists.map(playlist => (
              <button
                key={playlist.id}
                onClick={() => { setSelectedPlaylistId(playlist.id); setSelectedTag(null) }}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors group relative ${
                  selectedPlaylistId === playlist.id
                    ? 'bg-[#C41230] text-white'
                    : 'bg-[#F5F5F5] text-[#666666] hover:bg-[#EEEEEE]'
                }`}
              >
                🎬 {playlist.nom}
                <button
                  onClick={e => { e.stopPropagation(); deletePlaylist(playlist.id) }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-[#CCCCCC] hover:text-red-500 transition-colors"
                >
                  ✕
                </button>
              </button>
            ))}
          </div>

          {/* Ligne 2 — Tags individuels */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-[#999999] font-medium">Tags :</span>
            {combinedTags.map(tag => (
              <button
                key={tag}
                onClick={() => { setSelectedTag(tag); setSelectedPlaylistId(null) }}
                className={`text-[10px] px-2.5 py-1 rounded-full font-medium transition-colors border ${
                  selectedTag === tag && selectedPlaylistId === null
                    ? 'border-[#666666] text-[#0A0A0A] bg-white'
                    : 'border-[#DDDDDD] text-[#666666] bg-white hover:border-[#CCCCCC]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <button
            onClick={() => quickAddRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="mt-3 px-4 py-2.5 rounded-lg text-sm font-semibold bg-[#C41230] hover:bg-[#9B0E25] text-white transition-colors"
          >
            + Ajouter du contenu
          </button>
        </div>
      )}

      {/* Modale création playlist */}
      {playlistModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-[#0A0A0A] mb-4">Créer une playlist</h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#666666] mb-2 block">Option 1 : Sélectionner les tags existants</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {combinedTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        setPlaylistSelectedTags(prev =>
                          prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                        )
                        if (!playlistName) {
                          setPlaylistName(
                            playlistSelectedTags.includes(tag)
                              ? playlistSelectedTags.filter(t => t !== tag).join(' + ')
                              : [...playlistSelectedTags, tag].join(' + ')
                          )
                        }
                      }}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                        playlistSelectedTags.includes(tag)
                          ? 'bg-[#C41230] text-white'
                          : 'bg-[#F5F5F5] text-[#666666] hover:bg-[#EEEEEE]'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-[#666666] mb-1 block">Option 2 : Taper librement des mots-clés</label>
                <input
                  type="text"
                  value={playlistName}
                  onChange={e => {
                    setPlaylistName(e.target.value)
                    setPlaylistSelectedTags([])
                  }}
                  placeholder="Ex: Tachi Waza, Uchimata, entraînement"
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:border-[#C41230]"
                />
                <p className="text-[10px] text-[#999999] mt-1">Séparer les mots-clés par des virgules</p>
              </div>

              {error && <p className="text-xs text-red-600">{error}</p>}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setPlaylistModalOpen(false)
                    setPlaylistSelectedTags([])
                    setPlaylistName('')
                    setError(null)
                  }}
                  className="flex-1 px-3 py-2 border border-[#E5E5E5] text-[#666666] text-sm font-medium rounded-lg hover:bg-[#FAFAFA] transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={createPlaylist}
                  disabled={saving}
                  className="flex-1 bg-[#C41230] hover:bg-[#9B0E25] disabled:bg-[#CCCCCC] text-white text-sm font-semibold px-3 py-2 rounded-lg transition-colors"
                >
                  {saving ? 'Création…' : 'Créer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Barre d'ajout rapide inline */}
      <div ref={quickAddRef} className="bg-[#FAFAFA] rounded-lg border border-[#E5E5E5] p-3 flex gap-3 items-center mb-2">
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

      {error && <p className="text-xs text-red-600 px-2 mt-2">{error}</p>}

      {videos.length === 0 ? (
        <div className="text-center py-16 text-[#999999] text-sm">
          Aucune vidéo pour le moment. Ajoutez-en une ci-dessus.
        </div>
      ) : (
        <div className="space-y-2">
          {filteredVideos.map(video => {
            const isEditing = editingId === video.id
            const videoType = detectVideoType(video.video_url)
            const label = getVideoLabel(videoType)
            const tags = splitTags(video.tags)
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
                  <div className="flex-shrink-0 w-20 h-15 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => playVideoUrl(video.video_url)}>
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

      {playingVideoUrl && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.8)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          boxSizing: 'border-box'
        }} onClick={() => setPlayingVideoUrl(null)}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '768px',
            overflow: 'hidden',
            boxShadow: '0 20px 25px rgba(0,0,0,0.3)'
          }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#E5E5E5]">
              <h2 className="text-base sm:text-lg font-semibold text-[#0A0A0A]">Lecteur vidéo</h2>
              <button
                onClick={() => setPlayingVideoUrl(null)}
                className="text-[#999999] hover:text-[#0A0A0A] text-xl sm:text-base"
              >
                ✕
              </button>
            </div>
            <div style={{
              position: 'relative',
              paddingBottom: '56.25%',
              height: 0,
              backgroundColor: '#000000'
            }}>
              {(() => {
                const embedUrl = getEmbedUrl(playingVideoUrl)
                const videoType = detectVideoType(playingVideoUrl)
                if (videoType === 'youtube' || videoType === 'vimeo') {
                  return (
                    <iframe
                      src={embedUrl}
                      title="Vidéo"
                      allowFullScreen
                      style={{
                        position: 'absolute',
                        top: 0, left: 0,
                        width: '100%', height: '100%',
                        border: 'none'
                      }}
                    />
                  )
                }
                return <p className="text-white text-center text-sm px-4" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Ouverture dans un nouvel onglet...</p>
              })()}
            </div>
          </div>
        </div>
      )}

      {articleOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setArticleOpen(null)}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-[#0A0A0A] mb-3">{articleOpen.titre}</h2>
            <p className="text-sm text-[#333333] whitespace-pre-wrap">{articleOpen.contenu}</p>
          </div>
        </div>
      )}
    </div>
  )
}
