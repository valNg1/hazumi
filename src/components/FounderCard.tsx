import { Link } from 'react-router-dom'

// INC-01 — présence éditoriale discrète du fondateur sur l'Accueil.
// Secondaire : placée en bas de page, elle ne prend pas le dessus sur les usages.
// L'emplacement photo est prêt à recevoir un portrait de Valéry (judoka) quand
// un asset sera disponible — aucune image inventée ni externe pour l'instant.
export default function FounderCard() {
  return (
    <div className="bg-white rounded-xl border border-[#E5E5E5] p-5">
      <span className="text-xs uppercase tracking-widest text-[#999999]">À propos du fondateur de Hazumi</span>

      <div className="flex items-start gap-4 mt-3">
        <div
          className="w-16 h-16 rounded-full bg-[#F0F0F0] border border-[#E5E5E5] flex items-center justify-center text-[#BBBBBB] font-bold text-lg flex-shrink-0"
          aria-hidden="true"
        >
          VN
        </div>
        <div>
          <p className="font-bold text-[#0A0A0A]">Valéry Nguyen</p>
          <p className="text-xs text-[#999999]">Enseignant et compétiteur</p>
          <p className="text-sm text-[#333333] italic mt-2">« Je continue à apprendre le judo autant que je l'enseigne. »</p>
        </div>
      </div>

      <p className="text-sm text-[#666666] mt-3 leading-relaxed">
        Hazumi est né de cette conviction : quel que soit notre niveau, notre âge ou notre rôle sur le
        tatami, il reste toujours quelque chose à comprendre, expérimenter et transmettre.
      </p>

      <Link
        to="/valery-nguyen"
        className="inline-block mt-3 text-sm font-semibold text-[#C41230] hover:text-[#9B0E25] transition-colors"
      >
        Découvrir mon parcours →
      </Link>
    </div>
  )
}
