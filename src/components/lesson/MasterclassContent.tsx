import type { MasterclassContent, MasterclassBloc } from '../../lib/masterclass/masterclassContent'

interface Props {
  content: MasterclassContent
  onSeek?: (seconds: number) => void
}

function mmss(s: number): string {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white rounded-xl border border-[#E5E5E5] p-5">{children}</div>
}

function SectionTitle({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <h3 className="text-lg font-bold text-[#0A0A0A] mb-3 flex items-center gap-2">
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0A0A0A] text-white text-xs font-bold flex items-center justify-center">{n}</span>
      {children}
    </h3>
  )
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((it, i) => (
        <li key={i} className="text-sm text-[#333333] leading-relaxed flex gap-2">
          <span className="text-[#C41230] flex-shrink-0">›</span><span>{it}</span>
        </li>
      ))}
    </ul>
  )
}

function BlocRow({ bloc, onSeek }: { bloc: MasterclassBloc; onSeek?: (s: number) => void }) {
  return (
    <div className="rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] p-3">
      <div className="flex items-center justify-between gap-2 mb-1">
        <p className="text-sm font-semibold text-[#0A0A0A]">{bloc.titre}</p>
        {bloc.timestampSeconds !== undefined && onSeek && (
          <button
            onClick={() => onSeek(bloc.timestampSeconds!)}
            className="flex-shrink-0 text-[11px] font-semibold text-[#C41230] hover:text-[#9B0E25] tabular-nums transition-colors"
          >
            ▶ {mmss(bloc.timestampSeconds)}
          </button>
        )}
      </div>
      <p className="text-sm text-[#333333] leading-relaxed whitespace-pre-line">{bloc.texte}</p>
    </div>
  )
}

function Callout({ icone, titre, items, variant }: { icone: string; titre: string; items: string[]; variant: 'red' | 'amber' }) {
  const cls = variant === 'amber'
    ? 'border-amber-200 bg-amber-50/50'
    : 'border-[#C41230]/20 bg-[#C41230]/5'
  return (
    <div className={`rounded-xl border p-5 ${cls}`}>
      {titre && <h4 className="text-sm font-bold text-[#0A0A0A] mb-2 flex items-center gap-2"><span aria-hidden="true">{icone}</span>{titre}</h4>}
      <Bullets items={items} />
    </div>
  )
}

// Rendu d'une masterclass technique (famille Masterclass, distincte des journeys Kata).
export default function MasterclassContentView({ content, onSeek }: Props) {
  const sections: { titre: string; node: React.ReactNode }[] = []
  if (content.prerequis.length) sections.push({ titre: 'Prérequis', node: <Bullets items={content.prerequis} /> })
  if (content.concepts.length) sections.push({ titre: 'Concepts techniques clés', node: <div className="space-y-3">{content.concepts.map((b, i) => <BlocRow key={i} bloc={b} onSeek={onSeek} />)}</div> })
  if (content.explications.length) sections.push({ titre: 'Explications détaillées', node: <div className="space-y-3">{content.explications.map((b, i) => <BlocRow key={i} bloc={b} onSeek={onSeek} />)}</div> })
  if (content.erreurs.length) sections.push({ titre: 'Erreurs fréquentes', node: <Callout icone="⚠" titre="" items={content.erreurs} variant="amber" /> })
  if (content.conseils.length) sections.push({ titre: 'Le conseil de Frédéric Demontfaucon', node: <Callout icone="💡" titre="" items={content.conseils} variant="red" /> })
  if (content.drills.length) sections.push({ titre: "Exercices d'entraînement", node: <div className="space-y-3">{content.drills.map((b, i) => <BlocRow key={i} bloc={b} onSeek={onSeek} />)}</div> })
  if (content.aRetenir.length) sections.push({ titre: 'À retenir', node: <Bullets items={content.aRetenir} /> })

  return (
    <div className="space-y-6">
      {/* Objectifs d'apprentissage (intro) */}
      <Card>
        <h2 className="text-lg font-bold text-[#0A0A0A] mb-2">🎯 Objectifs d'apprentissage</h2>
        {content.meta.objectif && <p className="text-sm text-[#333333] mb-2">{content.meta.objectif}</p>}
        <Bullets items={content.objectifs} />
      </Card>

      {sections.map((s, i) => (
        <Card key={s.titre}>
          <SectionTitle n={i + 1}>{s.titre}</SectionTitle>
          {s.node}
        </Card>
      ))}
    </div>
  )
}
