import type { SerieCard, Technique } from '../../lib/lessonPremium'

interface Props {
  serie: SerieCard
  index: number
  onOpenTechnique: (t: Technique) => void
}

export default function SeriesCard({ serie, index, onOpenTechnique }: Props) {
  return (
    <div className="bg-white border border-[#E5E5E5] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#C41230] text-white text-xs font-bold flex items-center justify-center">{index + 1}</span>
        <h4 className="text-sm font-bold text-[#0A0A0A]">{serie.nom}</h4>
      </div>
      <p className="text-xs text-[#666666] mb-3 leading-relaxed">{serie.objectif}</p>

      <div className="space-y-1.5 mb-3">
        {serie.techniques.map((t) => (
          <div key={t.nom} className="flex items-center justify-between gap-2 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg px-3 py-2">
            <span className="text-sm text-[#0A0A0A]">{t.nom}</span>
            {t.detail && (
              <button
                onClick={() => onOpenTechnique(t)}
                className="flex-shrink-0 text-[11px] font-semibold text-[#C41230] hover:text-[#9B0E25] transition-colors"
              >
                Comprendre cette technique
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-[#F0F0F0]">
        <p className="text-[10px] uppercase tracking-widest text-[#999999] mb-0.5">Ce que l'on apprend</p>
        <p className="text-xs text-[#666666] leading-relaxed">{serie.apprend}</p>
      </div>
    </div>
  )
}
