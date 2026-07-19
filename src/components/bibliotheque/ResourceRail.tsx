import type { Rail, Ressource } from '../../lib/bibliotheque'

const TYPE_ICONE: Record<string, string> = { video: '▶', article: '📄', pdf: '📕' }

interface Props {
  rail: Rail
  selection: Set<string>
  modeSelection: boolean
  onOuvrir: (r: Ressource) => void
  onBasculerSelection: (r: Ressource) => void
}

export default function ResourceRail({ rail, selection, modeSelection, onOuvrir, onBasculerSelection }: Props) {
  return (
    <section className="mb-8">
      <h2 className="text-sm font-bold text-[#0A0A0A] mb-3 flex items-center gap-2">
        {rail.titre}
        <span className="text-[10px] font-normal text-[#999999]">{rail.items.length}</span>
      </h2>

      {/* Defilement horizontal : on parcourt sans quitter la page. */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x">
        {rail.items.map((item) => {
          const choisi = selection.has(item.id)
          return (
            <button
              key={item.id}
              onClick={() => (modeSelection ? onBasculerSelection(item) : onOuvrir(item))}
              className={`group relative flex-shrink-0 w-40 sm:w-48 text-left rounded-xl border bg-white p-4 snap-start transition-all hover:-translate-y-0.5 hover:shadow-md ${
                choisi ? 'border-[#C41230] ring-2 ring-[#C41230]/20' : 'border-[#E5E5E5] hover:border-[#CCCCCC]'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-lg leading-none" aria-hidden="true">{TYPE_ICONE[item.type] ?? '📄'}</span>
                {modeSelection && (
                  <span
                    className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                      choisi ? 'bg-[#C41230] border-[#C41230] text-white' : 'border-[#CCCCCC]'
                    }`}
                  >
                    {choisi ? '✓' : ''}
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-[#0A0A0A] leading-snug line-clamp-2">{item.titre}</p>
              {item.grade && (
                <p className="text-[10px] uppercase tracking-widest text-[#999999] mt-2">{item.grade}</p>
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}
