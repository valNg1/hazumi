import type { PremiumMeta } from '../../lib/lessonPremium'

function Stars({ n }: { n: number }) {
  return (
    <span className="tracking-wide" aria-label={`Difficulté ${n} sur 5`}>
      <span className="text-[#C41230]">{'★'.repeat(n)}</span>
      <span className="text-[#DDDDDD]">{'★'.repeat(Math.max(0, 5 - n))}</span>
    </span>
  )
}

export default function LessonMeta({ meta }: { meta: PremiumMeta }) {
  return (
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
      <div className="flex items-start gap-2 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg px-3 py-2">
        <span className="text-base leading-none mt-0.5">⏱</span>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#999999]">Temps de lecture</p>
          <p className="text-sm font-medium text-[#0A0A0A]">{meta.tempsLecture}</p>
        </div>
      </div>
      <div className="flex items-start gap-2 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg px-3 py-2">
        <span className="text-base leading-none mt-0.5">🥋</span>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#999999]">Niveau</p>
          <p className="text-sm font-medium text-[#0A0A0A]">{meta.niveau}</p>
        </div>
      </div>
      <div className="flex items-start gap-2 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg px-3 py-2">
        <span className="text-base leading-none mt-0.5">📈</span>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#999999]">Difficulté</p>
          <p className="text-sm font-medium"><Stars n={meta.difficulte} /></p>
        </div>
      </div>
      <div className="flex items-start gap-2 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg px-3 py-2">
        <span className="text-base leading-none mt-0.5">🎯</span>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#999999]">Objectif</p>
          <p className="text-sm font-medium text-[#0A0A0A] leading-snug">{meta.objectif}</p>
        </div>
      </div>
    </div>
  )
}
