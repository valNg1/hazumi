import { QUATRIEME_DAN_HERO, QUATRIEME_DAN_PRESENTATION } from '../lib/quatriemeDanContent'

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

      {/* ── SECTION 2 — PRÉSENTATION (contexte examen 4e Dan + UV1) ─────────── */}
      <section>
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-4 sm:p-6 space-y-3">
          {QUATRIEME_DAN_PRESENTATION.paragraphes.map((p, i) => (
            <p key={i} className="text-sm text-[#666666] leading-relaxed">{p}</p>
          ))}
          <p className="text-sm text-[#666666] leading-relaxed">{QUATRIEME_DAN_PRESENTATION.uv1Intro}</p>
          <ul className="space-y-1.5 pt-1">
            {QUATRIEME_DAN_PRESENTATION.katas.map((k) => (
              <li key={k} className="text-sm text-[#333333] leading-relaxed flex gap-2">
                <span className="text-[#C41230] flex-shrink-0">›</span><span>{k}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
