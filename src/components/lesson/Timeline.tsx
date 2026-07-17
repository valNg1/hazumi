import type { TimelineStep } from '../../lib/lessonPremium'

export default function Timeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="relative">
      {steps.map((s, i) => {
        const last = i === steps.length - 1
        return (
          <li key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className="flex-shrink-0 w-3 h-3 rounded-full bg-[#C41230] ring-4 ring-[#C41230]/10" />
              {!last && <span className="w-px flex-1 bg-[#E5E5E5] my-1" />}
            </div>
            <div className="pb-5 -mt-1">
              <p className="text-xs font-bold uppercase tracking-widest text-[#C41230]">{s.annee}</p>
              <p className="text-sm text-[#0A0A0A]">{s.label}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
