import type { JuryCritere } from '../../lib/lessonPremium'

const IMPORTANCE_LABEL: Record<number, string> = { 3: 'Essentiel', 2: 'Important', 1: 'Complémentaire' }
const IMPORTANCE_CLS: Record<number, string> = {
  3: 'bg-[#C41230]/5 text-[#C41230] border-[#C41230]/20',
  2: 'bg-amber-50 text-amber-700 border-amber-200',
  1: 'bg-[#F5F5F5] text-[#666666] border-[#E5E5E5]',
}

export default function Checklist({ items }: { items: JuryCritere[] }) {
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="flex items-start gap-3 bg-white border border-[#E5E5E5] rounded-lg p-3">
          <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-[#0A0A0A]">{it.critere}</p>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-medium ${IMPORTANCE_CLS[it.importance]}`}>
                {IMPORTANCE_LABEL[it.importance]}
              </span>
            </div>
            <p className="text-xs text-[#666666] mt-0.5">{it.explication}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
