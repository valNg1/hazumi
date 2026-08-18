import { Link } from 'react-router-dom'

const sections = [
  {
    to: '/a-propos/pourquoi-hazumi',
    eyebrow: 'La démarche',
    title: 'Pourquoi Hazumi',
    description:
      'Pourquoi prolonger l’apprentissage du judo avant et après le tatami, et quelle pratique Hazumi cherche à développer.',
  },
  {
    to: '/a-propos/bien-utiliser-hazumi',
    eyebrow: 'Mode d’emploi',
    title: 'Bien utiliser Hazumi',
    description:
      '10 bonnes pratiques pour faire du travail hors dojo un véritable prolongement de l’entraînement.',
  },
  {
    to: '/valery-nguyen',
    eyebrow: 'Le fondateur',
    title: 'Valéry Nguyen',
    description:
      'Judoka, enseignant et professionnel de la transformation digitale : les expériences qui nourrissent Hazumi.',
  },
  {
    to: '/a-propos/dojos',
    eyebrow: 'Carnet de pratique',
    title: 'Le tour du monde des dojos',
    description:
      'Les dojos dans lesquels j’ai pratiqué, ce que j’y ai trouvé et quelques informations utiles pour y aller.',
  },
]

export default function APropos() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-10 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#C41230] mb-3">
          À propos
        </p>

        <h1 className="text-3xl sm:text-4xl font-bold text-[#0A0A0A] mb-4">
          Comprendre la démarche Hazumi
        </h1>

        <p className="text-lg text-[#555555] leading-relaxed">
          Hazumi prolonge le travail du dojo : comprendre, revoir, expérimenter
          et continuer à construire son judo dans le temps.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {sections.map((section) => (
          <Link
            key={section.to}
            to={section.to}
            className="bg-white border border-[#E5E5E5] rounded-xl p-6 hover:border-[#CCCCCC] hover:shadow-sm transition-all"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#C41230] mb-2">
              {section.eyebrow}
            </p>

            <h2 className="text-xl font-bold text-[#0A0A0A] mb-3">
              {section.title}
            </h2>

            <p className="text-sm text-[#666666] leading-relaxed">
              {section.description}
            </p>

            <p className="mt-5 text-sm font-semibold text-[#C41230]">
              Découvrir →
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}