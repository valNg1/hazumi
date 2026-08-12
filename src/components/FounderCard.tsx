import { Link } from 'react-router-dom'

export default function FounderCard() {
  return (
    <div className="bg-white rounded-xl border border-[#E5E5E5] p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#666666]">
        À propos du fondateur de Hazumi
      </p>

      <div className="flex items-start gap-4 mt-3">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-[#0A0A0A]">
            Valéry Nguyen
          </h2>

          <p className="text-sm text-[#666666]">
            Enseignant et compétiteur
          </p>

          <p className="text-sm text-[#333333] italic mt-2">
            « Faire évoluer son judo pour pouvoir le pratiquer toute sa vie. »
          </p>
        </div>
      </div>

      <p className="text-sm text-[#555555] mt-3 leading-relaxed">
        Hazumi prolonge le travail du tatami avant et après l’entraînement, pour aider chacun
        à comprendre, expérimenter et faire évoluer sa pratique — qu’il soit compétiteur
        ou judoka loisir.
      </p>

      <Link
        to="/valery-nguyen"
        className="inline-block mt-4 text-sm font-semibold text-[#C41230] hover:underline"
      >
        Découvrir mon parcours →
      </Link>
    </div>
  )
}