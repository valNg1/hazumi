import type { PrincipeIllustre } from '../../lib/lessonPremium'

export default function PrincipleCard({ principe }: { principe: PrincipeIllustre }) {
  return (
    <div className="bg-white border border-[#E5E5E5] rounded-xl p-4">
      <h4 className="text-sm font-bold text-[#0A0A0A] pl-2 border-l-[3px] border-[#C41230] mb-2">{principe.titre}</h4>
      <p className="text-[10px] uppercase tracking-widest text-[#999999] mb-1">
        Illustré par <span className="text-[#C41230] font-semibold normal-case tracking-normal">{principe.technique}</span>
      </p>
      <p className="text-xs text-[#333333] leading-relaxed">{principe.texte}</p>
    </div>
  )
}
