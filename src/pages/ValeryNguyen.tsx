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
            la vidéo ou l’analyse prolongent désormais le travail réalisé
            sur le tatami.
          </p>

          <p>
            Hazumi s’inscrit dans ce mouvement : aider chaque judoka à progresser
            avant et après l’entraînement, à mieux comprendre sa pratique et à
            faire évoluer son judo pour pouvoir le pratiquer toute sa vie.
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

          <div className="space-y-5 text-[#444444] leading-relaxed">
            <p>
              J’ai commencé le judo au Judo Club de Lagny-sur-Marne, dans un
              environnement où la recherche du beau judo et du Ippon occupait
              une place centrale. Très jeune, j’ai eu la chance d’évoluer au
              contact de judokas de très haut niveau, notamment Christian Dyot.
            </p>

            <p>
              Cette culture du mouvement, du geste juste et de l’adaptation
              reste encore aujourd’hui un point d’ancrage de ma pratique.
            </p>

            <p>
              Mon judo s’est ensuite nourri de nombreuses influences. Des
              enseignants comme Frédéric Demontfaucon m’ont beaucoup marqué par
              leur travail sur la sensation, le déplacement et la capacité à
              créer le déséquilibre plutôt qu’à imposer la force.
            </p>

            <p>
              D’autres sports ont aussi nourri ma manière de pratiquer :
              le rugby, pour le collectif, les schémas de jeu et la place de
              chacun ; le surf, pour l’adaptation au mouvement et la recherche
              de relâchement ; plus récemment le Jiu-Jitsu Brésilien, pour
              continuer à explorer d’autres formes de combat et redevenir
              volontairement débutant.
            </p>

            <p className="font-semibold text-[#0A0A0A]">
              Tout cela nourrit mon judo, sans le remplacer.
            </p>

            <p>
              J’aime cette idée d’un judo total : aller à la rencontre d’autres
              pratiques, d’autres enseignants et d’autres expériences avec
              suffisamment d’humilité pour enrichir son propre judo.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-10 border-t border-[#E5E5E5] pt-10">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#666666] mb-3">
            Enseigner et concevoir des expériences d’apprentissage
          </p>

          <div className="space-y-5 text-[#444444] leading-relaxed">
            <p>
              J’enseigne le judo depuis 2023. Cette expérience m’a surtout appris
              qu’enseigner ne consiste pas simplement à montrer une technique :
              il faut créer les situations qui permettent à chacun de la
              comprendre, de la ressentir et de se l’approprier.
            </p>

            <p>
              En parallèle, mon métier de directeur de programmes en
              transformation digitale m’amène depuis de nombreuses années à
              concevoir et piloter des expériences de transformation :
              structurer des parcours, articuler différents formats,
              accompagner l’adoption et aider des publics très différents
              à progresser dans le temps.
            </p>

            <p>
              C’est probablement ce que j’apporte le plus directement à Hazumi :
              une attention particulière à la manière dont on construit un
              parcours d’apprentissage, dont on relie les contenus entre eux et
              dont on prolonge l’expérience au-delà du temps passé sur le tatami.
            </p>

            <p>
              Le numérique n’est donc pas une fin en soi. Il devient utile
              lorsqu’il aide le judoka à revoir, comprendre, approfondir,
              organiser ses ressources et continuer à progresser entre deux
              entraînements.
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