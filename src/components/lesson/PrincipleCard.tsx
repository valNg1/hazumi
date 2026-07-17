import type { Principe } from '../../lib/lessonPremium'

export default function PrincipleCard({ principe }: { principe: Principe }) {
  return (
    <div className="bg-white border border-[#E5E5E5] rounded-xl p-4">
      <h4 className="text-sm font-bold text-[#0A0A0A] pl-2 border-l-[3px] border-[#C41230] mb-2">{principe.titre}</h4>
      <p className="text-xs text-[#333333] leading-relaxed">{principe.definition}</p>
      <div className="mt-2 pt-2 border-t border-[#F0F0F0]">
        <p className="text-[10px] uppercase tracking-widest text-[#999999] mb-0.5">Dans le Nage-no-kata</p>
        <p className="text-xs text-[#666666] leading-relaxed">{principe.application}</p>
      </div>
    </div>
  )
}
