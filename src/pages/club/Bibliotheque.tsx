import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { CURRICULUM, getBeltIndex } from '../../lib/curriculum'
import { detectVideoType, getVideoLabel } from '../../lib/video'

interface Video {
  id: string
  title: string
  description: string | null
  belt: string | null
  technique_key: string | null
  video_url: string
  created_at: string
}

interface NewRow {
  video_url: string
  title: string
  belt: string
  description: string
}

const EMPTY_ROW: NewRow = { video_url: '', title: '', belt: '', description: '' }


const BELT_COLORS: Record<string, string> = {
  blanche: '#E5E5E5', jaune: '#FFD700', orange: '#FF8C00',
  verte: '#228B22', bleue: '#1565C0', marron: '#6D3B1E',
  noire: '#0A0A0A', 'noire-2': '#0A0A0A', 'noire-3': '#0A0A0A', 'noire-4': '#0A0A0A', 'noire-5': '#0A0A0A',
}

const SOURCE_BADGE: Record<string, string> = {
  youtube: 'bg-red-50 text-red-500',
  vimeo: 'bg-blue-50 text-blue-500',
  gdrive: 'bg-green-50 text-green-600',
  direct: 'bg-[#F5F5F5] text-[#999999]',
}

const COL = '1fr 1.2fr 0.7fr 0.5fr auto'

async function fetchVideoTitle(url: string): Promise<string | null> {
  try {
    const type = detectVideoType(url)
    if (type === 'youtube') {
      const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`)
      if (res.ok) { const d = await res.json(); return d.title ?? null }
    }
    if (type === 'vimeo') {
      const res = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`)
      if (res.ok) { const d = await res.json(); return d.title ?? null }
    }
  } catch { /* ignore */ }
  return null
}

export default function Bibliotheque() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [filterBelt, setFilterBelt] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')

  // Inline edit
  const [inlineId, setInlineId] = useState<string | null>(null)
  const [inlineEdit, setInlineEdit] = useState<Record<string, string> | null>(null)
  const [inlineSaving, setInlineSaving] = useState(false)

  // Nouvelle ligne tableur
  const [newRow, setNewRow] = useState<NewRow>(EMPTY_ROW)
  const [showNewRow, setShowNewRow] = useState(false)
  const [addingRow, setAddingRow] = useState(false)
  const [fetchingTitle, setFetchingTitle] = useState(false)
  const urlInputRef = useRef<HTMLInputElement>(null)

  async function load() {
    const { data } = await supabase.from('videos').select('*').order('created_at', { ascending: false })
    setVideos(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleUrlPaste(url: string) {
    setNewRow(r => ({ ...r, video_url: url }))
    if (!url.trim()) return
    try { new URL(url) } catch { return }
    setFetchingTitle(true)
    const t = await fetchVideoTitle(url)
    if (t) setNewRow(r => ({ ...r, title: r.title || t }))
    setFetchingTitle(false)
  }

  async function saveNewRow() {
    if (!newRow.video_url.trim() || !newRow.title.trim()) return
    setAddingRow(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('videos').insert({
      video_url: newRow.video_url.trim(),
      title: newRow.title.trim(),
      belt: newRow.belt || null,
      description: newRow.description.trim() || null,
      uploaded_by: user?.id,
    })
    setNewRow(EMPTY_ROW)
    setShowNewRow(false)
    setAddingRow(false)
    load()
  }

  function startInline(video: Video) {
    setInlineId(video.id)
    setInlineEdit({ title: video.title, description: video.description ?? '', belt: video.belt ?? '', video_url: video.video_url })
  }

  function cancelInline() { setInlineId(null); setInlineEdit(null) }

  async function saveInline() {
    if (!inlineId || !inlineEdit) return
    setInlineSaving(true)
    await supabase.from('videos').update({
      title: inlineEdit.title.trim(),
      description: inlineEdit.description.trim() || null,
      belt: inlineEdit.belt || null,
      video_url: inlineEdit.video_url.trim(),
    }).eq('id', inlineId)
    setInlineId(null)
    setInlineEdit(null)
    setInlineSaving(false)
    load()
  }

  async function handleDelete(video: Video) {
    await supabase.from('videos').delete().eq('id', video.id)
    setDeleteId(null)
    setVideos(v => v.filter(x => x.id !== video.id))
  }

  const filterIdx = filterBelt ? getBeltIndex(filterBelt as any) : -1
  const filtered = filterBelt
    ? videos.filter(v => v.belt && getBeltIndex(v.belt as any) <= filterIdx)
    : videos

  const newType = newRow.video_url ? detectVideoType(newRow.video_url) : null

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">Bibliothèque vidéo</h1>
          <p className="text-[#999999] text-sm mt-0.5">{videos.length} vidéo{videos.length !== 1 ? 's' : ''} disponible{videos.length !== 1 ? 's' : ''}</p>
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

      {/* Filtres ceinture */}
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
      ) : viewMode === 'list' ? (
        <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
          {/* Header */}
          <div className="px-4 py-2 border-b border-[#F0F0F0] bg-[#FAFAFA]"
            style={{ display: 'grid', gridTemplateColumns: COL, gap: '0.75rem', alignItems: 'center' }}>
            <span className="text-xs uppercase tracking-widest text-[#999999]">Lien</span>
            <span className="text-xs uppercase tracking-widest text-[#999999]">Titre</span>
            <span className="text-xs uppercase tracking-widest text-[#999999]">Ceinture</span>
            <span className="text-xs uppercase tracking-widest text-[#999999]">Source</span>
            <button
              onClick={() => { setShowNewRow(true); setNewRow(EMPTY_ROW); setTimeout(() => urlInputRef.current?.focus(), 50) }}
              className="flex items-center gap-1 text-xs text-[#C41230] hover:text-[#9B0E25] font-medium transition-colors whitespace-nowrap">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ajouter
            </button>
          </div>

          {/* Ligne d'ajout (conditionnelle) */}
          {showNewRow && (
            <div className="px-4 py-2.5 bg-[#FFFBF5] border-b border-[#F0EED8]"
              style={{ display: 'grid', gridTemplateColumns: COL, gap: '0.75rem', alignItems: 'center' }}>
              <div className="relative">
                <input
                  ref={urlInputRef}
                  type="url"
                  value={newRow.video_url}
                  onChange={e => handleUrlPaste(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveNewRow()}
                  placeholder="Coller un lien YouTube, Drive…"
                  className="w-full text-xs border border-[#E5E5E5] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#C41230] bg-white placeholder-[#CCCCCC]"
                />
                {newType && (
                  <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs px-1.5 py-0.5 rounded-full ${SOURCE_BADGE[newType]}`}>
                    {getVideoLabel(newRow.video_url)}
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={newRow.title}
                  onChange={e => setNewRow(r => ({ ...r, title: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && saveNewRow()}
                  placeholder={fetchingTitle ? 'Récupération…' : 'Titre'}
                  className="w-full text-xs border border-[#E5E5E5] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#C41230] bg-white placeholder-[#CCCCCC]"
                />
                {fetchingTitle && <div className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 border border-[#C41230] border-t-transparent rounded-full animate-spin" />}
              </div>
              <select value={newRow.belt} onChange={e => setNewRow(r => ({ ...r, belt: e.target.value }))}
                className="w-full text-xs border border-[#E5E5E5] rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#C41230] bg-white text-[#666666]">
                <option value="">Ceinture…</option>
                {CURRICULUM.map(c => <option key={c.belt} value={c.belt}>{c.label}</option>)}
              </select>
              <div />
              <div className="flex items-center gap-2">
                <button onClick={saveNewRow} disabled={!newRow.video_url.trim() || !newRow.title.trim() || addingRow}
                  className="flex items-center gap-1.5 bg-[#C41230] hover:bg-[#9B0E25] text-white text-xs px-3 py-1.5 rounded-lg disabled:opacity-40 transition-colors whitespace-nowrap">
                  {addingRow && <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />}
                  Ajouter
                </button>
                <button onClick={() => { setShowNewRow(false); setNewRow(EMPTY_ROW) }} className="text-[#CCCCCC] hover:text-[#999999] transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Lignes existantes */}
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-[#CCCCCC] text-sm">Aucune vidéo{filterBelt ? ' pour cette ceinture' : ''}.</div>
          ) : (
            <div>
              {filtered.map((video, idx) => {
                const isEditing = inlineId === video.id
                const type = detectVideoType(video.video_url)
                return (
                  <div key={video.id} className={idx > 0 ? 'border-t border-[#F5F5F5]' : ''}>
                    {/* Ligne normale */}
                    <div className="px-4 py-3 hover:bg-[#FAFAFA] transition-colors"
                      style={{ display: 'grid', gridTemplateColumns: COL, gap: '0.75rem', alignItems: 'center' }}>
                      <div className="min-w-0">
                        <a href={video.video_url} target="_blank" rel="noreferrer"
                          className="text-xs text-[#999999] hover:text-[#C41230] truncate block transition-colors">
                          {video.video_url.replace(/^https?:\/\/(www\.)?/, '').substring(0, 30)}…
                        </a>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#0A0A0A] truncate">{video.title}</p>
                        {video.description && <p className="text-xs text-[#CCCCCC] truncate">{video.description}</p>}
                      </div>
                      <div>
                        {video.belt ? (
                          <span className="flex items-center gap-1.5 text-xs text-[#666666]">
                            <span className="w-2.5 h-2.5 rounded-full border border-[#CCCCCC] flex-shrink-0" style={{ backgroundColor: BELT_COLORS[video.belt] ?? '#0A0A0A' }} />
                            {CURRICULUM.find(c => c.belt === video.belt)?.label ?? video.belt}
                          </span>
                        ) : <span className="text-xs text-[#CCCCCC]">—</span>}
                      </div>
                      <div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SOURCE_BADGE[type]}`}>{getVideoLabel(video.video_url)}</span>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <button onClick={() => isEditing ? cancelInline() : startInline(video)}
                          className={`text-xs transition-colors ${isEditing ? 'text-[#C41230]' : 'text-[#999999] hover:text-[#0A0A0A]'}`}>
                          {isEditing ? 'Fermer' : 'Modifier'}
                        </button>
                        <button onClick={() => setDeleteId(video.id)} className="text-xs text-[#CCCCCC] hover:text-[#C41230] transition-colors">✕</button>
                      </div>
                    </div>

                    {/* Accordéon édition */}
                    {isEditing && inlineEdit && (
                      <div className="px-4 pb-4 bg-[#FAFAFA] border-t border-[#F0F0F0]">
                        <div className="grid grid-cols-2 gap-3 pt-3">
                          <div>
                            <label className="block text-xs text-[#999999] mb-1">URL</label>
                            <input value={inlineEdit.video_url} onChange={e => setInlineEdit({ ...inlineEdit, video_url: e.target.value })}
                              className="w-full text-sm border border-[#E5E5E5] rounded-lg px-3 py-2 focus:outline-none focus:border-[#C41230] bg-white" />
                          </div>
                          <div>
                            <label className="block text-xs text-[#999999] mb-1">Titre</label>
                            <input autoFocus value={inlineEdit.title} onChange={e => setInlineEdit({ ...inlineEdit, title: e.target.value })}
                              className="w-full text-sm border border-[#E5E5E5] rounded-lg px-3 py-2 focus:outline-none focus:border-[#C41230] bg-white" />
                          </div>
                          <div>
                            <label className="block text-xs text-[#999999] mb-1">Ceinture</label>
                            <select value={inlineEdit.belt} onChange={e => setInlineEdit({ ...inlineEdit, belt: e.target.value })}
                              className="w-full text-sm border border-[#E5E5E5] rounded-lg px-3 py-2 focus:outline-none focus:border-[#C41230] bg-white">
                              <option value="">Toutes ceintures</option>
                              {CURRICULUM.map(c => <option key={c.belt} value={c.belt}>{c.label}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-[#999999] mb-1">Description</label>
                            <input value={inlineEdit.description} onChange={e => setInlineEdit({ ...inlineEdit, description: e.target.value })}
                              className="w-full text-sm border border-[#E5E5E5] rounded-lg px-3 py-2 focus:outline-none focus:border-[#C41230] bg-white" placeholder="Optionnel" />
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mt-3">
                          <button onClick={saveInline} disabled={!inlineEdit.title.trim() || !inlineEdit.video_url.trim() || inlineSaving}
                            className="bg-[#C41230] hover:bg-[#9B0E25] text-white text-xs px-4 py-2 rounded-lg disabled:opacity-40 transition-colors flex items-center gap-2">
                            {inlineSaving && <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />}
                            Enregistrer
                          </button>
                          <button onClick={cancelInline} className="text-xs text-[#999999] hover:text-[#666666]">Annuler</button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

      ) : (
        /* Vue grille */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(video => {
            const type = detectVideoType(video.video_url)
            return (
              <div key={video.id} className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
                <div className="relative bg-[#0A0A0A] aspect-video">
                  {type === 'direct'
                    ? <video src={video.video_url} className="w-full h-full object-cover" controls preload="metadata" />
                    : <iframe src={video.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                        className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                  }
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-semibold text-[#0A0A0A] text-sm leading-snug flex-1">{video.title}</p>
                    <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${SOURCE_BADGE[type]}`}>{getVideoLabel(video.video_url)}</span>
                  </div>
                  {video.description && <p className="text-xs text-[#999999] line-clamp-2 mb-2">{video.description}</p>}
                  {video.belt && (
                    <span className="flex items-center gap-1 text-xs text-[#999999] bg-[#F5F5F5] px-2 py-0.5 rounded-full w-fit">
                      <span className="w-2 h-2 rounded-full border border-[#CCCCCC]" style={{ backgroundColor: BELT_COLORS[video.belt] ?? '#0A0A0A' }} />
                      {CURRICULUM.find(c => c.belt === video.belt)?.label ?? video.belt}
                    </span>
                  )}
                  <div className="mt-3 pt-3 border-t border-[#F5F5F5] flex items-center justify-between">
                    <span className="text-xs text-[#CCCCCC]">{new Date(video.created_at).toLocaleDateString('fr-FR')}</span>
                    <button onClick={() => setDeleteId(video.id)} className="text-xs text-[#CCCCCC] hover:text-[#C41230] transition-colors">Supprimer</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Confirmation suppression */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <p className="text-[#0A0A0A] font-semibold mb-2">Supprimer cette vidéo ?</p>
            <p className="text-[#999999] text-sm mb-5">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-[#E5E5E5] text-[#666666] text-sm py-2.5 rounded-lg">Annuler</button>
              <button onClick={() => { const v = videos.find(x => x.id === deleteId); if (v) handleDelete(v) }}
                className="flex-1 bg-[#C41230] text-white text-sm py-2.5 rounded-lg">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
