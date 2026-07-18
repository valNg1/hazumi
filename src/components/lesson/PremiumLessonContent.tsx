import type { PremiumLessonContent } from '../../lib/lessonPremium'
import Timeline from './Timeline'
import Checklist from './Checklist'
import PrincipleCard from './PrincipleCard'
import SeriesCard from './SeriesCard'
import MemoryCard from './MemoryCard'
import Callout from './Callout'

interface Props {
  content: PremiumLessonContent
  resourceIdByTitle: Record<string, string>
  onOpenTechnique: (ressourceId: string) => void
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white rounded-xl border border-[#E5E5E5] p-5">{children}</div>
}
function SectionTitle({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-bold text-[#0A0A0A] mb-3 flex items-center gap-2">
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0A0A0A] text-white text-xs font-bold flex items-center justify-center">{n}</span>
      {children}
    </h2>
  )
}
function SubTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] uppercase tracking-widest text-[#999999] mb-2 mt-5 first:mt-0">{children}</p>
}
function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((it, i) => (
        <li key={i} className="text-sm text-[#333333] leading-relaxed flex gap-2">
          <span className="text-[#C41230] flex-shrink-0">•</span><span>{it}</span>
        </li>
      ))}
    </ul>
  )
}

export default function PremiumLessonContentView({ content, resourceIdByTitle, onOpenTechnique }: Props) {
  return (
    <div className="space-y-6">
      {/* Objectif (intro, non numerote) */}
      <Card>
        <h2 className="text-lg font-bold text-[#0A0A0A] mb-2">🎯 Objectif</h2>
        <p className="text-sm text-[#333333] mb-2">{content.objectifIntro}</p>
        <Bullets items={content.objectifs} />
      </Card>

      {/* 1. Pourquoi ce kata ? */}
      <Card>
        <SectionTitle n={1}>Pourquoi ce kata ?</SectionTitle>
        <SubTitle>Du Kodokan à aujourd'hui</SubTitle>
        <Timeline steps={content.pourquoi.timeline} />
        {content.pourquoi.blocs.map((b) => (
          <div key={b.titre} className="mt-4">
            <p className="text-sm font-semibold text-[#0A0A0A] mb-1">{b.titre}</p>
            <p className="text-sm text-[#333333] leading-relaxed">{b.texte}</p>
          </div>
        ))}
        <SubTitle>Les principes, illustrés dans le kata</SubTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {content.pourquoi.principes.map((p) => <PrincipleCard key={p.titre} principe={p} />)}
        </div>
      </Card>

      {/* 2. Ce que le jury attend */}
      <Card>
        <SectionTitle n={2}>Ce que le jury attend</SectionTitle>
        <Checklist items={content.jury} />
      </Card>

      {/* 3. Les repères sur le tatami */}
      <Card>
        <SectionTitle n={3}>Les repères sur le tatami</SectionTitle>
        {content.reperes.map((g) => (
          <div key={g.titre}>
            <SubTitle>{g.titre}</SubTitle>
            <Bullets items={g.items} />
          </div>
        ))}
      </Card>

      {/* 4. Les trois séries du premier dan */}
      <Card>
        <SectionTitle n={4}>Les trois séries du premier dan</SectionTitle>
        <div className="grid grid-cols-1 gap-3">
          {content.series.map((s, i) => (
            <SeriesCard key={s.nom} serie={s} index={i} resourceIdByTitle={resourceIdByTitle} onOpenTechnique={onOpenTechnique} />
          ))}
        </div>
      </Card>

      {/* 5. Le regard de l'examinateur */}
      <div>
        <SectionTitle n={5}>Le regard de l'examinateur</SectionTitle>
        <Callout icone="⭐" titre="En synthèse" items={content.regardExaminateur} variant="gold"
          emptyLabel="Synthèse à venir." />
      </div>

      {/* 6. Le conseil de l'expert */}
      <div>
        <SectionTitle n={6}>Le conseil de l'expert</SectionTitle>
        <Callout icone="💡" titre="" items={content.conseilExpert} variant="red"
          emptyLabel="Cette section sera alimentée à partir de sources expertes (enseignants, hauts gradés)." />
      </div>

      {/* 7. À retenir */}
      <div>
        <SectionTitle n={7}>À retenir</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {content.aRetenir.map((c, i) => <MemoryCard key={i} index={i} contenu={c} />)}
        </div>
      </div>
    </div>
  )
}
