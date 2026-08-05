import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchPublishedMasterclasses, type Masterclass } from '../../lib/masterclasses'
import { getYoutubeId } from '../../lib/youtube'

export default function Comprendre() {
  const [list, setList] = useState<Masterclass[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPublishedMasterclasses().then((rows) => { setList(rows); setLoading(false) })
  }, [])

  if (loading) return <div className="text-center py-16 text-[#999999] text-sm">Chargement…</div>

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl sm:text-3xl font-bold" style={{ color: '#C41230' }}>🎥</span>
          <div>
            <h1 className="text-3xl font-bold text-[#0A0A0A] tracking-tight">Comprendre les techniques</h1>
            <p className="text-[#666666] text-sm">Des masterclasses techniques approfondies, commentées pas à pas.</p>
          </div>
        </div>
      </div>

      {list.length === 0 ? (
        <p className="text-sm text-[#999999] text-center py-10">Aucune masterclass disponible pour le moment.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((m) => {
            const yid = getYoutubeId(m.youtube_url)
            return (
              <Link
                key={m.id}
                to={`/comprendre/${m.slug}`}
                className="text-left bg-white rounded-xl border border-[#E5E5E5] overflow-hidden hover:border-[#CCCCCC] hover:shadow-sm transition-all flex flex-col"
              >
                <div className="aspect-[16/9] bg-gradient-to-br from-[#0A0A0A] to-[#3A0A12] flex items-center justify-center overflow-hidden">
                  {yid ? (
                    <img src={`https://i.ytimg.com/vi/${yid}/hqdefault.jpg`} alt={m.titre} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">🥋</span>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-[#999999] mb-1">Masterclass</span>
                  <h3 className="font-bold text-[#0A0A0A] text-sm leading-snug mb-1">{m.titre}</h3>
                  <span className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-white bg-[#C41230] rounded-lg px-3 py-1.5 w-fit">
                    ▶ Comprendre
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
