import { Link } from 'react-router-dom'

// INC-01 — page fondateur. Récit à la première personne, sobre : un pratiquant
// qui continue d'apprendre, pas un CV. Réutilise les styles éditoriaux Hazumi.

function Mouvement({ index, titre, children }: { index: string; titre: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-xl border border-[#E5E5E5] p-6 sm:p-8">
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-xs font-bold tabular-nums text-[#C41230]">{index}</span>
        <span className="text-xs uppercase tracking-widest text-[#999999]">{titre}</span>
      </div>
      <div className="space-y-4 text-[15px] leading-relaxed text-[#333333]">{children}</div>
    </section>
  )
}

function Expert({ nom, role, children }: { nom: string; role: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] p-4">
      <p className="font-bold text-[#0A0A0A] text-sm">{nom}</p>
      <p className="text-[11px] uppercase tracking-widest text-[#C41230] font-semibold mt-0.5">{role}</p>
      <p className="text-sm text-[#333333] leading-relaxed mt-2">{children}</p>
    </div>
  )
}

export default function ValeryNguyen() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-4">
      <Link to="/" className="text-xs uppercase tracking-widest text-[#C41230] hover:text-[#9B0E25] font-semibold">
        ← Accueil
      </Link>

      {/* Hero */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-6 sm:p-8">
        <div className="flex items-center gap-4 mb-5">
          <div
            className="w-20 h-20 rounded-full bg-[#F0F0F0] border border-[#E5E5E5] flex items-center justify-center text-[#BBBBBB] font-bold text-2xl flex-shrink-0"
            aria-hidden="true"
          >
            VN
          </div>
          <div>
            <p className="text-2xl font-bold text-[#0A0A0A] tracking-tight">Valéry Nguyen</p>
            <p className="text-sm text-[#999999]">Enseignant · compétiteur · fondateur de Hazumi</p>
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0A0A0A] tracking-tight leading-snug">
          Construire son judo tout au long de sa vie.
        </h1>
        <p className="text-[15px] text-[#666666] leading-relaxed mt-3">
          Je ne me raconte pas comme un parcours qui s'achève, mais comme une pratique qui continue.
          Voici, en quatre mouvements, ce que le judo m'a appris — et pourquoi Hazumi en est né.
        </p>
      </div>

      <Mouvement index="01" titre="Apprendre">
        <p>
          J'ai commencé le judo vers six ans. Très vite, il est devenu bien plus qu'un sport : une façon
          d'apprendre à bouger, à tomber et à me relever. Je me suis formé notamment auprès de
          Christian Dyot, dans un environnement de haut niveau où l'on cultivait le beau geste, le
          mouvement et le ippon autant que le résultat.
        </p>
        <p>
          J'ai pratiqué en compétition, jusqu'à une 3ᵉ place au championnat de France cadets, avant
          d'arrêter en 1988. Sur les tatamis, j'ai croisé de futurs grands judokas — je pense notamment
          à Darcel Yandzi.
        </p>
        <p>
          Ce que je retiens de ces années n'est pas un palmarès, mais une exigence : j'ai appris le judo
          comme une pratique où la qualité du mouvement compte autant que la victoire.
        </p>
      </Mouvement>

      <Mouvement index="02" titre="Explorer">
        <p>
          En quittant les tatamis en 1988, je n'ai pas arrêté de bouger. Pendant ces années, j'ai
          continué à pratiquer, autrement.
        </p>
        <p>
          J'ai joué au <strong className="font-semibold text-[#0A0A0A]">rugby</strong> à un bon niveau,
          en championnat National 3 avec Noisy-le-Grand, jusqu'à une tournée en Afrique du Sud. J'y ai
          découvert l'esprit de groupe, le discours d'un coach de haut niveau, les schémas de jeu — et
          surtout l'altérité : sur un terrain, les gabarits et les rôles sont très différents, mais
          chacun a sa place dans le collectif.
        </p>
        <p>
          Le <strong className="font-semibold text-[#0A0A0A]">surf</strong> a aussi pris de l'importance,
          notamment lors de mes retours en Bretagne. Ce n'est pas une parenthèse : c'est un autre rapport
          au mouvement, à l'adaptation et à la disponibilité — une autre manière d'habiter son corps et
          son environnement.
        </p>
        <p>
          Le judo est resté mon point d'ancrage, mais il n'a jamais été une frontière. Toutes ces
          expériences allaient, plus tard, nourrir ma pratique.
        </p>
      </Mouvement>

      <Mouvement index="03" titre="Revenir">
        <p>
          Je suis revenu au judo en 2020. Pas pour retrouver le judoka que j'étais en 1988 : pour
          construire celui que je peux devenir aujourd'hui.
        </p>
        <p>
          Ce retour s'appuie sur d'autres qualités : plus de souplesse, d'observation, de sensations, de
          mobilité, l'anticipation du déplacement d'Uke — et la nécessité de préserver mon corps pour
          durer. J'ai surtout compris une chose : progresser, c'est aussi savoir s'entourer et accepter
          l'expertise des autres.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <Expert nom="Arthur Clerget" role="Récupération et sensation">
            Arthur m'aide à mieux récupérer et me ressourcer. Son judo de très haut niveau, porté sur la
            sensation, nourrit ma réflexion sur ma propre pratique.
          </Expert>
          <Expert nom="Laurent Messeguer" role="Préparation mentale">
            Préparateur mental de champions et ancien athlète de haut niveau, il m'aide à structurer ma
            préparation mentale et à me concentrer sur l'essentiel, au-delà des enjeux et de la pression.
          </Expert>
          <Expert nom="Serge Borowski" role="Préparation physique">
            Kinésithérapeute et préparateur physique du Basket Club de Gennevilliers, il m'accompagne dans
            ma préparation physique et dans la récupération après les blessures. Progresser avec l'âge,
            c'est aussi apprendre à durer.
          </Expert>
          <Expert nom="Cyrielle Mingot" role="Technique et singularité">
            Professeure de judo à Garches, elle m'accompagne jusqu'au titre de champion de France
            vétérans 2026. Elle ne cherche pas à imposer un modèle : elle adapte son discours à mon judo
            et renforce ma singularité, notamment ma mobilité.
          </Expert>
        </div>
        <p>
          J'ai aussi commencé le <strong className="font-semibold text-[#0A0A0A]">Jiu-Jitsu Brésilien</strong>,
          depuis 2023 — notamment lors de camps d'été à Paris — et à la Fédération de Judo depuis 2026.
          Le JJB ne remplace pas mon judo et ne le corrige pas. Au contraire : tout cela nourrit mon
          judo, sans le remplacer.
        </p>
        <blockquote className="border-l-2 border-[#C41230] pl-4 text-[#0A0A0A] font-semibold italic">
          On développe un judo total en allant à la rencontre des autres, dans leur sport, avec humilité.
        </blockquote>
      </Mouvement>

      <Mouvement index="04" titre="Transmettre">
        <p>
          Peu à peu, revenir à la pratique m'a conduit à enseigner. J'ai voulu poser un cadre pédagogique
          et technique sur une expérience jusque-là largement construite par la pratique.
        </p>
        <p>
          J'enseigne aujourd'hui à des publics différents, de l'éveil aux adultes. Je cherche un judo
          global — technique, physique, psychologique et humain — et je crois surtout aux situations qui
          permettent à l'élève d'expérimenter, plutôt qu'à la simple démonstration d'une solution.
        </p>
        <p>
          Je continue moi-même à pratiquer et à apprendre en enseignant. La compétition vétéran en fait
          partie : vice-champion d'Europe vétérans 2025, puis champion de France vétérans 2026 (M6
          −73 kg). Mais le résultat n'est pas une conclusion : ce qui compte, c'est de continuer à
          s'engager, apprendre et progresser année après année, quel que soit son niveau ou son âge.
        </p>
      </Mouvement>

      {/* Pourquoi Hazumi */}
      <section className="bg-white rounded-xl border border-[#E5E5E5] p-6 sm:p-8">
        <span className="text-xs uppercase tracking-widest text-[#999999]">Pourquoi Hazumi</span>
        <div className="space-y-4 text-[15px] leading-relaxed text-[#333333] mt-4">
          <p>
            Hazumi est né, progressivement, de cette trajectoire : apprendre, pratiquer, explorer,
            revenir, s'entourer, enseigner, continuer à apprendre, transmettre.
          </p>
          <p>
            C'est une manière de structurer et de partager cette démarche. Hazumi ne prétend pas détenir
            « la méthode ». La plateforme met en relation des ressources, des experts, des regards
            différents, des expériences et des parcours de progression — puis aide chacun à construire
            son propre judo.
          </p>
          <blockquote className="border-l-2 border-[#C41230] pl-4 text-[#0A0A0A] font-semibold">
            Je continue à apprendre le judo autant que je l'enseigne.<br />
            Construire son judo tout au long de sa vie.
          </blockquote>
        </div>
      </section>
    </div>
  )
}
