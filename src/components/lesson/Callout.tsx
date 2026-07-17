interface Props {
  icone: string
  titre: string
  items: string[]
  emptyLabel?: string
  variant?: 'gold' | 'red'
}

export default function Callout({ icone, titre, items, emptyLabel = 'Contenu à venir.', variant = 'red' }: Props) {
  const border = variant === 'gold' ? 'border-amber-200' : 'border-[#C41230]/20'
  const bg = variant === 'gold' ? 'bg-amber-50/40' : 'bg-[#C41230]/[0.03]'
  const empty = items.filter((i) => i.trim()).length === 0
  return (
    <div className={`rounded-xl border ${border} ${bg} p-5`}>
      <h3 className="text-base font-bold text-[#0A0A0A] flex items-center gap-2 mb-3">
        <span>{icone}</span> {titre}
      </h3>
      {empty ? (
        <p className="text-sm text-[#999999] italic">{emptyLabel}</p>
      ) : (
        <ul className="space-y-1.5">
          {items.filter((i) => i.trim()).map((it, i) => (
            <li key={i} className="text-sm text-[#333333] leading-relaxed flex gap-2">
              <span className="text-[#C41230] flex-shrink-0">•</span>
              <span>{it}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
