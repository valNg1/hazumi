import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { detectVideoType, getEmbedUrl, getVideoLabel, getThumbnailUrl } from '../../lib/video'

interface Playlist {
  id: string
  name: string
  created_at: string
  item_count?: number
  cover_thumbs?: (string | null)[]
}

interface PlaylistItem {
  id: string
  playlist_id: string
  position: number
  video_id: string | null
  external_url: string | null
  external_title: string | null
  video?: ClubVideo | null
}

interface ClubVideo {
  id: string
  title: string
  description: string | null
  video_url: string
  belt: string | null
  technique_key: string | null
  tags: string | null
}

const SOURCE_BADGE: Record<string, string> = {
  youtube: 'bg-red-50 text-red-500',
  vimeo: 'bg-blue-50 text-blue-500',
  gdrive: 'bg-green-50 text-green-600',
  direct: 'bg-[#F5F5F5] text-[#999999]',
}

function PlaylistCover({ thumbs, name }: { thumbs: (string | null)[], name: string }) {
  const filled = thumbs.filter(Boolean)
  if (filled.length === 0) {
    return (
      <div className="w-full aspect-square bg-gradient-to-br from-[#1a1a1a] to-[#C41230] flex items-center justify-center">
        <svg className="w-12 h-12 text-white/40" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="3.5" r="1.5" />
          <path d="M9 7.5c0-.3.2-.5.5-.5h5c.3 0 .5.2.5.5v.1L16.5 11H14l-.5-2h-3L10 11H7.5L9 7.6V7.5z" />
          <path d="M7.5 11l-2 5h2l1-2.5 1.5 1.5v4h2v-4.5l-1.8-1.8L11 11H7.5z" />
          <path d="M16.5 11l2 5h-2l-1-2.5-1.5 1.5v4h-2v-4.5l1.8-1.8L13 11h3.5z" />
        </svg>
      </div>
    )
  }
  if (filled.length === 1) {
    return <img src={filled[0]!} alt={name} className="w-full aspect-square object-cover" />
  }
  const slots = [thumbs[0], thumbs[1], thumbs[2], thumbs[3]]
  return (
    <div className="w-full aspect-square grid grid-cols-2 grid-rows-2">
      {slots.map((t, i) => (
        <div key={i} className="overflow-hidden bg-[#1a1a1a]">
          {t ? <img src={t} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#222]" />}
        </div>
      ))}
    </div>
  )
}

export default function MesPlaylists() {
  const [tab, setTab] = useState<'club' | 'perso'>('club')
  const [judokaId, setJudokaId] = useState<string | null>(null)
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [openPlaylist, setOpenPlaylist] = useState<Playlist | null>(null)
  const [items, setItems] = useState<PlaylistItem[]>([])
  const [loadingItems, setLoadingItems] = useState(false)
  const [showNewPlaylist, setShowNewPlaylist] = useState(false)
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addMode, setAddMode] = useState<'club' | 'externe'>('club')
  const [clubVideos, setClubVideos] = useState<ClubVideo[]>([])
  const [searchClub, setSearchClub] = useState('')
  const [extUrl, setExtUrl] = useState('')
  const [extTitle, setExtTitle] = useState('')
  const [extUrlError, setExtUrlError] = useState<string | null>(null)
  const [addingItem, setAddingItem] = useState(false)
  const [playingItem, setPlayingItem] = useState<PlaylistItem | null>(null)
  const [playingClubVideo, setPlayingClubVideo] = useState<ClubVideo | null>(null)
  const [deletePlaylistId, setDeletePlaylistId] = useState<string | null>(null)
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null)
  const [editName, setEditName] = useState('')
  const [editSaving, setEditSaving] = useState(false)
  const [clubSearch, setClubSearch] = useState('')
  const [clubViewMode, setClubViewMode] = useState<'grid' | 'list'>('list')
  const [playlistViewMode, setPlaylistViewMode] = useState<'grid' | 'list'>('list')
  const [showKeywordModal, setShowKeywordModal] = useState(false)
  const [kwInput, setKwInput] = useState('')
  const [kwResults, setKwResults] = useState<ClubVideo[]>([])
  const [kwName, setKwName] = useState('')
  const [kwCreating, setKwCreating] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: judoka } = await supabase.from('judokas').select('id').eq('user_id', user.id).single()
      if (!judoka) { setLoading(false); return }
      setJudokaId(judoka.id)
      await Promise.all([loadPlaylists(judoka.id), loadClubVideos()])
      setLoading(false)
    }
    load()
  }, [])

  async function loadPlaylists(jid: string) {
    const { data } = await supabase
      .from('playlists')
      .select('id, name, created_at')
      .eq('judoka_id', jid)
      .order('created_at', { ascending: false })
    if (!data) return
    const withMeta = await Promise.all(data.map(async p => {
      const [{ count }, { data: firstItems }] = await Promise.all([
        supabase.from('playlist_items').select('*', { count: 'exact', head: true }).eq('playlist_id', p.id),
        supabase.from('playlist_items').select('video_id, external_url').eq('playlist_id', p.id).order('position').limit(4),
      ])
      const thumbs: (string | null)[] = await Promise.all(
        (firstItems ?? []).map(async item => {
          if (item.video_id) {
            const { data: vid } = await supabase.from('videos').select('video_url').eq('id', item.video_id).single()
            return vid ? getThumbnailUrl(vid.video_url) : null
          }
          return item.external_url ? getThumbnailUrl(item.external_url) : null
        })
      )
      return { ...p, item_count: count ?? 0, cover_thumbs: thumbs }
    }))
    setPlaylists(withMeta)
  }

  async function loadItems(playlistId: string) {
    setLoadingItems(true)
    const { data } = await supabase
      .from('playlist_items')
      .select('id, playlist_id, position, video_id, external_url, external_title')
      .eq('playlist_id', playlistId)
      .order('position')
    if (!data) { setLoadingItems(false); return }
    const itemsWithVideo: PlaylistItem[] = await Promise.all(data.map(async item => {
      if (item.video_id) {
        const { data: vid } = await supabase.from('videos').select('id, title, description, video_url, belt, technique_key, tags').eq('id', item.video_id).single()
        return { ...item, video: vid ?? null }
      }
      return { ...item, video: null }
    }))
    setItems(itemsWithVideo)
    setLoadingItems(false)
  }

  async function openPlaylistView(p: Playlist) {
    setOpenPlaylist(p)
    setPlayingItem(null)
    await loadItems(p.id)
  }

  async function createPlaylist() {
    if (!newName.trim() || !judokaId) return
    setSaving(true)
    await supabase.from('playlists').insert({ judoka_id: judokaId, name: newName.trim() })
    setSaving(false)
    setNewName('')
    setShowNewPlaylist(false)
    await loadPlaylists(judokaId)
  }

  async function deletePlaylist(id: string) {
    await supabase.from('playlists').delete().eq('id', id)
    setDeletePlaylistId(null)
    if (judokaId) await loadPlaylists(judokaId)
    if (openPlaylist?.id === id) setOpenPlaylist(null)
  }

  async function renamePlaylist() {
    if (!editingPlaylist || !editName.trim()) return
    setEditSaving(true)
    await supabase.from('playlists').update({ name: editName.trim() }).eq('id', editingPlaylist.id)
    setEditSaving(false)
    if (openPlaylist?.id === editingPlaylist.id) setOpenPlaylist({ ...openPlaylist, name: editName.trim() })
    setEditingPlaylist(null)
    if (judokaId) await loadPlaylists(judokaId)
  }

  async function loadClubVideos() {
    const { data } = await supabase.from('videos').select('id, title, description, video_url, belt, technique_key, tags').order('created_at', { ascending: false })
    setClubVideos(data ?? [])
  }

  function openAddModal() {
    setAddMode('club')
    setSearchClub('')
    setExtUrl('')
    setExtTitle('')
    setExtUrlError(null)
    setShowAddModal(true)
  }

  async function addClubVideo(video: ClubVideo) {
    if (!openPlaylist) return
    setAddingItem(true)
    const maxPos = items.length > 0 ? Math.max(...items.map(i => i.position)) + 1 : 0
    await supabase.from('playlist_items').insert({ playlist_id: openPlaylist.id, video_id: video.id, position: maxPos })
    setShowAddModal(false)
    await loadItems(openPlaylist.id)
    if (judokaId) await loadPlaylists(judokaId)
    setAddingItem(false)
  }

  async function addExternalVideo() {
    if (!openPlaylist || !extUrl.trim() || !extTitle.trim()) return
    try { new URL(extUrl.trim()) } catch { setExtUrlError('URL invalide'); return }
    setAddingItem(true)
    const maxPos = items.length > 0 ? Math.max(...items.map(i => i.position)) + 1 : 0
    await supabase.from('playlist_items').insert({ playlist_id: openPlaylist.id, external_url: extUrl.trim(), external_title: extTitle.trim(), position: maxPos })
    setShowAddModal(false)
    setExtUrl('')
    setExtTitle('')
    await loadItems(openPlaylist.id)
    if (judokaId) await loadPlaylists(judokaId)
    setAddingItem(false)
  }

  async function removeItem(item: PlaylistItem) {
    await supabase.from('playlist_items').delete().eq('id', item.id)
    if (openPlaylist) await loadItems(openPlaylist.id)
    if (judokaId) await loadPlaylists(judokaId)
    if (playingItem?.id === item.id) setPlayingItem(null)
  }

  function getItemUrl(item: PlaylistItem): string { return item.video?.video_url ?? item.external_url ?? '' }
  function getItemTitle(item: PlaylistItem): string { return item.video?.title ?? item.external_title ?? '' }

  function matchesSearch(v: ClubVideo, q: string) {
    const lq = q.toLowerCase()
    return v.title.toLowerCase().includes(lq) ||
      (v.tags ?? '').toLowerCase().split(',').some(t => t.trim().includes(lq))
  }

  function scanByKeywords(keywords: string): ClubVideo[] {
    const kws = keywords.split(/[,\s]+/).map(k => k.trim().toLowerCase()).filter(Boolean)
    if (!kws.length) return []
    return clubVideos.filter(v => kws.some(k => matchesSearch(v, k)))
  }

  function openKeywordModal() {
    setKwInput('')
    setKwResults([])
    setKwName('')
    setShowKeywordModal(true)
  }

  function handleKwSearch(val: string) {
    setKwInput(val)
    setKwResults(val.trim() ? scanByKeywords(val) : [])
    setKwName(val.trim())
  }

  async function createPlaylistFromKeywords() {
    if (!kwResults.length || !kwName.trim() || !judokaId) return
    setKwCreating(true)
    const { data: pl } = await supabase.from('playlists').insert({ judoka_id: judokaId, name: kwName.trim() }).select('id').single()
    if (pl) {
      await supabase.from('playlist_items').insert(
        kwResults.map((v, i) => ({ playlist_id: pl.id, video_id: v.id, position: i }))
      )
    }
    setKwCreating(false)
    setShowKeywordModal(false)
    await loadPlaylists(judokaId)
  }

  const filteredClub = searchClub.trim()
    ? clubVideos.filter(v => matchesSearch(v, searchClub))
    : clubVideos

  if (loading) return <div className="text-center py-16 text-[#999999] text-sm">Chargement…</div>
  if (!judokaId) return <div className="text-center py-16"><p className="text-[#666666] text-sm">Complétez votre profil pour accéder aux playlists.</p></div>

  // ── Vue playlist ouverte ──────────────────────────────────────────────────
  if (openPlaylist) {
    const url = playingItem ? getItemUrl(playingItem) : null
    const embedUrl = url ? getEmbedUrl(url) : null
    const videoType = url ? detectVideoType(url) : null

    return (
      <div>
        <button onClick={() => { setOpenPlaylist(null); setPlayingItem(null) }}
          className="flex items-center gap-2 text-sm text-[#999999] hover:text-[#0A0A0A] mb-5 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Mes playlists
        </button>

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#0A0A0A]">{openPlaylist.name}</h2>
            <button onClick={() => { setEditingPlaylist(openPlaylist); setEditName(openPlaylist.name) }}
              className="text-[#CCCCCC] hover:text-[#666666] transition-colors" title="Renommer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <span className="text-xs text-[#999999]">· {items.length} vidéo{items.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border border-[#E5E5E5] rounded-lg overflow-hidden">
              <button onClick={() => setPlaylistViewMode('list')} className={`px-3 py-2 transition-colors ${playlistViewMode === 'list' ? 'bg-[#0A0A0A] text-white' : 'text-[#999999] hover:text-[#666666]'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
              </button>
              <button onClick={() => setPlaylistViewMode('grid')} className={`px-3 py-2 transition-colors ${playlistViewMode === 'grid' ? 'bg-[#0A0A0A] text-white' : 'text-[#999999] hover:text-[#666666]'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>
              </button>
            </div>
            <button onClick={openAddModal}
              className="bg-[#C41230] hover:bg-[#9B0E25] text-white text-xs uppercase tracking-widest px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ajouter
            </button>
          </div>
        </div>

        {/* Lecteur */}
        {playingItem && url && (
          <div className="mb-5 bg-[#0A0A0A] rounded-xl overflow-hidden aspect-video">
            {videoType === 'direct'
              ? <video src={url} className="w-full h-full" controls autoPlay />
              : <iframe src={embedUrl ?? ''} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            }
          </div>
        )}

        {loadingItems ? (
          <div className="text-center py-10 text-[#999999] text-sm">Chargement…</div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-[#E5E5E5] rounded-xl">
            <p className="text-[#CCCCCC] text-sm mb-3">Playlist vide</p>
            <button onClick={openAddModal} className="text-xs text-[#C41230] hover:underline">Ajouter une première vidéo</button>
          </div>
        ) : playlistViewMode === 'list' ? (
          <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
            {items.map((item, idx) => {
              const itemUrl = getItemUrl(item)
              const type = itemUrl ? detectVideoType(itemUrl) : 'direct'
              const isPlaying = playingItem?.id === item.id
              const thumb = itemUrl ? getThumbnailUrl(itemUrl) : null
              return (
                <div key={item.id} onClick={() => setPlayingItem(isPlaying ? null : item)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer group transition-colors ${idx > 0 ? 'border-t border-[#F5F5F5]' : ''} ${isPlaying ? 'bg-[#FFF5F7]' : 'hover:bg-[#FAFAFA]'}`}>
                  <span className="text-xs text-[#CCCCCC] font-mono w-5 flex-shrink-0">{idx + 1}</span>
                  <div className="w-16 h-10 rounded-lg overflow-hidden bg-[#0A0A0A] flex-shrink-0">
                    {thumb ? <img src={thumb} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] flex items-center justify-center">
                          <svg className="w-4 h-4 text-white/30" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        </div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isPlaying ? 'text-[#C41230]' : 'text-[#0A0A0A]'}`}>{getItemTitle(item)}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${SOURCE_BADGE[type]}`}>{getVideoLabel(itemUrl)}</span>
                  </div>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${isPlaying ? 'bg-[#C41230]' : 'bg-[#F5F5F5] group-hover:bg-[#C41230]'}`}>
                    {isPlaying
                      ? <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                      : <svg className="w-3 h-3 text-[#999999] group-hover:text-white ml-0.5 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>}
                  </div>
                  <button onClick={e => { e.stopPropagation(); removeItem(item) }}
                    className="opacity-0 group-hover:opacity-100 text-[#CCCCCC] hover:text-[#C41230] transition-all flex-shrink-0 p-0.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((item, idx) => {
              const itemUrl = getItemUrl(item)
              const type = itemUrl ? detectVideoType(itemUrl) : 'direct'
              const isPlaying = playingItem?.id === item.id
              const thumb = itemUrl ? getThumbnailUrl(itemUrl) : null
              return (
                <div key={item.id}
                  className={`group cursor-pointer rounded-xl overflow-hidden border transition-all ${isPlaying ? 'border-[#C41230] shadow-lg shadow-red-100' : 'border-[#E5E5E5] hover:border-[#C41230]'}`}
                  onClick={() => setPlayingItem(isPlaying ? null : item)}>
                  <div className="relative aspect-video bg-[#0A0A0A]">
                    {thumb ? <img src={thumb} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] flex items-center justify-center">
                          <svg className="w-8 h-8 text-white/20" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        </div>}
                    <div className={`absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      {isPlaying
                        ? <svg className="w-10 h-10 text-white drop-shadow" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                        : <svg className="w-10 h-10 text-white drop-shadow" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>}
                    </div>
                    <span className="absolute top-2 left-2 text-xs bg-black/60 text-white px-1.5 py-0.5 rounded font-mono">{idx + 1}</span>
                    {isPlaying && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#C41230] animate-pulse" />}
                  </div>
                  <div className="p-3 bg-white flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold truncate ${isPlaying ? 'text-[#C41230]' : 'text-[#0A0A0A]'}`}>{getItemTitle(item)}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${SOURCE_BADGE[type]}`}>{getVideoLabel(itemUrl)}</span>
                    </div>
                    <button onClick={e => { e.stopPropagation(); removeItem(item) }}
                      className="opacity-0 group-hover:opacity-100 text-[#CCCCCC] hover:text-[#C41230] transition-all flex-shrink-0 p-0.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Modal ajout */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/60" onClick={() => !addingItem && setShowAddModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[85vh] flex flex-col">
              <h2 className="text-lg font-bold text-[#0A0A0A] mb-4">Ajouter une vidéo</h2>
              <div className="flex gap-1 bg-[#F5F5F5] p-1 rounded-lg mb-4 flex-shrink-0">
                <button onClick={() => setAddMode('club')}
                  className={`flex-1 py-2 text-xs rounded-md transition-all ${addMode === 'club' ? 'bg-white text-[#0A0A0A] shadow-sm font-semibold' : 'text-[#999999]'}`}>
                  Bibliothèque du club
                </button>
                <button onClick={() => setAddMode('externe')}
                  className={`flex-1 py-2 text-xs rounded-md transition-all ${addMode === 'externe' ? 'bg-white text-[#0A0A0A] shadow-sm font-semibold' : 'text-[#999999]'}`}>
                  Ma vidéo (URL)
                </button>
              </div>

              {addMode === 'club' ? (
                <div className="flex flex-col flex-1 overflow-hidden">
                  <input type="text" value={searchClub} onChange={e => setSearchClub(e.target.value)}
                    placeholder="Rechercher une vidéo…"
                    className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C41230] mb-3 flex-shrink-0" />
                  <div className="overflow-y-auto flex-1 space-y-2 pr-1">
                    {filteredClub.length === 0
                      ? <p className="text-center text-[#CCCCCC] text-sm py-8">Aucune vidéo dans la bibliothèque du club.</p>
                      : filteredClub.map(v => {
                          const thumb = getThumbnailUrl(v.video_url)
                          return (
                            <button key={v.id} onClick={() => addClubVideo(v)} disabled={addingItem}
                              className="w-full text-left flex items-center gap-3 p-2 rounded-lg border border-[#E5E5E5] hover:border-[#C41230] hover:bg-[#FFF5F7] transition-all disabled:opacity-50">
                              <div className="w-20 h-12 rounded-lg overflow-hidden bg-[#0A0A0A] flex-shrink-0">
                                {thumb
                                  ? <img src={thumb} alt="" className="w-full h-full object-cover" />
                                  : <div className="w-full h-full bg-[#222] flex items-center justify-center">
                                      <svg className="w-4 h-4 text-white/30" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                    </div>
                                }
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[#0A0A0A] truncate">{v.title}</p>
                                <span className={`text-xs px-1.5 py-0.5 rounded-full ${SOURCE_BADGE[detectVideoType(v.video_url)]}`}>{getVideoLabel(v.video_url)}</span>
                              </div>
                            </button>
                          )
                        })
                    }
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[#999999] mb-1.5">Titre *</label>
                    <input type="text" value={extTitle} onChange={e => setExtTitle(e.target.value)}
                      placeholder="Ex : O-goshi — ma version"
                      className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C41230]" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[#999999] mb-1.5">Lien vidéo *</label>
                    <input type="url" value={extUrl} onChange={e => { setExtUrl(e.target.value); setExtUrlError(null) }}
                      placeholder="https://youtube.com/… ou https://drive.google.com/…"
                      className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none transition-colors ${extUrlError ? 'border-[#C41230]' : 'border-[#E5E5E5] focus:border-[#C41230]'}`} />
                    {extUrlError && <p className="text-xs text-[#C41230] mt-1">{extUrlError}</p>}
                    <p className="text-xs text-[#CCCCCC] mt-1">YouTube, Vimeo, Google Drive, NAS, lien direct…</p>
                  </div>
                  <button onClick={addExternalVideo} disabled={!extTitle.trim() || !extUrl.trim() || addingItem}
                    className="w-full bg-[#C41230] hover:bg-[#9B0E25] text-white text-sm py-2.5 rounded-lg transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
                    {addingItem ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Ajout…</> : 'Ajouter à la playlist'}
                  </button>
                </div>
              )}

              <button onClick={() => setShowAddModal(false)}
                className="mt-4 w-full border border-[#E5E5E5] text-[#666666] text-sm py-2.5 rounded-lg hover:bg-[#F5F5F5] flex-shrink-0">
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* Modal renommage */}
        {editingPlaylist && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/60" onClick={() => !editSaving && setEditingPlaylist(null)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
              <h2 className="text-lg font-bold text-[#0A0A0A] mb-4">Renommer la playlist</h2>
              <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && renamePlaylist()} autoFocus
                className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C41230] mb-5" />
              <div className="flex gap-3">
                <button onClick={() => setEditingPlaylist(null)} className="flex-1 border border-[#E5E5E5] text-[#666666] text-sm py-2.5 rounded-lg">Annuler</button>
                <button onClick={renamePlaylist} disabled={!editName.trim() || editSaving}
                  className="flex-1 bg-[#C41230] hover:bg-[#9B0E25] text-white text-sm py-2.5 rounded-lg disabled:opacity-40">
                  {editSaving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── Vue liste des playlists ───────────────────────────────────────────────
  const filteredClubMain = clubSearch.trim()
    ? clubVideos.filter(v => matchesSearch(v, clubSearch))
    : clubVideos

  return (
    <div>
      {/* Onglets Club / Mes playlists */}
      <div className="flex gap-1 bg-[#F5F5F5] p-1 rounded-lg w-fit mb-6">
        <button onClick={() => setTab('club')}
          className={`px-4 py-2 text-xs rounded-md transition-all ${tab === 'club' ? 'bg-white text-[#0A0A0A] shadow-sm font-semibold' : 'text-[#999999] hover:text-[#666666]'}`}>
          Bibliothèque du club
        </button>
        <button onClick={() => setTab('perso')}
          className={`px-4 py-2 text-xs rounded-md transition-all ${tab === 'perso' ? 'bg-white text-[#0A0A0A] shadow-sm font-semibold' : 'text-[#999999] hover:text-[#666666]'}`}>
          Mes playlists
        </button>
      </div>

      {/* ── Bibliothèque du club ── */}
      {tab === 'club' && (
        <div>
          {/* Lecteur club */}
          {playingClubVideo && (() => {
            const url = playingClubVideo.video_url
            const vtype = detectVideoType(url)
            return (
              <div className="mb-5 bg-[#0A0A0A] rounded-xl overflow-hidden">
                <div className="aspect-video">
                  {vtype === 'direct'
                    ? <video src={url} className="w-full h-full" controls autoPlay />
                    : <iframe src={getEmbedUrl(url)} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                  }
                </div>
                <div className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{playingClubVideo.title}</p>
                    {playingClubVideo.description && <p className="text-xs text-[#666666] mt-0.5">{playingClubVideo.description}</p>}
                  </div>
                  <button onClick={() => setPlayingClubVideo(null)} className="text-[#666666] hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          })()}

          <div className="flex items-center gap-3 mb-5">
            <input type="text" value={clubSearch} onChange={e => setClubSearch(e.target.value)}
              placeholder="Rechercher dans la bibliothèque…"
              className="flex-1 border border-[#E5E5E5] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#C41230] transition-colors" />
            <div className="flex border border-[#E5E5E5] rounded-lg overflow-hidden flex-shrink-0">
              <button onClick={() => setClubViewMode('list')} className={`px-3 py-2 transition-colors ${clubViewMode === 'list' ? 'bg-[#0A0A0A] text-white' : 'text-[#999999] hover:text-[#666666]'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
              </button>
              <button onClick={() => setClubViewMode('grid')} className={`px-3 py-2 transition-colors ${clubViewMode === 'grid' ? 'bg-[#0A0A0A] text-white' : 'text-[#999999] hover:text-[#666666]'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>
              </button>
            </div>
          </div>

          {filteredClubMain.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-[#E5E5E5] rounded-2xl">
              <p className="text-[#999999] text-sm mb-1">Aucune vidéo disponible</p>
              <p className="text-[#CCCCCC] text-xs">Le club n'a pas encore partagé de contenu.</p>
            </div>
          ) : clubViewMode === 'list' ? (
            <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
              {filteredClubMain.map((v, idx) => {
                const thumb = getThumbnailUrl(v.video_url)
                const isPlaying = playingClubVideo?.id === v.id
                return (
                  <div key={v.id} onClick={() => setPlayingClubVideo(isPlaying ? null : v)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer group transition-colors ${idx > 0 ? 'border-t border-[#F5F5F5]' : ''} ${isPlaying ? 'bg-[#FFF5F7]' : 'hover:bg-[#FAFAFA]'}`}>
                    <div className="w-16 h-10 rounded-lg overflow-hidden bg-[#0A0A0A] flex-shrink-0 relative">
                      {thumb ? <img src={thumb} alt={v.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] flex items-center justify-center">
                            <svg className="w-4 h-4 text-white/30" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                          </div>}
                      {isPlaying && <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#C41230] animate-pulse" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isPlaying ? 'text-[#C41230]' : 'text-[#0A0A0A]'}`}>{v.title}</p>
                      <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                        <span className="text-xs text-[#999999]">{getVideoLabel(v.video_url)}</span>
                        {v.tags && v.tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 2).map(t => (
                          <span key={t} className="text-xs bg-[#F5F0FF] text-[#7C3AED] px-1.5 py-0.5 rounded-full">{t}</span>
                        ))}
                      </div>
                    </div>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${isPlaying ? 'bg-[#C41230]' : 'bg-[#F5F5F5] group-hover:bg-[#C41230]'}`}>
                      {isPlaying
                        ? <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                        : <svg className="w-3 h-3 text-[#999999] group-hover:text-white ml-0.5 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredClubMain.map(v => {
                const thumb = getThumbnailUrl(v.video_url)
                const isPlaying = playingClubVideo?.id === v.id
                return (
                  <div key={v.id} onClick={() => setPlayingClubVideo(isPlaying ? null : v)}
                    className={`group cursor-pointer rounded-xl overflow-hidden border transition-all ${isPlaying ? 'border-[#C41230] shadow-lg shadow-red-100' : 'border-[#E5E5E5] hover:border-[#C41230]'}`}>
                    <div className="relative aspect-video bg-[#0A0A0A]">
                      {thumb ? <img src={thumb} alt={v.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] flex items-center justify-center">
                            <svg className="w-8 h-8 text-white/20" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                          </div>}
                      <div className={`absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        {isPlaying
                          ? <svg className="w-10 h-10 text-white drop-shadow" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                          : <svg className="w-10 h-10 text-white drop-shadow" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>}
                      </div>
                      {isPlaying && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#C41230] animate-pulse" />}
                    </div>
                    <div className="p-3 bg-white">
                      <p className={`text-xs font-semibold line-clamp-2 ${isPlaying ? 'text-[#C41230]' : 'text-[#0A0A0A]'}`}>{v.title}</p>
                      {v.tags && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {v.tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 3).map(t => (
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

      {/* ── Mes playlists ── */}
      {tab === 'perso' && <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-[#999999] text-sm">{playlists.length} playlist{playlists.length !== 1 ? 's' : ''}</p>
        <div className="flex items-center gap-2">
          <div className="flex border border-[#E5E5E5] rounded-lg overflow-hidden">
            <button onClick={() => setPlaylistViewMode('list')} className={`px-3 py-2 transition-colors ${playlistViewMode === 'list' ? 'bg-[#0A0A0A] text-white' : 'text-[#999999] hover:text-[#666666]'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            </button>
            <button onClick={() => setPlaylistViewMode('grid')} className={`px-3 py-2 transition-colors ${playlistViewMode === 'grid' ? 'bg-[#0A0A0A] text-white' : 'text-[#999999] hover:text-[#666666]'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>
            </button>
          </div>
          <button onClick={openKeywordModal}
            className="border border-[#C41230] text-[#C41230] hover:bg-[#FFF5F7] text-xs px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Par mots-clés
          </button>
          <button onClick={() => setShowNewPlaylist(true)}
            className="bg-[#C41230] hover:bg-[#9B0E25] text-white text-xs uppercase tracking-widest px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouvelle
          </button>
        </div>
      </div>

      {playlists.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-[#E5E5E5] rounded-2xl">
          <div className="w-12 h-12 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-[#CCCCCC]" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="3.5" r="1.5" />
              <path d="M9 7.5c0-.3.2-.5.5-.5h5c.3 0 .5.2.5.5v.1L16.5 11H14l-.5-2h-3L10 11H7.5L9 7.6V7.5z" />
              <path d="M7.5 11l-2 5h2l1-2.5 1.5 1.5v4h2v-4.5l-1.8-1.8L11 11H7.5z" />
              <path d="M16.5 11l2 5h-2l-1-2.5-1.5 1.5v4h-2v-4.5l1.8-1.8L13 11h3.5z" />
            </svg>
          </div>
          <p className="text-[#999999] text-sm mb-1">Aucune playlist</p>
          <p className="text-[#CCCCCC] text-xs">Créez votre première playlist pour organiser vos vidéos.</p>
        </div>
      ) : playlistViewMode === 'list' ? (
        <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
          {playlists.map((p, idx) => (
            <div key={p.id} onClick={() => openPlaylistView(p)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer group hover:bg-[#FAFAFA] transition-colors ${idx > 0 ? 'border-t border-[#F5F5F5]' : ''}`}>
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                <PlaylistCover thumbs={p.cover_thumbs ?? []} name={p.name} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#0A0A0A] truncate">{p.name}</p>
                <p className="text-xs text-[#999999]">{p.item_count} vidéo{(p.item_count ?? 0) !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={e => { e.stopPropagation(); setEditingPlaylist(p); setEditName(p.name) }}
                  className="w-7 h-7 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#999999] hover:text-[#0A0A0A]">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <button onClick={e => { e.stopPropagation(); setDeletePlaylistId(p.id) }}
                  className="w-7 h-7 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#999999] hover:text-[#C41230]">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
              <svg className="w-4 h-4 text-[#CCCCCC] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {playlists.map(p => (
            <div key={p.id} className="group cursor-pointer" onClick={() => openPlaylistView(p)}>
              {/* Cover */}
              <div className="rounded-xl overflow-hidden relative shadow-sm group-hover:shadow-md transition-shadow">
                <PlaylistCover thumbs={p.cover_thumbs ?? []} name={p.name} />
                {/* Overlay play */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 shadow-lg">
                    <svg className="w-5 h-5 text-[#0A0A0A] ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                </div>
                {/* Actions */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={e => { e.stopPropagation(); setEditingPlaylist(p); setEditName(p.name) }}
                    className="w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={e => { e.stopPropagation(); setDeletePlaylistId(p.id) }}
                    className="w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-[#C41230]">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              {/* Infos sous la cover */}
              <div className="mt-2 px-0.5">
                <p className="font-semibold text-[#0A0A0A] text-sm truncate">{p.name}</p>
                <p className="text-xs text-[#999999]">{p.item_count} vidéo{(p.item_count ?? 0) !== 1 ? 's' : ''}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal nouvelle playlist */}
      {showNewPlaylist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => !saving && setShowNewPlaylist(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-[#0A0A0A] mb-4">Nouvelle playlist</h2>
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createPlaylist()}
              placeholder="Ex : Uchi-mata — perfectionnement" autoFocus
              className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C41230] mb-5" />
            <div className="flex gap-3">
              <button onClick={() => setShowNewPlaylist(false)} className="flex-1 border border-[#E5E5E5] text-[#666666] text-sm py-2.5 rounded-lg">Annuler</button>
              <button onClick={createPlaylist} disabled={!newName.trim() || saving}
                className="flex-1 bg-[#C41230] hover:bg-[#9B0E25] text-white text-sm py-2.5 rounded-lg disabled:opacity-40">
                {saving ? 'Création…' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal renommage */}
      {editingPlaylist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => !editSaving && setEditingPlaylist(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-[#0A0A0A] mb-4">Renommer la playlist</h2>
            <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && renamePlaylist()} autoFocus
              className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C41230] mb-5" />
            <div className="flex gap-3">
              <button onClick={() => setEditingPlaylist(null)} className="flex-1 border border-[#E5E5E5] text-[#666666] text-sm py-2.5 rounded-lg">Annuler</button>
              <button onClick={renamePlaylist} disabled={!editName.trim() || editSaving}
                className="flex-1 bg-[#C41230] hover:bg-[#9B0E25] text-white text-sm py-2.5 rounded-lg disabled:opacity-40">
                {editSaving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal playlist par mots-clés */}
      {showKeywordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => !kwCreating && setShowKeywordModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[85vh] flex flex-col">
            <h2 className="text-lg font-bold text-[#0A0A0A] mb-1">Créer une playlist par mots-clés</h2>
            <p className="text-xs text-[#999999] mb-4">Hazumi va scanner la bibliothèque du club et sélectionner les vidéos correspondantes.</p>
            <input
              type="text" value={kwInput} autoFocus
              onChange={e => handleKwSearch(e.target.value)}
              placeholder="Ex : o-goshi, chute, ceinture jaune…"
              className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C41230] mb-4"
            />

            {kwInput.trim() && (
              kwResults.length === 0
                ? <p className="text-sm text-[#CCCCCC] text-center py-6">Aucune vidéo trouvée pour ces mots-clés.</p>
                : <>
                    <p className="text-xs text-[#999999] mb-2">{kwResults.length} vidéo{kwResults.length > 1 ? 's' : ''} trouvée{kwResults.length > 1 ? 's' : ''}</p>
                    <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-1">
                      {kwResults.map(v => {
                        const thumb = getThumbnailUrl(v.video_url)
                        return (
                          <div key={v.id} className="flex items-center gap-3 p-2 rounded-lg border border-[#E5E5E5] bg-[#FAFAFA]">
                            <div className="w-16 h-10 rounded-lg overflow-hidden bg-[#0A0A0A] flex-shrink-0">
                              {thumb
                                ? <img src={thumb} alt="" className="w-full h-full object-cover" />
                                : <div className="w-full h-full bg-[#222] flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white/30" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                  </div>
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-[#0A0A0A] truncate">{v.title}</p>
                              {v.tags && <p className="text-xs text-[#7C3AED] truncate">{v.tags}</p>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="mb-3">
                      <label className="block text-xs text-[#999999] mb-1.5">Nom de la playlist</label>
                      <input type="text" value={kwName} onChange={e => setKwName(e.target.value)}
                        placeholder="Ex : O-goshi — perfectionnement"
                        className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C41230]" />
                    </div>
                    <button onClick={createPlaylistFromKeywords} disabled={!kwName.trim() || kwCreating}
                      className="w-full bg-[#C41230] hover:bg-[#9B0E25] text-white text-sm py-2.5 rounded-lg transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
                      {kwCreating ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Création…</> : `Créer la playlist (${kwResults.length} vidéos)`}
                    </button>
                  </>
            )}

            <button onClick={() => setShowKeywordModal(false)} className="mt-3 w-full border border-[#E5E5E5] text-[#666666] text-sm py-2.5 rounded-lg hover:bg-[#F5F5F5] flex-shrink-0">
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Confirmation suppression */}
      {deletePlaylistId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDeletePlaylistId(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <p className="text-[#0A0A0A] font-semibold mb-2">Supprimer cette playlist ?</p>
            <p className="text-[#999999] text-sm mb-5">Toutes les vidéos de la playlist seront retirées.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletePlaylistId(null)} className="flex-1 border border-[#E5E5E5] text-[#666666] text-sm py-2.5 rounded-lg">Annuler</button>
              <button onClick={() => deletePlaylist(deletePlaylistId)} className="flex-1 bg-[#C41230] text-white text-sm py-2.5 rounded-lg">Supprimer</button>
            </div>
          </div>
        </div>
      )}
      </>}
    </div>
  )
}
