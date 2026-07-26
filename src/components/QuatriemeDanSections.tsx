import { QUATRIEME_DAN_HERO, QUATRIEME_DAN_POURQUOI } from '../lib/quatriemeDanContent'

interface Props {
  progress: { percent: number; done: number; total: number; termine: boolean }
  onCommencer: () => void
  onBrowseResources: () => void
}

export default function QuatriemeDanSections({ progress, onCommencer, onBrowseResources }: Props) {
  const started = progress.done > 0
  const primaryLabel = started ? '▶ Reprendre le parcours' : QUATRIEME_DAN_HERO.ctaPrimary

  return (
    <div id="top" className="space-y-8">
      {/* ── SECTION 1 — HERO (design Hazumi : panneau noir, CTA primaire + secondaire) ── */}
      <section className="bg-gradient-to-br from-[#0A0A0A] to-[#3A0A12] rounded-2xl p-6 sm:p-8 text-white">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{QUATRIEME_DAN_HERO.emoji}</span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{QUATRIEME_DAN_HERO.titre}</h1>
        </div>
        <p className="text-sm sm:text-base text-[#DDDDDD] leading-relaxed max-w-2xl mb-5">{QUATRIEME_DAN_HERO.intro}</p>

        {progress.total > 0 && (
          <div className="mb-5 max-w-md">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] uppercase tracking-widest text-[#999999]">Ma progression</span>
              <span className="text-xs font-semibold">{progress.percent}%</span>
            </div>
            <div className="h-1.5 bg-white/15 rounded-full overflow-hidden">
              <div className="h-full bg-[#C41230] rounded-full transition-all duration-500" style={{ width: `${progress.percent}%` }} />
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            onClick={onCommencer}
            className="bg-[#C41230] hover:bg-[#9B0E25] text-white text-xs uppercase tracking-widest px-5 py-3 rounded-lg transition-colors font-semibold"
          >
            {primaryLabel}
          </button>
          <button
            onClick={onBrowseResources}
            className="border border-white/20 hover:border-white/40 text-white text-xs uppercase tracking-widest px-5 py-3 rounded-lg transition-colors"
          >
            {QUATRIEME_DAN_HERO.ctaSecondary}
          </button>
        </div>
      </section>

      {/* ── SECTION 2 — POURQUOI APPRENDRE LE KIME-NO-KATA ─────────────────── */}
      <section>
        <h2 className="text-lg font-bold text-[#0A0A0A] mb-3">{QUATRIEME_DAN_POURQUOI.titre}</h2>
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-4 sm:p-6 space-y-3">
          {QUATRIEME_DAN_POURQUOI.paragraphes.map((p, i) => (
            <p key={i} className="text-sm text-[#666666] leading-relaxed">{p}</p>
          ))}
        </div>
      </section>
    </div>
  )
}
