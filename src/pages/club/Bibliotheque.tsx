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

export default function Bibliotheque() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [belt, setBelt] = useState('')
  const [techniqueKey, setTechniqueKey] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [urlError, setUrlError] = useState<string | null>(null)
  const [filterBelt, setFilterBelt] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  async function load() {
    const { data } = await supabase.from('videos').select('*').order('created_at', { ascending: false })
    setVideos(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function validateUrl(url: string): boolean {
    try { new URL(url); return true } catch { return false }
  }

  async function handleSave() {
    if (!title.trim() || !videoUrl.trim()) return
    if (!validateUrl(videoUrl.trim())) { setUrlError('URL invalide — vérifiez le lien.'); return }
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('videos').insert({
      title: title.trim(),
      description: description.trim() || null,
      belt: belt || null,
      technique_key: techniqueKey || null,
      video_url: videoUrl.trim(),
      uploaded_by: user?.id,
    })
    setTitle(''); setDescription(''); setBelt(''); setTechniqueKey(''); setVideoUrl(''); setUrlError(null)
    setShowForm(false)
    setSaving(false)
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">Bibliothèque vidéo</h1>
          <p className="text-[#999999] text-sm mt-0.5">{videos.length} vidéo{videos.length !== 1 ? 's' : ''} disponible{videos.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#C41230] hover:bg-[#9B0E25] text-white text-xs uppercase tracking-widest px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter une vidéo
        </button>
      </div>

      {/* Filtres ceinture */}
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
        <div className="text-center py-16 text-[#CCCCCC] text-sm">Aucune vidéo{filterBelt ? ' pour cette ceinture' : ''}.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(video => {
            const type = detectVideoType(video.video_url)
            const embedUrl = getEmbedUrl(video.video_url)
            return (
              <div key={video.id} className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
                <div className="relative bg-[#0A0A0A] aspect-video">
                  {type === 'direct' ? (
                    <video src={video.video_url} className="w-full h-full object-cover" controls preload="metadata" />
                  ) : (
                    <iframe
                      src={embedUrl}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
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
                  <div className="mt-3 pt-3 border-t border-[#F5F5F5] flex items-center justify-between">
                    <span className="text-xs text-[#CCCCCC]">{new Date(video.created_at).toLocaleDateString('fr-FR')}</span>
                    <button onClick={() => setDeleteId(video.id)} className="text-xs text-[#CCCCCC] hover:text-[#C41230] transition-colors">
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal ajout */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => !saving && setShowForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-[#0A0A0A] mb-5">Ajouter une vidéo</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#999999] mb-1.5">Titre *</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ex : O-goshi — tutorial pas à pas"
                  className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C41230]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-[#999999] mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Points clés à retenir…"
                  rows={2}
                  className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C41230] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-[#999999] mb-1.5">Lien vidéo *</label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={e => { setVideoUrl(e.target.value); setUrlError(null) }}
                  placeholder="https://youtube.com/… ou https://drive.google.com/…"
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none transition-colors ${urlError ? 'border-[#C41230]' : 'border-[#E5E5E5] focus:border-[#C41230]'}`}
                />
                {urlError && <p className="text-xs text-[#C41230] mt-1">{urlError}</p>}
                {videoUrl && validateUrl(videoUrl) && (
                  <p className="text-xs text-[#999999] mt-1">
                    Source détectée : <span className="font-medium text-[#666666]">{getVideoLabel(videoUrl)}</span>
                  </p>
                )}
                <p className="text-xs text-[#CCCCCC] mt-1">YouTube, Vimeo, Google Drive, NAS, lien direct…</p>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-[#999999] mb-1.5">Ceinture concernée</label>
                <select
                  value={belt}
                  onChange={e => { setBelt(e.target.value); setTechniqueKey('') }}
                  className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C41230] bg-white"
                >
                  <option value="">Toutes ceintures</option>
                  {CURRICULUM.map(c => (
                    <option key={c.belt} value={c.belt}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-[#999999] mb-1.5">
                  Technique associée <span className="normal-case text-[#CCCCCC]">(optionnel)</span>
                </label>
                <select
                  value={techniqueKey}
                  onChange={e => setTechniqueKey(e.target.value)}
                  className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C41230] bg-white"
                >
                  <option value="">— Aucune technique spécifique —</option>
                  {(belt ? CURRICULUM.filter(c => c.belt === belt) : CURRICULUM).map(c => (
                    <optgroup key={c.belt} label={c.label}>
                      {c.techniques.map(t => (
                        <option key={t.key} value={t.key}>{t.nom}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowForm(false)}
                disabled={saving}
                className="flex-1 border border-[#E5E5E5] text-[#666666] text-sm py-2.5 rounded-lg hover:bg-[#F5F5F5] transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={!title.trim() || !videoUrl.trim() || saving}
                className="flex-1 bg-[#C41230] hover:bg-[#9B0E25] text-white text-sm py-2.5 rounded-lg transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Enregistrement…</> : 'Publier'}
              </button>
            </div>
          </div>
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
              <button
                onClick={() => { const v = videos.find(x => x.id === deleteId); if (v) handleDelete(v) }}
                className="flex-1 bg-[#C41230] text-white text-sm py-2.5 rounded-lg"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
