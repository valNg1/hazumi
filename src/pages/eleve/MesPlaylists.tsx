import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { detectVideoType, getEmbedUrl, getVideoLabel } from '../../lib/video'

interface Playlist {
  id: string
  name: string
  created_at: string
  item_count?: number
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
}

const SOURCE_BADGE: Record<string, string> = {
  youtube: 'bg-red-50 text-red-500',
  vimeo: 'bg-blue-50 text-blue-500',
  gdrive: 'bg-green-50 text-green-600',
  direct: 'bg-[#F5F5F5] text-[#999999]',
}

export default function MesPlaylists() {
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
  const [deletePlaylistId, setDeletePlaylistId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: judoka } = await supabase.from('judokas').select('id').eq('user_id', user.id).single()
      if (!judoka) { setLoading(false); return }
      setJudokaId(judoka.id)
      await loadPlaylists(judoka.id)
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
    const withCounts = await Promise.all(data.map(async p => {
      const { count } = await supabase.from('playlist_items').select('*', { count: 'exact', head: true }).eq('playlist_id', p.id)
      return { ...p, item_count: count ?? 0 }
    }))
    setPlaylists(withCounts)
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
        const { data: vid } = await supabase.from('videos').select('id, title, description, video_url, belt, technique_key').eq('id', item.video_id).single()
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
    const { data } = await supabase.from('playlists').insert({ judoka_id: judokaId, name: newName.trim() }).select().single()
    setSaving(false)
    setNewName('')
    setShowNewPlaylist(false)
    if (data) await loadPlaylists(judokaId)
  }

  async function deletePlaylist(id: string) {
    await supabase.from('playlists').delete().eq('id', id)
    setDeletePlaylistId(null)
    if (judokaId) await loadPlaylists(judokaId)
    if (openPlaylist?.id === id) setOpenPlaylist(null)
  }

  async function loadClubVideos() {
    const { data } = await supabase.from('videos').select('id, title, description, video_url, belt, technique_key').order('created_at', { ascending: false })
    setClubVideos(data ?? [])
  }

  function openAddModal() {
    setAddMode('club')
    setSearchClub('')
    setExtUrl('')
    setExtTitle('')
    setExtUrlError(null)
    setShowAddModal(true)
    loadClubVideos()
  }

  async function addClubVideo(video: ClubVideo) {
    if (!openPlaylist) return
    setAddingItem(true)
    const maxPos = items.length > 0 ? Math.max(...items.map(i => i.position)) + 1 : 0
    await supabase.from('playlist_items').insert({
      playlist_id: openPlaylist.id,
      video_id: video.id,
      position: maxPos,
    })
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
    await supabase.from('playlist_items').insert({
      playlist_id: openPlaylist.id,
      external_url: extUrl.trim(),
      external_title: extTitle.trim(),
      position: maxPos,
    })
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

  function getItemUrl(item: PlaylistItem): string {
    return item.video?.video_url ?? item.external_url ?? ''
  }

  function getItemTitle(item: PlaylistItem): string {
    return item.video?.title ?? item.external_title ?? ''
  }

  const filteredClub = searchClub.trim()
    ? clubVideos.filter(v => v.title.toLowerCase().includes(searchClub.toLowerCase()))
    : clubVideos

  if (loading) return <div className="text-center py-16 text-[#999999] text-sm">Chargement…</div>

  if (!judokaId) return (
    <div className="text-center py-16">
      <p className="text-[#666666] text-sm">Complétez votre profil pour accéder aux playlists.</p>
    </div>
  )

  // Vue playlist ouverte
  if (openPlaylist) {
    const url = playingItem ? getItemUrl(playingItem) : null
    const embedUrl = url ? getEmbedUrl(url) : null
    const videoType = url ? detectVideoType(url) : null

    return (
      <div>
        <button
          onClick={() => { setOpenPlaylist(null); setPlayingItem(null) }}
          className="flex items-center gap-2 text-sm text-[#999999] hover:text-[#0A0A0A] mb-5 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Mes playlists
        </button>

        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-[#0A0A0A]">{openPlaylist.name}</h2>
            <p className="text-xs text-[#999999] mt-0.5">{items.length} vidéo{items.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-[#C41230] hover:bg-[#9B0E25] text-white text-xs uppercase tracking-widest px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter
          </button>
        </div>

        {/* Lecteur */}
        {playingItem && url && (
          <div className="mb-5 bg-[#0A0A0A] rounded-xl overflow-hidden aspect-video">
            {videoType === 'direct' ? (
              <video src={url} className="w-full h-full" controls autoPlay />
            ) : (
              <iframe
                src={embedUrl ?? ''}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        )}

        {loadingItems ? (
          <div className="text-center py-10 text-[#999999] text-sm">Chargement…</div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-[#E5E5E5] rounded-xl">
            <p className="text-[#CCCCCC] text-sm mb-3">Playlist vide</p>
            <button onClick={openAddModal} className="text-xs text-[#C41230] hover:underline">Ajouter une première vidéo</button>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item, idx) => {
              const itemUrl = getItemUrl(item)
              const type = itemUrl ? detectVideoType(itemUrl) : 'direct'
              const isPlaying = playingItem?.id === item.id
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer group ${isPlaying ? 'border-[#C41230] bg-[#FFF5F7]' : 'border-[#E5E5E5] bg-white hover:border-[#CCCCCC]'}`}
                  onClick={() => setPlayingItem(isPlaying ? null : item)}
                >
                  <span className="text-xs text-[#CCCCCC] w-5 text-center flex-shrink-0">{idx + 1}</span>
                  <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center flex-shrink-0">
                    {isPlaying ? (
                      <svg className="w-4 h-4 text-[#C41230]" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-[#999999]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isPlaying ? 'text-[#C41230]' : 'text-[#0A0A0A]'}`}>
                      {getItemTitle(item)}
                    </p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${SOURCE_BADGE[type]}`}>
                      {getVideoLabel(itemUrl)}
                    </span>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); removeItem(item) }}
                    className="opacity-0 group-hover:opacity-100 text-[#CCCCCC] hover:text-[#C41230] transition-all p-1"
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

        {/* Modal ajout */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/60" onClick={() => !addingItem && setShowAddModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[85vh] flex flex-col">
              <h2 className="text-lg font-bold text-[#0A0A0A] mb-4">Ajouter une vidéo</h2>

              {/* Toggle source */}
              <div className="flex gap-1 bg-[#F5F5F5] p-1 rounded-lg mb-4 flex-shrink-0">
                <button
                  onClick={() => setAddMode('club')}
                  className={`flex-1 py-2 text-xs rounded-md transition-all ${addMode === 'club' ? 'bg-white text-[#0A0A0A] shadow-sm font-semibold' : 'text-[#999999]'}`}
                >
                  Bibliothèque du club
                </button>
                <button
                  onClick={() => setAddMode('externe')}
                  className={`flex-1 py-2 text-xs rounded-md transition-all ${addMode === 'externe' ? 'bg-white text-[#0A0A0A] shadow-sm font-semibold' : 'text-[#999999]'}`}
                >
                  Ma vidéo (URL)
                </button>
              </div>

              {addMode === 'club' ? (
                <div className="flex flex-col flex-1 overflow-hidden">
                  <input
                    type="text"
                    value={searchClub}
                    onChange={e => setSearchClub(e.target.value)}
                    placeholder="Rechercher une vidéo…"
                    className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C41230] mb-3 flex-shrink-0"
                  />
                  <div className="overflow-y-auto flex-1 space-y-2 pr-1">
                    {filteredClub.length === 0 ? (
                      <p className="text-center text-[#CCCCCC] text-sm py-8">Aucune vidéo dans la bibliothèque du club.</p>
                    ) : filteredClub.map(v => (
                      <button
                        key={v.id}
                        onClick={() => addClubVideo(v)}
                        disabled={addingItem}
                        className="w-full text-left flex items-center gap-3 p-3 rounded-lg border border-[#E5E5E5] hover:border-[#C41230] hover:bg-[#FFF5F7] transition-all disabled:opacity-50"
                      >
                        <div className="w-8 h-8 bg-[#F5F5F5] rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-[#999999]" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#0A0A0A] truncate">{v.title}</p>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${SOURCE_BADGE[detectVideoType(v.video_url)]}`}>
                            {getVideoLabel(v.video_url)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[#999999] mb-1.5">Titre *</label>
                    <input
                      type="text"
                      value={extTitle}
                      onChange={e => setExtTitle(e.target.value)}
                      placeholder="Ex : O-goshi — ma version"
                      className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C41230]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[#999999] mb-1.5">Lien vidéo *</label>
                    <input
                      type="url"
                      value={extUrl}
                      onChange={e => { setExtUrl(e.target.value); setExtUrlError(null) }}
                      placeholder="https://youtube.com/… ou https://drive.google.com/…"
                      className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none transition-colors ${extUrlError ? 'border-[#C41230]' : 'border-[#E5E5E5] focus:border-[#C41230]'}`}
                    />
                    {extUrlError && <p className="text-xs text-[#C41230] mt-1">{extUrlError}</p>}
                    <p className="text-xs text-[#CCCCCC] mt-1">YouTube, Vimeo, Google Drive, NAS, lien direct…</p>
                  </div>
                  <button
                    onClick={addExternalVideo}
                    disabled={!extTitle.trim() || !extUrl.trim() || addingItem}
                    className="w-full bg-[#C41230] hover:bg-[#9B0E25] text-white text-sm py-2.5 rounded-lg transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    {addingItem ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Ajout…</> : 'Ajouter à la playlist'}
                  </button>
                </div>
              )}

              <button
                onClick={() => setShowAddModal(false)}
                className="mt-4 w-full border border-[#E5E5E5] text-[#666666] text-sm py-2.5 rounded-lg hover:bg-[#F5F5F5] flex-shrink-0"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Vue liste des playlists
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[#999999] text-sm">{playlists.length} playlist{playlists.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowNewPlaylist(true)}
          className="bg-[#C41230] hover:bg-[#9B0E25] text-white text-xs uppercase tracking-widest px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle playlist
        </button>
      </div>

      {playlists.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-[#E5E5E5] rounded-2xl">
          <div className="w-12 h-12 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-[#CCCCCC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <p className="text-[#999999] text-sm mb-1">Aucune playlist</p>
          <p className="text-[#CCCCCC] text-xs">Créez votre première playlist pour organiser vos vidéos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {playlists.map(p => (
            <div
              key={p.id}
              className="bg-white border border-[#E5E5E5] rounded-xl p-5 hover:border-[#CCCCCC] transition-all cursor-pointer group"
              onClick={() => openPlaylistView(p)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-[#F5F5F5] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#FFF5F7] transition-colors">
                    <svg className="w-5 h-5 text-[#CCCCCC] group-hover:text-[#C41230] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[#0A0A0A] truncate">{p.name}</p>
                    <p className="text-xs text-[#999999]">{p.item_count} vidéo{(p.item_count ?? 0) !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); setDeletePlaylistId(p.id) }}
                  className="opacity-0 group-hover:opacity-100 text-[#CCCCCC] hover:text-[#C41230] transition-all p-1 flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-[#CCCCCC] mt-3">
                Créée le {new Date(p.created_at).toLocaleDateString('fr-FR')}
              </p>
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
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createPlaylist()}
              placeholder="Ex : Uchi-mata — perfectionnement"
              autoFocus
              className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C41230] mb-5"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowNewPlaylist(false)} className="flex-1 border border-[#E5E5E5] text-[#666666] text-sm py-2.5 rounded-lg">Annuler</button>
              <button
                onClick={createPlaylist}
                disabled={!newName.trim() || saving}
                className="flex-1 bg-[#C41230] hover:bg-[#9B0E25] text-white text-sm py-2.5 rounded-lg disabled:opacity-40"
              >
                {saving ? 'Création…' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation suppression playlist */}
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
    </div>
  )
}
