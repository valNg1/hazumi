import type { SerieCard } from '../../lib/lessonPremium'

export default function SeriesCard({ serie, index }: { serie: SerieCard; index: number }) {
  return (
    <div className="bg-white border border-[#E5E5E5] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#C41230] text-white text-xs font-bold flex items-center justify-center">{index + 1}</span>
        <h4 className="text-sm font-bold text-[#0A0A0A]">{serie.nom}</h4>
      </div>
      <p className="text-xs text-[#999999] mb-3">{serie.objectif}</p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {serie.techniques.map((t) => (
          <span key={t} className="text-[10px] px-2 py-0.5 rounded-full border font-medium bg-[#F5F5F5] text-[#666666] border-[#E5E5E5]">{t}</span>
        ))}
      </div>
      <div className="pt-2 border-t border-[#F0F0F0]">
        <p className="text-[10px] uppercase tracking-widest text-[#999999] mb-0.5">Ce que la série développe</p>
        <p className="text-xs text-[#666666] leading-relaxed">{serie.developpe}</p>
      </div>
    </div>
  )
}
