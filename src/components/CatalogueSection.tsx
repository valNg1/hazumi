import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getEmbedUrl, getThumbnailUrl, getVideoLabel } from '../lib/video'

export type ContenuType = 'video' | 'article' | 'pdf'
export type Parcours = 'shiai' | 'judo-ka' | 'kyu'

export interface CatalogueItem {
  id: string
  titre: string
  type: ContenuType
  parcours: Parcours
  url: string | null
  contenu: string | null
  tags: string[] | null
}

interface CatalogueSectionProps {
  parcours: Parcours
  onItemsLoaded?: (items: CatalogueItem[]) => void
}

export default function CatalogueSection({ parcours, onItemsLoaded }: CatalogueSectionProps) {
  const [items, setItems] = useState<CatalogueItem[]>([])
  const [videoOpen, setVideoOpen] = useState<CatalogueItem | null>(null)
  const [articleOpen, setArticleOpen] = useState<CatalogueItem | null>(null)

  useEffect(() => {
    load()
  }, [parcours])

  async function load() {
    const { data } = await supabase
      .from('catalogue_hazumi')
      .select('*')
      .eq('parcours', parcours)
      .order('created_at', { ascending: false })
    const loaded = (data as CatalogueItem[]) ?? []
    setItems(loaded)
    onItemsLoaded?.(loaded)
  }

  if (items.length === 0) return null

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-[#0A0A0A] mb-3">Contenu Hazumi</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => {
          if (item.type === 'video' && item.url) {
            const thumb = getThumbnailUrl(item.url)
            return (
              <button
                key={item.id}
                onClick={() => setVideoOpen(item)}
                className="text-left bg-white rounded-xl border border-[#E5E5E5] overflow-hidden hover:border-[#CCCCCC] transition-colors"
              >
                <div className="aspect-video bg-[#0A0A0A] flex items-center justify-center">
                  {thumb ? (
                    <img src={thumb} alt={item.titre} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-xs">{getVideoLabel(item.url)}</span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-[#0A0A0A] truncate">{item.titre}</p>
                </div>
              </button>
            )
          }

          if (item.type === 'article') {
            return (
              <button
                key={item.id}
                onClick={() => setArticleOpen(item)}
                className="text-left bg-white rounded-xl border border-[#E5E5E5] p-4 hover:border-[#CCCCCC] transition-colors"
              >
                <span className="text-xs uppercase tracking-widest text-[#999999]">Article</span>
                <p className="text-sm font-medium text-[#0A0A0A] mt-1">{item.titre}</p>
              </button>
            )
          }

          return (
            <a
              key={item.id}
              href={item.url ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl border border-[#E5E5E5] p-4 hover:border-[#CCCCCC] transition-colors flex items-center justify-between"
            >
              <div>
                <span className="text-xs uppercase tracking-widest text-[#999999]">PDF</span>
                <p className="text-sm font-medium text-[#0A0A0A] mt-1">{item.titre}</p>
              </div>
              <span className="text-xs font-semibold text-[#C41230]">Voir</span>
            </a>
          )
        })}
      </div>

      {videoOpen && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={() => setVideoOpen(null)}
        >
          <div className="w-full max-w-3xl aspect-video" onClick={(e) => e.stopPropagation()}>
            <iframe
              src={getEmbedUrl(videoOpen.url ?? '')}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
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
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-[#0A0A0A] mb-3">{articleOpen.titre}</h2>
            <p className="text-sm text-[#333333] whitespace-pre-wrap">{articleOpen.contenu}</p>
          </div>
        </div>
      )}
    </div>
  )
}
