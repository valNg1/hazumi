import { Link } from 'react-router-dom'

const practices = [
  {
    title: 'Partir de ce qui s’est passé au dojo',
    text: 'Reviens sur une situation réellement vécue à l’entraînement plutôt que d’accumuler des techniques.',
  },
  {
    title: 'Limiter le nombre d’objectifs',
    text: 'Choisis une ou deux intentions de travail. Trop d’informations rendent plus difficile leur mise en pratique.',
  },
  {
    title: 'Revoir avant l’entraînement',
    text: 'Quelques minutes suffisent pour remettre en mémoire un déplacement, une réaction ou un point technique.',
  },
  {
    title: 'Revoir après l’entraînement',
    text: 'Reviens sur ce qui a fonctionné, ce qui a résisté et ce que tu veux essayer différemment.',
  },
  {
    title: 'Visualiser le mouvement',
    text: 'Reconstruis mentalement la situation, les déplacements et les sensations recherchées.',
  },
  {
    title: 'Transformer une idée en intention',
    text: 'Ne cherche pas à tout retenir. Formule une intention simple à tester lors de la prochaine séance.',
  },
  {
    title: 'Tester sur le tatami',
    text: 'La compréhension intellectuelle ne remplace jamais l’expérience corporelle. Ce que tu apprends ici doit revenir au dojo.',
  },
  {
    title: 'Accepter que la technique évolue',
    text: 'Ton judo change avec ton âge, ton corps, tes partenaires et ton expérience. Il n’a pas vocation à rester figé.',
  },
  {
    title: 'Revenir aux fondamentaux',
    text: 'Posture, déplacement, équilibre, timing et relation au partenaire restent des sujets de travail quel que soit ton niveau.',
  },
  {
    title: 'Utiliser Hazumi comme un compagnon',
    text: 'Hazumi accompagne l’apprentissage. Le professeur, les partenaires et la pratique restent au centre de la progression.',
  },
]

export default function BienUtiliserHazumi() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link
        to="/a-propos"
        className="inline-flex text-sm font-semibold text-[#666666] hover:text-[#C41230] mb-8"
      >
        ← À propos
      </Link>

      <header className="mb-10 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#C41230] mb-3">
          Bien utiliser Hazumi
        </p>

        <h1 className="text-3xl sm:text-4xl font-bold text-[#0A0A0A] mb-4">
          10 bonnes pratiques de l’entraînement hors dojo
        </h1>

        <p className="text-lg text-[#555555] leading-relaxed">
          Le travail hors dojo n’a de sens que s’il améliore ce que tu
          expérimenteras ensuite sur le tatami.
        </p>
      </header>

      <div className="space-y-4">
        {practices.map((practice, index) => (
          <div
            key={practice.title}
            className="bg-white border border-[#E5E5E5] rounded-xl p-5 flex gap-5"
          >
            <div className="text-[#C41230] font-bold text-lg min-w-8">
              {index + 1}
            </div>

            <div>
              <h2 className="font-bold text-[#0A0A0A]">
                {practice.title}
              </h2>

              <p className="text-sm text-[#666666] mt-2 leading-relaxed">
                {practice.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}