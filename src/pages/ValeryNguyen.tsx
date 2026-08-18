import { Link } from 'react-router-dom'

export default function ValeryNguyen() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link
        to="/a-propos"
        className="inline-flex items-center text-sm font-semibold text-[#666666] hover:text-[#C41230] mb-8"
      >
        ← À propos
      </Link>

      <section className="border-t border-[#E5E5E5] pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#666666] mb-3">
              Le fondateur
            </p>

            <h1 className="text-3xl sm:text-4xl font-bold text-[#0A0A0A] mb-2">
              Valéry Nguyen
            </h1>

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
                le rugby, le surf et plus récemment le Jiu-Jitsu Brésilien.
              </p>

              <p className="font-semibold text-[#0A0A0A]">
                Tout cela nourrit mon judo, sans le remplacer.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#E5E5E5] bg-[#F5F5F5]">
            <img
              src="/images/founder/valery-nguyen-judo.jpg"
              alt="Valéry Nguyen en compétition de judo"
              className="w-full aspect-[4/5] object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mt-12 border-t border-[#E5E5E5] pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 items-start">
          <div>
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
                transformation digitale m’amène à structurer des parcours,
                articuler différents formats et accompagner des publics très
                différents dans le temps.
              </p>

              <p>
                C’est probablement ce que j’apporte le plus directement à Hazumi :
                une attention particulière à la manière dont on construit une
                expérience d’apprentissage et dont on prolonge le travail réalisé
                sur le tatami.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#E5E5E5] bg-[#F5F5F5]">
            <img
              src="/images/founder/valery-nguyen-enseignement.jpg"
              alt="Valéry Nguyen en situation d’enseignement"
              className="w-full aspect-[4/5] object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#666666] mb-2">
            Judo
          </p>
          <p className="font-bold text-[#0A0A0A]">3e dan</p>
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
            3e au Championnat de France vétérans 2025
          </p>
          <p className="text-sm text-[#666666] mt-1">
            Vice-champion d’Europe vétérans 2025
          </p>
          <p className="text-sm text-[#666666] mt-1">
            Vice-champion de France vétérans 2024
          </p>
          <p className="text-sm text-[#666666] mt-1">
            3e au Championnat de France cadets par équipes de club 1988
            (Lagny-sur-Marne)
          </p>
          <p className="text-sm text-[#666666] mt-1">
            3e au Championnat de France cadets 1986
          </p>
          <p className="text-sm text-[#666666] mt-1">
            3e au Championnat de France cadets 1985
          </p>
          <p className="text-sm text-[#666666] mt-1">
            3e au Championnat de France minimes 1984
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