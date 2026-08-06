// Section « À propos » affichée sur la page d'accueil d'un parcours issu du
// programme Excellence Judo (avant l'ouverture de la leçon). Elle apporte le
// contexte de la vidéo — qui, elle, se concentre sur les techniques.
export default function AProposExcellence() {
  return (
    <section className="bg-white rounded-xl border border-[#E5E5E5] p-5">
      <span className="text-[10px] uppercase tracking-widest text-[#999999]">À propos</span>
      <h2 className="text-lg font-bold text-[#0A0A0A] mb-2">À propos de ce parcours</h2>
      <div className="text-sm text-[#333333] leading-relaxed space-y-3">
        <p>
          Les vidéos de ce parcours sont issues du programme <strong>Excellence Judo</strong> de la
          Fédération française de judo, dirigé par <strong>Frédéric Demontfaucon</strong>.
        </p>
        <p>
          Frédéric Demontfaucon a été <strong>champion du monde</strong> des −90 kg à Munich en 2001
          et <strong>médaillé de bronze olympique</strong> à Sydney en 2000. Double champion d'Europe,
          il met aujourd'hui son expérience du très haut niveau au service de la formation des judokas.
        </p>
        <p className="text-xs text-[#999999]">
          La vidéo se concentre sur les techniques ; cette page en apporte le contexte.
        </p>
      </div>
    </section>
  )
}
