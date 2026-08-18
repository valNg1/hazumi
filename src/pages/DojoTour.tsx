import { Link } from 'react-router-dom'

interface Dojo {
  name: string
  city: string
  discipline: string
}

const dojos: Dojo[] = [
  { name: 'Institut du Judo', city: 'Paris', discipline: 'Judo' },
  { name: 'Judo Club de Lagny-sur-Marne', city: 'Lagny-sur-Marne', discipline: 'Judo' },
  { name: 'Judo Club de Suresnes', city: 'Suresnes', discipline: 'Judo' },
  { name: 'Rueil-Malmaison', city: 'Rueil-Malmaison', discipline: 'Judo' },
  { name: 'La Celle-Saint-Cloud', city: 'La Celle-Saint-Cloud', discipline: 'Kata / Judo' },
  { name: 'Saint-Germain-en-Laye', city: 'Saint-Germain-en-Laye', discipline: 'Judo' },
  { name: 'The Budokwai', city: 'Londres', discipline: 'Judo' },
  { name: 'Dojo Nantais', city: 'Nantes', discipline: 'Judo' },
  { name: 'Judo Club de Quiberon', city: 'Quiberon', discipline: 'JJB / Judo' },
  { name: 'RNK Paris', city: 'Paris', discipline: 'JJB' },
  { name: 'JAP', city: 'Paris', discipline: 'Judo' },
  { name: 'Palestra Ginnastica Fiorentina', city: 'Florence', discipline: 'Judo' },
]

export default function DojoTour() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link
        to="/a-propos"
        className="inline-flex text-sm font-semibold text-[#666666] hover:text-[#C41230] mb-8"
      >
        ← À propos
      </Link>

      <header className="mb-10 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#C41230] mb-3">
          Carnet de pratique
        </p>

        <h1 className="text-3xl sm:text-4xl font-bold text-[#0A0A0A] mb-4">
          Le tour du monde des dojos
        </h1>

        <p className="text-lg text-[#555555] leading-relaxed">
          Les dojos dans lesquels j’ai eu l’occasion de pratiquer. Chaque lieu
          apporte une culture, des partenaires et une manière différente
          d’aborder le judo.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {dojos.map((dojo) => (
          <article
            key={`${dojo.name}-${dojo.city}`}
            className="bg-white border border-[#E5E5E5] rounded-xl p-5"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#C41230] mb-2">
              {dojo.discipline}
            </p>

            <h2 className="font-bold text-[#0A0A0A]">
              {dojo.name}
            </h2>

            <p className="text-sm text-[#666666] mt-1">
              {dojo.city}
            </p>

            <div className="border-t border-[#F0F0F0] mt-4 pt-4">
              <p className="text-xs text-[#999999]">
                Fiche dojo à compléter
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
