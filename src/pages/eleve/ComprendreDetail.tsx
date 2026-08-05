import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchMasterclassBySlug, parseMasterclassChapters, type Masterclass, type MasterclassChapitre } from '../../lib/masterclasses'
import { youtubeEmbedUrl, formatTimestamp } from '../../lib/youtube'
import { renderMarkdown } from '../../lib/markdown'

export default function ComprendreDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [mc, setMc] = useState<Masterclass | null>(null)
  const [loading, setLoading] = useState(true)
  const [startSeconds, setStartSeconds] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (!slug) { setLoading(false); return }
    fetchMasterclassBySlug(slug).then((row) => { setMc(row); setLoading(false) })
  }, [slug])

  if (loading) return <div className="text-center py-16 text-[#999999] text-sm">Chargement…</div>
  if (!mc) return (
    <div className="max-w-3xl mx-auto text-center py-16">
      <p className="text-sm text-[#999999] mb-4">Masterclass introuvable.</p>
      <Link to="/comprendre" className="text-xs uppercase tracking-widest text-[#C41230] hover:text-[#9B0E25] font-semibold">← Toutes les masterclasses</Link>
    </div>
  )

  const chapitres: MasterclassChapitre[] = parseMasterclassChapters(mc.contenu)
  const embedUrl = youtubeEmbedUrl(mc.youtube_url, startSeconds)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link to="/comprendre" className="text-xs uppercase tracking-widest text-[#C41230] hover:text-[#9B0E25] font-semibold">
        ← Toutes les masterclasses
      </Link>

      <div className="bg-white rounded-xl border border-[#E5E5E5] p-5">
        <span className="text-[10px] uppercase tracking-widest text-[#999999]">Masterclass</span>
        <h1 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">{mc.titre}</h1>
      </div>

      {/* Vidéo sticky (comme la Leçon) */}
      <div className="sticky top-2 z-30 bg-white rounded-xl border border-[#E5E5E5] p-3 shadow-sm">
        <div className="aspect-video rounded-lg overflow-hidden bg-black w-[70%] mx-auto">
          <iframe
            key={startSeconds ?? 'start'}
            title="Lecteur vidéo"
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>

      {/* Navigation par chapitre (saut vidéo) */}
      {chapitres.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-5">
          <p className="text-[10px] uppercase tracking-widest text-[#999999] mb-2">Chapitres</p>
          <div className="space-y-1">
            {chapitres.map((c) => {
              const active = startSeconds === c.seconds
              return (
                <button
                  key={c.seconds}
                  onClick={() => setStartSeconds(c.seconds)}
                  aria-current={active ? 'true' : undefined}
                  className={`w-full text-left flex items-start gap-3 p-2 rounded-lg transition-colors ${active ? 'bg-[#C41230]/5 ring-1 ring-[#C41230]/20' : 'hover:bg-[#FAFAFA]'}`}
                >
                  <span className={`flex-shrink-0 text-xs font-semibold rounded px-2 py-0.5 tabular-nums ${active ? 'bg-[#C41230] text-white' : 'text-[#C41230] bg-[#C41230]/5'}`}>
                    {formatTimestamp(c.seconds)}
                  </span>
                  <span className={`block text-sm font-medium ${active ? 'text-[#C41230]' : 'text-[#0A0A0A]'}`}>{c.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Contenu markdown (renderer maison) */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-5">
        {renderMarkdown(mc.contenu)}
      </div>
    </div>
  )
}
