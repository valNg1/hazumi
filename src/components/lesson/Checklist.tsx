import type { JuryCritere } from '../../lib/lessonPremium'

export default function Checklist({ items }: { items: JuryCritere[] }) {
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i} className="bg-white border border-[#E5E5E5] rounded-xl p-4">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm font-bold text-[#0A0A0A]">{it.critere}</p>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full border font-medium bg-[#C41230]/5 text-[#C41230] border-[#C41230]/20">
              ex. {it.exemple}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] p-2.5">
              <p className="text-[10px] uppercase tracking-widest text-[#999999] mb-0.5">Tori</p>
              <p className="text-xs text-[#333333] leading-relaxed">{it.tori}</p>
            </div>
            <div className="rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] p-2.5">
              <p className="text-[10px] uppercase tracking-widest text-[#999999] mb-0.5">Uke</p>
              <p className="text-xs text-[#333333] leading-relaxed">{it.uke}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
