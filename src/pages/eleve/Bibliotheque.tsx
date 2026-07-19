import { Link } from 'react-router-dom'

// Page transitoire (WP 1.1). Elle donne acces aux contenus existants sans
// prejuger de la Bibliotheque cible, qui fera l'objet d'un WP dedie.
const ACCES = [
  { to: '/eleve/kyu', icone: '🥋', titre: 'Kyu', description: 'Parcours de progression et contenus personnels.' },
  { to: '/eleve/shiai', icone: '🥊', titre: 'Shiai', description: 'Parcours orientés compétition.' },
  { to: '/eleve/judoka-culture', icone: '🎌', titre: 'Judo-Ka', description: 'Culture, histoire et philosophie du judo.' },
]

export default function Bibliotheque() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">Bibliothèque</h1>
        <p data-testid="section-intro" className="text-[#666666] text-sm mt-1">
          Retrouve ici l’ensemble des ressources Hazumi et tes contenus personnels. La recherche et
          les filtres arriveront dans une prochaine étape.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {ACCES.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="bg-white rounded-xl border border-[#E5E5E5] p-5 hover:border-[#C41230] transition-colors"
          >
            <span className="text-2xl leading-none">{a.icone}</span>
            <h2 className="text-sm font-bold text-[#0A0A0A] mt-2">{a.titre}</h2>
            <p className="text-xs text-[#666666] leading-relaxed mt-1">{a.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
