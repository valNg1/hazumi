import { Link } from 'react-router-dom'

export default function Enseignant() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#666666] mb-2">
          Espace Enseignant
        </p>

        <h1 className="text-3xl font-bold text-[#0A0A0A] mb-4">
          Continuer à progresser dans l'art d'enseigner le judo
        </h1>

        <p className="text-lg text-[#666666] max-w-3xl">
          Des parcours et des ressources pour bien démarrer, enrichir
          et renouveler sa pratique d'enseignant.
        </p>
      </header>

      {/* Mes parcours */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-sm font-bold text-[#0A0A0A]">
            Mes parcours
          </h2>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#666666]">
            Perso
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="bg-white rounded-xl border border-dashed border-[#CCCCCC] p-6 min-h-[220px] flex flex-col justify-center">
            <p className="font-semibold text-[#0A0A0A]">
              Tu n'as pas encore de parcours enseignant.
            </p>

            <p className="text-sm text-[#666666] mt-2">
              Tu pourras créer tes propres parcours à partir des ressources
              de l'Espace Enseignant.
            </p>

            <button
              type="button"
              disabled
              className="mt-5 text-sm font-semibold text-[#999999] text-left"
            >
              + Créer un parcours
            </button>
          </div>
        </div>
      </section>

      {/* Parcours Hazumi */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-sm font-bold text-[#0A0A0A]">
            Parcours Hazumi
          </h2>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#666666]">
            Officiel
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Link to="/enseignant/patrick-roux-progression-randori" className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden flex flex-col hover:border-[#CCCCCC] hover:shadow-sm transition-all">
            <div className="aspect-[16/9] bg-[#F5F5F5] overflow-hidden">
              <img
                src="https://img.youtube.com/vi/Pa-XftyNS-0/hqdefault.jpg"
                alt="Patrick Roux — Tandoku Renshu, Sotai Renshu, Randori"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-4 flex flex-col flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#C41230] mb-2">
                Fondation
              </p>

              <h3 className="font-bold text-[#0A0A0A]">
                Patrick Roux — Tandoku Renshu, Sotai Renshu, Randori
              </h3>

              <p className="text-sm text-[#666666] mt-2">
                Une ressource fondatrice pour réfléchir à la pratique,
                à l'apprentissage et à la transmission du judo.
              </p>

              <div className="mt-auto pt-5">
                <div className="flex items-center justify-between text-xs text-[#666666] mb-2">
                  <span>1 ressource</span>
                  <span>Non commencé</span>
                </div>

                <div className="h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
                  <div className="h-full bg-[#C41230] rounded-full w-0" />
                </div>

                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#C41230]">
                  ▶ Ouvrir la ressource
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>
    </div>
  )
}