import type { PremiumLessonContent } from '../../lib/lessonPremium'
import Timeline from './Timeline'
import Checklist from './Checklist'
import PrincipleCard from './PrincipleCard'
import SeriesCard from './SeriesCard'
import MemoryCard from './MemoryCard'
import Callout from './Callout'

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white rounded-xl border border-[#E5E5E5] p-5">{children}</div>
}
function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-bold text-[#0A0A0A] mb-3">{children}</h2>
}
function SubTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] uppercase tracking-widest text-[#999999] mb-2 mt-4 first:mt-0">{children}</p>
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

export default function PremiumLessonContentView({ content }: { content: PremiumLessonContent }) {
  return (
    <div className="space-y-6">
      {/* Objectif */}
      <Card>
        <H2>🎯 Objectif</H2>
        <p className="text-sm text-[#333333] leading-relaxed">{content.objectif}</p>
      </Card>

      {/* Pourquoi ce kata */}
      <Card>
        <H2>Pourquoi ce kata ?</H2>
        <SubTitle>Une histoire, du Kodokan à aujourd'hui</SubTitle>
        <Timeline steps={content.pourquoi.timeline} />

        <div className="mt-4 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] p-4">
          <p className="text-sm font-semibold text-[#0A0A0A] mb-2">Pourquoi étudier ce kata ?</p>
          <Bullets items={content.pourquoi.pourquoiEtudier} />
        </div>

        <SubTitle>Ce que ce kata développe</SubTitle>
        <div className="flex flex-wrap gap-2">
          {content.pourquoi.developpe.map((d) => (
            <span key={d} className="text-xs px-3 py-1 rounded-full bg-[#C41230]/5 text-[#C41230] border border-[#C41230]/15 font-medium">{d}</span>
          ))}
        </div>
      </Card>

      {/* Les principes du judo */}
      <Card>
        <H2>Les principes du judo</H2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {content.principes.map((p) => <PrincipleCard key={p.titre} principe={p} />)}
        </div>
      </Card>

      {/* Ce que le jury attend */}
      <Card>
        <H2>Ce que le jury attend</H2>
        <Checklist items={content.jury} />
      </Card>

      {/* Les points clés */}
      <Card>
        <H2>Les points clés</H2>
        <SubTitle>Le cérémonial</SubTitle>
        <Bullets items={content.pointsCles.ceremonial} />
        <SubTitle>Joséki</SubTitle>
        <Bullets items={content.pointsCles.joseki} />
        <SubTitle>Les distances</SubTitle>
        <Bullets items={content.pointsCles.distances} />
        <SubTitle>Les déplacements</SubTitle>
        <Bullets items={content.pointsCles.deplacements} />

        <SubTitle>Les cinq séries</SubTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {content.pointsCles.series.map((s, i) => <SeriesCard key={s.nom} serie={s} index={i} />)}
        </div>
      </Card>

      {/* Le regard de l'examinateur */}
      <Callout icone="⭐" titre="Le regard de l'examinateur" items={content.regardExaminateur} variant="gold"
        emptyLabel="Des conseils pratiques destinés au candidat seront ajoutés ici." />

      {/* Conseils Hazumi */}
      <Callout icone="💡" titre="Conseils Hazumi" items={content.conseils} variant="red"
        emptyLabel="Les conseils Hazumi seront ajoutés ici." />

      {/* À retenir */}
      <div>
        <H2>À retenir</H2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {content.aRetenir.map((c, i) => <MemoryCard key={i} index={i} contenu={c} />)}
        </div>
      </div>
    </div>
  )
}
