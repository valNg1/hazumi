import { useState } from 'react'
import {
  PREMIER_DAN_HERO,
  PREMIER_DAN_UVS,
  PREMIER_DAN_VOIES,
  PREMIER_DAN_EXAMEN,
} from '../lib/premierDanContent'

interface Props {
  progress: { percent: number; done: number; total: number; termine: boolean }
  onCommencer: () => void
  onBrowseResources: () => void
}

export default function PremierDanSections({ progress, onCommencer, onBrowseResources }: Props) {
  const [openUV, setOpenUV] = useState<string | null>(null)
  const started = progress.done > 0
  const primaryLabel = started ? '▶ Reprendre le parcours' : PREMIER_DAN_HERO.ctaPrimary

  return (
    <div id="top" className="space-y-8">
      {/* ── SECTION 1 — HERO ─────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-[#0A0A0A] to-[#3A0A12] rounded-2xl p-6 sm:p-8 text-white">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{PREMIER_DAN_HERO.emoji}</span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{PREMIER_DAN_HERO.titre}</h1>
        </div>
        <p className="text-sm sm:text-base text-[#DDDDDD] leading-relaxed max-w-2xl mb-5">{PREMIER_DAN_HERO.intro}</p>

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
            {PREMIER_DAN_HERO.ctaSecondary}
          </button>
        </div>
      </section>

      {/* ── SECTION 2 — L'EXAMEN EN UN COUP D'ŒIL ────────────────────────── */}
      <section>
        <h2 className="text-lg font-bold text-[#0A0A0A] mb-3">L'examen en un coup d'œil</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PREMIER_DAN_EXAMEN.map((c) => (
            <div key={c.titre} className="bg-white rounded-xl border border-[#E5E5E5] p-4">
              <h3 className="text-sm font-semibold text-[#0A0A0A] mb-1">{c.titre}</h3>
              <p className="text-xs text-[#666666] leading-relaxed">{c.description}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          {PREMIER_DAN_VOIES.map((v) => (
            <div key={v.code} className="bg-[#FAFAFA] rounded-xl border border-[#E5E5E5] p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${v.code === 'competition' ? 'bg-[#C41230]' : 'bg-[#0A0A0A]'}`} />
                <h3 className="text-sm font-semibold text-[#0A0A0A]">{v.titre}</h3>
              </div>
              <p className="text-xs text-[#666666] leading-relaxed mb-2">{v.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {v.uvs.map((u) => (
                  <span key={u} className="text-[9px] px-1.5 py-0.5 rounded border font-medium bg-white text-[#666666] border-[#E5E5E5]">{u}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 3 — LES UV ───────────────────────────────────────────── */}
      <section id="uv">
        <h2 className="text-lg font-bold text-[#0A0A0A] mb-3">Les unités de valeur</h2>
        <div className="space-y-3">
          {PREMIER_DAN_UVS.map((uv) => {
            const isOpen = openUV === uv.code
            return (
              <div key={uv.code} className="bg-white rounded-xl border border-[#E5E5E5] p-4">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 text-[11px] font-bold text-white bg-[#C41230] rounded px-2 py-1">{uv.code}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-[#0A0A0A]">{uv.titre}</h3>
                      {uv.voieCompetitionUniquement && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full border font-medium bg-[#C41230]/5 text-[#C41230] border-[#C41230]/20">
                          Voie compétition uniquement
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] uppercase tracking-widest text-[#999999] mt-0.5">{uv.sousTitre}</p>
                    <p className="text-xs text-[#666666] leading-relaxed mt-2">{uv.resume}</p>
                    {isOpen && <p className="text-xs text-[#333333] leading-relaxed mt-2 pt-2 border-t border-[#F0F0F0]">{uv.detail}</p>}
                    <button
                      onClick={() => setOpenUV(isOpen ? null : uv.code)}
                      className="mt-2 text-xs font-semibold text-[#C41230] hover:text-[#9B0E25] transition-colors"
                    >
                      {isOpen ? 'Réduire' : "Découvrir l'UV"}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

    </div>
  )
}
