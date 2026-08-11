import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchMasterclassBySlug, type Masterclass } from '../../lib/masterclasses'
import { parseMasterclassSections, parseApprofondir } from '../../lib/masterclass/lessons'
import { youtubeEmbedUrl, formatTimestamp } from '../../lib/youtube'
import { renderMarkdown } from '../../lib/markdown'

// Ressource de l'Espace Enseignant, calée sur la structure d'une leçon Parcours :
// 1) vidéo, 2) « Comprendre les techniques » (chapitres horodatés → saut vidéo),
// 3) « Approfondir les techniques » (lecture pédagogique). Contenu = table `masterclass`.
// NB : la vidéo n'est PAS sticky ici (elle défile normalement au scroll).
export default function EnseignantLecon() {
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
      <p className="text-sm text-[#999999] mb-4">Ressource introuvable.</p>
      <Link to="/enseignant" className="text-xs uppercase tracking-widest text-[#C41230] hover:text-[#9B0E25] font-semibold">← Espace Enseignant</Link>
    </div>
  )

  const chapitres = parseMasterclassSections(mc.contenu)
  const approfondissements = parseApprofondir(mc.contenu)
  const embedUrl = youtubeEmbedUrl(mc.youtube_url, startSeconds)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link to="/enseignant" className="text-xs uppercase tracking-widest text-[#C41230] hover:text-[#9B0E25] font-semibold">
        ← Espace Enseignant
      </Link>

      <div className="bg-white rounded-xl border border-[#E5E5E5] p-5">
        <span className="text-[10px] uppercase tracking-widest text-[#999999]">Espace Enseignant · Patrick Roux</span>
        <h1 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">{mc.titre}</h1>
      </div>

      {/* Vidéo sticky (figée en haut au scroll, comme une leçon Parcours). */}
      <div className="sticky top-2 z-30 bg-white rounded-xl border border-[#E5E5E5] p-3 shadow-sm">
        <div className="aspect-video rounded-lg overflow-hidden bg-black w-full sm:w-[70%] mx-auto">
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

      {/* Comprendre les techniques — chapitres horodatés du déroulé réel. */}
      {chapitres.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-5">
          <h2 className="text-lg font-bold text-[#0A0A0A] mb-1">Comprendre les techniques</h2>
          <p className="text-xs text-[#999999] mb-4">Le déroulé de la vidéo, chapitre par chapitre. Touche un horodatage pour aller au passage.</p>
          <div className="space-y-1.5">
            {chapitres.map((c) => {
              const active = startSeconds === c.timestampSeconds
              return (
                <div key={c.timestampSeconds} className={`rounded-lg border overflow-hidden transition-colors ${active ? 'border-[#C41230]/30 bg-[#C41230]/5' : 'border-[#E5E5E5]'}`}>
                  <button
                    onClick={() => setStartSeconds(c.timestampSeconds)}
                    aria-current={active ? 'true' : undefined}
                    className="w-full text-left flex items-start gap-3 p-2.5 hover:bg-[#FAFAFA] transition-colors"
                  >
                    <span className={`flex-shrink-0 text-xs font-semibold rounded px-2 py-0.5 tabular-nums ${active ? 'bg-[#C41230] text-white' : 'text-[#C41230] bg-[#C41230]/5'}`}>
                      {formatTimestamp(c.timestampSeconds)}
                    </span>
                    <span className={`block text-sm font-semibold ${active ? 'text-[#C41230]' : 'text-[#0A0A0A]'}`}>{c.titre}</span>
                  </button>
                  {c.transcript && (
                    <p className="px-3 pb-3 pt-0.5 text-sm text-[#333333] leading-relaxed">{c.transcript}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Approfondir les techniques — lecture pédagogique ancrée sur les situations montrées. */}
      {approfondissements.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-5">
          <h2 className="text-lg font-bold text-[#0A0A0A] mb-1">Approfondir les techniques</h2>
          <p className="text-xs text-[#999999] mb-4">Chaque approfondissement part d'une situation réellement montrée par Patrick Roux.</p>
          <div className="space-y-4">
            {approfondissements.map((a, i) => (
              <div key={i} className="rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] p-4">
                <h3 className="font-bold text-[#0A0A0A] mb-3">{a.titre}</h3>
                <div className="space-y-3">
                  {a.blocs.map((b, j) => (
                    <div key={j}>
                      <p className="text-[10px] uppercase tracking-widest text-[#C41230] font-semibold mb-1">{b.label}</p>
                      <div className="text-sm text-[#333333] leading-relaxed">{renderMarkdown(b.contenu)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
