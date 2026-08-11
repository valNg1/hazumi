import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchMasterclassBySlug, type Masterclass } from '../../lib/masterclasses'
import { youtubeEmbedUrl } from '../../lib/youtube'
import { renderMarkdown } from '../../lib/markdown'

// Ressource de l'Espace Enseignant : vidéo source + contenu pédagogique (markdown).
// Le contenu vit dans la table `masterclass` (source unique), rendu ici tel quel.
export default function EnseignantLecon() {
  const { slug } = useParams<{ slug: string }>()
  const [mc, setMc] = useState<Masterclass | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) { setLoading(false); return }
    fetchMasterclassBySlug(slug).then((row) => { setMc(row); setLoading(false) })
  }, [slug])

  if (loading) return <div className="text-center py-16 text-[#999999] text-sm">Chargement…</div>
  if (!mc) return (
    <div className="max-w-3xl mx-auto text-center py-16">
      <p className="text-sm text-[#999999] mb-4">Ressource introuvable.</p>
      <Link to="/enseignant" className="text-xs uppercase tracking-widest text-[#C41230] hover:text-[#9B0E25] font-semibold">← Espace Enseignant</Link>
    </div>
  )

  const embedUrl = youtubeEmbedUrl(mc.youtube_url)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link to="/enseignant" className="text-xs uppercase tracking-widest text-[#C41230] hover:text-[#9B0E25] font-semibold">
        ← Espace Enseignant
      </Link>

      <div className="bg-white rounded-xl border border-[#E5E5E5] p-3 shadow-sm">
        <div className="aspect-video rounded-lg overflow-hidden bg-black w-[70%] mx-auto">
          <iframe
            title="Lecteur vidéo"
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E5E5] p-5 sm:p-6">
        <span className="text-[10px] uppercase tracking-widest text-[#999999]">Espace Enseignant · Patrick Roux</span>
        {renderMarkdown(mc.contenu)}
      </div>
    </div>
  )
}
