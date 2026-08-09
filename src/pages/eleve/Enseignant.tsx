export default function Enseignant() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <header className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">
          Espace Enseignant
        </p>

        <h1 className="text-3xl font-bold mb-4">
          Continuer à progresser dans l'art d'enseigner le judo
        </h1>

        <p className="text-lg text-gray-600 max-w-3xl">
          Des parcours et des ressources pour bien démarrer, enrichir
          et renouveler sa pratique d'enseignant.
        </p>
      </header>

      <section>
        <h2 className="text-xl font-bold mb-4">
          Parcours enseignants
        </h2>

        <div className="border rounded-xl p-6">
          <p className="font-semibold">
            Les premiers parcours arrivent bientôt.
          </p>

          <p className="text-gray-600 mt-2">
            Cet espace réunira des ressources sélectionnées pour accompagner
            la progression des enseignants tout au long de leur pratique.
          </p>
        </div>
      </section>
    </div>
  )
}
