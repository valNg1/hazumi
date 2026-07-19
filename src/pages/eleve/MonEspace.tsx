import { Link } from 'react-router-dom'
import MonEspaceNav from '../../components/MonEspaceNav'

// Page transitoire (WP 1.1). Elle regroupe les acces aux fonctions personnelles
// existantes sans anticiper la refonte de Mon espace, prevue dans un WP dedie.
const ACCES = [
  { to: '/eleve/entrainements', icone: '📅', titre: 'Mes entraînements', description: 'Séances planifiées, réalisées et volume d’entraînement.' },
  { to: '/eleve/agenda', icone: '🗓️', titre: 'Mon agenda', description: 'Compétitions, passages de grade, stages et événements.' },
  { to: '/eleve/messages', icone: '✉️', titre: 'Messages', description: 'Tes échanges au sein de Hazumi.' },
  { to: '/eleve/progression', icone: '📈', titre: 'Ma progression', description: 'Techniques maîtrisées et avancement.' },
  { to: '/eleve/profil', icone: '👤', titre: 'Mon profil', description: 'Informations personnelles et affiliation au club.' },
]

export default function MonEspace() {
  return (
    <div>
      <MonEspaceNav />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">Mon espace</h1>
        <p data-testid="section-intro" className="text-[#666666] text-sm mt-1">
          Tout ce qui t’appartient en propre : ta pratique, ton agenda, tes échanges et tes
          réglages.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ACCES.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="bg-white rounded-xl border border-[#E5E5E5] p-5 hover:border-[#C41230] transition-colors flex items-start gap-3"
          >
            <span className="text-xl leading-none flex-shrink-0">{a.icone}</span>
            <div>
              <h2 className="text-sm font-bold text-[#0A0A0A]">{a.titre}</h2>
              <p className="text-xs text-[#666666] leading-relaxed mt-0.5">{a.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
