import { Link } from 'react-router-dom'

export default function ValeryNguyen() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link
        to="/"
        className="inline-flex items-center text-sm font-semibold text-[#666666] hover:text-[#C41230] mb-8"
      >
        ← Retour à l’accueil
      </Link>

      <header className="mb-12">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#C41230] mb-3">
          À propos du fondateur de Hazumi
        </p>

        <h1 className="text-3xl sm:text-4xl font-bold text-[#0A0A0A] mb-4">
          Pourquoi Hazumi ?
        </h1>

        <div className="max-w-3xl space-y-4 text-base sm:text-lg text-[#444444] leading-relaxed">
          <p>
            Le judo est à la croisée des chemins.
          </p>

          <p>
            Comme d’autres sports avant lui, ses méthodes d’entraînement et
            d’apprentissage évoluent. La préparation physique et mentale,
            la vidéo ou l’analyse permettent aujourd’hui de prolonger le
            travail réalisé sur le tatami.
          </p>

          <p>
            C’est dans ce mouvement que s’inscrit Hazumi : donner à chaque
            judoka les moyens de progresser avant et après l’entraînement,
            et de faire évoluer son judo pour pouvoir le pratiquer toute sa vie.
          </p>

          <p>
            Les parcours proposés reflètent un choix assumé : rechercher
            le geste juste, le mouvement et le timing qui conduisent au Ippon.
          </p>

          <p className="font-semibold text-[#0A0A0A]">
            Hazumi ne remplace ni le professeur, ni le partenaire, ni le tatami.
            Il prolonge leur travail.
          </p>
        </div>
      </header>

      <section className="border-t border-[#E5E5E5] pt-10">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#666666] mb-3">
            Le fondateur
          </p>

          <h2 className="text-2xl font-bold text-[#0A0A0A] mb-2">
            Valéry Nguyen
          </h2>

          <p className="text-sm font-semibold text-[#666666] mb-6">
            Judoka, enseignant et fondateur de Hazumi
          </p>

          <div className="space-y-4 text-[#444444] leading-relaxed">
            <p>
              Mon parcours dans le judo n’a rien de linéaire. Ma pratique
              s’est construite et continue de se construire au fil des
              rencontres, de l’enseignement, de la compétition et
              d’expériences venues d’autres univers.
            </p>

            <p>
              J’en retiens surtout une chose :
              <strong className="text-[#0A0A0A]">
                {' '}transmettre permet aussi de continuer à apprendre.
              </strong>
            </p>

            <p>
              C’est cet esprit que je souhaite donner à Hazumi.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#666666] mb-2">
            Judo
          </p>
          <p className="font-bold text-[#0A0A0A]">
            3e dan
          </p>
          <p className="text-sm text-[#666666] mt-1">
            En préparation du 4e dan
          </p>
        </div>

        <div className="bg-white border border-[#E5E5E5] rounded-xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#666666] mb-2">
            Enseignement
          </p>
          <p className="font-bold text-[#0A0A0A]">
            Professeur de judo
          </p>
          <p className="text-sm text-[#666666] mt-1">
            Depuis 2023
          </p>
        </div>

        <div className="bg-white border border-[#E5E5E5] rounded-xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#666666] mb-2">
            Compétition
          </p>
          <p className="font-bold text-[#0A0A0A]">
            Champion de France vétérans 2026
          </p>
          <p className="text-sm text-[#666666] mt-1">
            Vice-champion d’Europe vétérans 2025
          </p>
          <p className="text-sm text-[#666666] mt-1">
            3e au Championnat de France cadets 1988
          </p>
        </div>

        <div className="bg-white border border-[#E5E5E5] rounded-xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#666666] mb-2">
            Parcours professionnel
          </p>
          <p className="font-bold text-[#0A0A0A]">
            Directeur de programmes
          </p>
          <p className="text-sm text-[#666666] mt-1">
            Transformation digitale
          </p>
        </div>
      </section>
    </div>
  )
}