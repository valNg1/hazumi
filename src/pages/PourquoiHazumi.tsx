import { Link } from 'react-router-dom'

export default function PourquoiHazumi() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        to="/a-propos"
        className="inline-flex text-sm font-semibold text-[#666666] hover:text-[#C41230] mb-8"
      >
        ← À propos
      </Link>

      <p className="text-xs font-semibold uppercase tracking-wide text-[#C41230] mb-3">
        Pourquoi Hazumi
      </p>

      <h1 className="text-3xl sm:text-4xl font-bold text-[#0A0A0A] mb-8">
        Prolonger le travail du tatami
      </h1>

      <div className="space-y-6 text-[#444444] text-base sm:text-lg leading-relaxed">
        <p className="font-semibold text-[#0A0A0A]">
          Le judo est à la croisée des chemins.
        </p>

        <p>
          Comme d’autres sports avant lui, ses méthodes d’entraînement et
          d’apprentissage évoluent. Préparation physique, préparation mentale,
          vidéo et analyse permettent aujourd’hui de prolonger le travail réalisé
          pendant l’entraînement.
        </p>

        <p>
          Hazumi s’inscrit dans ce mouvement. La plateforme permet au judoka de
          continuer à travailler avant et après le dojo : revoir une situation,
          comprendre une intention, préparer sa prochaine séance et conserver les
          ressources qui nourrissent sa progression.
        </p>

        <p className="font-semibold text-[#0A0A0A]">
          Faire évoluer son judo pour pouvoir le pratiquer toute sa vie.
        </p>

        <p>
          L’intensité, les objectifs et la technique évoluent avec le pratiquant.
          Hazumi s’adresse aussi bien au compétiteur qu’au judoka loisir avec une
          même ambition : continuer à progresser dans le temps.
        </p>

        <div className="border-l-4 border-[#C41230] pl-5 py-2 my-8">
          <p className="font-semibold text-[#0A0A0A]">
            Un choix de judo assumé
          </p>

          <p className="mt-2">
            Les parcours Hazumi privilégient la recherche du mouvement, du geste
            juste et du timing qui conduisent au Ippon.
          </p>
        </div>

        <p>
          Hazumi ne remplace ni le professeur, ni le partenaire, ni le tatami.
          Le numérique devient utile lorsqu’il permet de revoir, comprendre,
          approfondir et organiser ce qui sera ensuite expérimenté dans la pratique.
        </p>
      </div>
    </div>
  )
}