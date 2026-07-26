// Contenu structure des lecons "premium" Hazumi (modele de reference editorial).
// Pilote par ressource_id -> extensible aux futures lecons sans changer l'archi.

import {
  KIME_NO_KATA_TECHNIQUES,
  KIME_NO_KATA_META,
  KIME_NO_KATA_RESSOURCE_ID,
  type TechniqueKime as KimeTechnique,
  type Groupe as KimeGroupe,
} from './kimeNoKata'

export interface PremiumMeta {
  tempsLecture: string
  objectif: string
  niveau: string
  difficulte: number // 1..5
}
export interface TimelineStep { annee: string; label: string }
export interface Bloc { titre: string; texte: string }
export interface PrincipeIllustre { titre: string; technique: string; texte: string }
export interface JuryCritere { critere: string; exemple: string; tori: string; uke: string }
export interface RepereGroupe { titre: string; icone: string; items: string[] }
export interface TechniqueDetail {
  // Décomposition Nage-no-kata (projections)
  miseEnAction?: string
  kuzushi?: string
  tsukuri?: string
  kake?: string
  uke?: string
  erreur?: string
  // Fiche générique (kata de défense : Kime-no-kata) — libellés libres
  fiche?: { label: string; texte: string }[]
}
// ressource = titre catalogue si different ; detail = decomposition redigee par Hazumi
export interface Technique { nom: string; ressource?: string; detail?: TechniqueDetail }
export interface SerieCard { nom: string; objectif: string; techniques: Technique[]; apprend: string }

export interface PremiumLessonContent {
  meta: PremiumMeta
  objectifIntro: string
  objectifs: string[]
  pourquoi: { timeline: TimelineStep[]; blocs: Bloc[]; principes: PrincipeIllustre[] }
  jury: JuryCritere[]
  reperes: RepereGroupe[]
  series: SerieCard[]
  seriesTitre?: string // Titre de la section 4 (défaut : « Les trois séries du premier dan »)
  regardExaminateur: string[]
  conseilExpert: string[]
  aRetenir: string[]
}

export const NAGE_NO_KATA_RESSOURCE_ID = '04375145-35c7-4569-9409-6df8358caa13'

const NAGE_NO_KATA: PremiumLessonContent = {
  meta: {
    tempsLecture: '15 minutes',
    objectif: "Comprendre la logique du Nage-no-kata avant d'apprendre les techniques.",
    niveau: 'Préparation 1er Dan',
    difficulte: 3,
  },
  objectifIntro: "À l'issue de cette leçon, tu seras capable de :",
  objectifs: [
    'comprendre la logique du Nage-no-kata',
    'connaître les principaux repères sur le tatami',
    "assimiler l'enchaînement des techniques",
    'éviter les erreurs les plus courantes',
  ],
  pourquoi: {
    timeline: [
      { annee: '1882-1885', label: 'Premier Nage-no-kata (contenu perdu)' },
      { annee: '1906', label: 'Version actuelle créée par Jigorō Kanō' },
      { annee: "Aujourd'hui", label: 'Référence mondiale du Kodokan' },
    ],
    blocs: [
      {
        titre: 'Pourquoi ce kata est enseigné en premier',
        texte:
          "Le Nage-no-kata rassemble, sous une forme codifiée, ce que le judoka travaille déjà en randori. Chaque technique y est exécutée dans des conditions idéales : attaque annoncée, partenaire coopératif, rythme régulier. Cette épuration permet de se concentrer sur la construction du mouvement plutôt que sur l'opposition. Le judoka apprend ainsi à observer ce qu'il fait, à le nommer et à le corriger. C'est aussi le kata le plus proche du judo pratiqué au quotidien : on y retrouve les projections fondamentales dans leur forme la plus pure. Il constitue donc l'entrée naturelle vers l'étude formelle du judo.",
      },
      {
        titre: 'Le socle du judo debout',
        texte:
          "Le kata couvre les grandes familles de projection : bras, hanche, jambe et sacrifices. En les présentant côte à côte, il donne une vision d'ensemble du judo debout et montre comment chaque famille répond à une situation différente. Le judoka comprend que projeter n'est pas une affaire de force mais de direction : selon l'endroit où le déséquilibre est créé, la technique adaptée change. Travailler ce kata, c'est cartographier son propre judo. Les repères acquis ici se retrouvent ensuite dans toutes les situations de combat.",
      },
      {
        titre: 'Les grands principes qu’il met en évidence',
        texte:
          "Le kata ne se contente pas d'énoncer les principes : il oblige à les appliquer, et cela se voit techniquement. Dans Harai-goshi par exemple, la main de Tori vient se plaquer dans le dos de Uke : c'est ce placement qui amène le poids de Uke sur ses appuis avant et crée le déséquilibre. Sans lui, le balayage de la jambe ne projette rien — Tori n'a plus qu'à forcer, et la technique perd sa forme. Le même constat vaut pour chaque prise : le déséquilibre précède toujours le placement, qui précède la projection. Le judoka fait ainsi l'expérience physique de ce qu'il a entendu en théorie. C'est cette compréhension incarnée que le jury cherche à évaluer, bien plus que la performance athlétique.",
      },
      {
        titre: 'Son intérêt pour le compétiteur',
        texte:
          "Le compétiteur trouve dans le kata un laboratoire du geste juste. Les trois temps — déséquilibre, placement, projection — y sont isolés et répétés jusqu'à devenir automatiques. Le travail à droite puis à gauche développe une symétrie rare en compétition, où l'on s'enferme souvent dans un seul côté. Enfin, la précision exigée affine le sens du timing et de la distance, deux qualités directement transférables au shiai. Beaucoup de hauts gradés considèrent le kata comme un correcteur technique permanent.",
      },
      {
        titre: 'Ce que l’on apprend réellement',
        texte:
          "Au-delà des techniques, le kata enseigne une manière de se comporter : saluer, se placer, regarder, attendre le bon moment, accompagner son partenaire. Il apprend aussi à chuter avec confiance, condition indispensable pour attaquer sans retenue. Il impose enfin une exigence de constance : une technique juste doit l'être à chaque répétition, des deux côtés. C'est cette régularité, plus que la réussite ponctuelle, qui distingue le judoka confirmé.",
      },
    ],
    principes: [
      { titre: 'Ju — adaptation', technique: 'Uki-otoshi', texte: "Tori n'oppose aucune force : il accompagne le déplacement de Uke et abaisse son centre pour que la chute naisse du mouvement lui-même. S'il tire, la technique échoue." },
      { titre: "Seiryoku Zen'yō — meilleur emploi de l'énergie", technique: 'Ippon-seoi-nage', texte: "Tori place son dos sous le centre de gravité de Uke : l'effort est minimal parce que le placement est juste. La puissance vient des jambes et de la position, pas des bras." },
      { titre: 'Jita Kyōei — entraide', technique: 'Rôles de Tori et Uke', texte: "Uke attaque franchement et chute correctement pour permettre à Tori de démontrer ; Tori contrôle la projection pour protéger Uke. Aucun des deux ne progresse sans l'autre." },
      { titre: 'Respect', technique: 'Le cérémonial', texte: "Les saluts encadrent le kata et rappellent que la technique s'exerce dans un cadre. Le respect se lit dans l'attention portée à Joséki, au partenaire et au tatami." },
      { titre: 'Contrôle', technique: 'Uki-goshi', texte: "Tori conserve la saisie de la main (gauche ou droite) pendant toute la projection : c'est elle qui contrôle la chute de Uke. Il ne lâche pas. Le contrôle distingue une projection maîtrisée d'une chute subie." },
    ],
  },
  jury: [
    { critere: 'Sécurité', exemple: 'Kata-guruma', tori: 'Charge Uke dos droit et l’accompagne jusqu’au sol sans jamais le lâcher.', uke: 'Se laisse porter sans se raidir et protège sa tête à la chute.' },
    { critere: 'Rythme', exemple: 'Okuri-ashi-harai', tori: 'Balaie au moment exact où le pied de Uke devient léger, sans à-coup.', uke: 'Se déplace régulièrement pour rendre le temps lisible.' },
    { critere: 'Cérémonial', exemple: 'Ouverture et clôture', tori: 'Salue Joséki puis Uke, prend sa garde sans précipitation.', uke: 'Reproduit les mêmes gestes, au même tempo que Tori.' },
    { critere: 'Contrôle', exemple: 'Uki-goshi', tori: 'Conserve la saisie de la main du début à la fin : elle contrôle la chute, il ne lâche pas.', uke: 'Suit la rotation sans résister ni anticiper.' },
    { critere: 'Précision', exemple: 'Sasae-tsurikomi-ashi', tori: 'Place la plante du pied au point exact, ni trop haut ni trop bas.', uke: 'Avance franchement pour que le blocage soit visible.' },
    { critere: 'Déplacements', exemple: 'Uki-otoshi', tori: 'Recule en ligne, sur des pas réguliers, sans dévier de l’axe.', uke: 'Suit la trajectoire imposée sans raccourcir ses appuis.' },
  ],
  reperes: [
    { titre: 'Joséki', icone: '🎯', items: ["Ne jamais tourner le dos à Joséki (l'examinateur) : règle d'or.", 'Exception : le relevé après une chute, où Uke se relève dans le sens de la chute.', 'Tori est placé à droite de Joséki.'] },
    { titre: 'Distances', icone: '📏', items: ['Face à face au départ : 6 m de talon à talon, 5,50 m d’orteil à orteil.', "Après l'ouverture : les partenaires se retrouvent à l'intérieur des 4 mètres.", "L'ensemble du kata s'effectue à l'intérieur des 6 mètres."] },
    { titre: 'Déplacements', icone: '👣', items: ["Aujourd'hui : Tori s'avance de 2/3, Uke de 1/3 (Uke avance d'environ un mètre).", 'Anciennement : rapprochement en ayumi ashi (deux pas chacun, ou quatre pas pour Tori).', 'Les déplacements restent lisibles, réguliers et orientés.'] },
    { titre: 'Orientation', icone: '🧭', items: ['Le kata se déroule face à Joséki, dans un axe constant.', 'Les retours en position se font sans jamais présenter le dos à Joséki.'] },
    { titre: 'Placements', icone: '📍', items: ['Chaque technique repart de la même position de référence.', 'Tori et Uke se replacent symétriquement avant de changer de côté.'] },
    { titre: 'Cérémonial', icone: '🙇', items: ['Salut debout (ritsurei) vers Joséki, puis salut à genoux (zarei) entre partenaires.', 'Ouverture en kamae : jambe gauche puis jambe droite.', 'La clôture reprend les mêmes saluts, en sens inverse.'] },
  ],
  series: [
    {
      nom: '1re série — Te-waza',
      objectif: 'Découvrir les projections où le bras et l’épaule conduisent le mouvement.',
      techniques: [
        {
          nom: 'Uki-otoshi',
          detail: {
            miseEnAction: "Tori et Uke se font face en garde naturelle et prennent la saisie fondamentale. Uke engage une poussée franche vers l'avant. Tori recule en tsugi-ashi (pas glissés : un pied conduit, l'autre le rejoint) ; Uke le suit en tsugi-ashi vers l'avant, dans le même rythme. Les deux premiers temps ne sont pas des feintes, ils installent le mouvement. C'est sur le troisième temps que Tori agit. Comme toutes les techniques du kata, elle est ensuite exécutée de l'autre côté.",
            kuzushi: "Le déséquilibre ne vient pas d'un à-coup mais de la rupture du rythme installé. Sur le troisième recul, Tori allonge son pas et cesse d'accompagner : Uke, lancé, continue d'avancer alors que le point d'appui qu'il suivait s'est éloigné. Dans le même temps, Tori conduit ses deux mains vers l'avant et vers le bas, en direction du pied avant de Uke. Le poids de Uke passe entièrement sur son appui avant, ses talons se décollent, le buste part devant les hanches : le déséquilibre est vers l'avant, dans le prolongement exact de sa propre marche.",
            tsukuri: "Tori abaisse son centre de gravité en posant un genou au sol, légèrement en dehors de l'axe de progression de Uke, de manière à ouvrir l'espace devant lui. Ce n'est pas une chute contrôlée : la descente est conduite par les jambes, le buste reste droit, les bras conservent exactement la tension installée au moment du kuzushi. Rien ne se relâche entre le déséquilibre et la descente — c'est la continuité qui fait la technique.",
            kake: "Il n'y a pas d'action supplémentaire. La descente du centre de Tori, prolongée par la conduite des mains, achève ce que le déplacement avait commencé : Uke bascule par-dessus son appui avant et tourne vers l'avant. La sensation recherchée est celle d'un vide qui s'ouvre, pas d'une poussée. Tori conserve la saisie et accompagne Uke jusqu'à la fin de la chute.",
            uke: "Uke pousse sincèrement et marche réellement : sans engagement de sa part, il n'y a rien à exploiter et la technique devient un arrachage. Il conserve sa posture, ne se penche pas de lui-même, et suit la conduite des mains sans se raidir. Il chute vers l'avant en frappant le tapis du bras libre. Tori ne lâche pas la saisie : c'est elle qui rend la chute lisible et sûre.",
            erreur: "Tirer avec les bras au lieu de descendre le corps : la chute devient un arrachage et le jury voit immédiatement que le déplacement n'a servi à rien. Autre défaut fréquent : marquer un temps d'arrêt avant de poser le genou, ce qui casse la continuité et prévient Uke.",
          },
        },
        {
          nom: 'Ippon-seoi-nage',
          detail: {
            miseEnAction: "Ici, Uke n'est plus en saisie : il attaque. Il avance et lève le poing au-dessus de la tête pour frapper le sommet du crâne de Tori d'un coup descendant. L'attaque doit être portée avec l'intention d'atteindre la cible — c'est elle qui fournit l'énergie de la projection. Tori ne recule pas : il entre.",
            kuzushi: "Tori se déplace vers l'avant en sortant de l'axe du coup et remonte son avant-bras au contact du bras attaquant pour le dévier vers le haut, sans jamais le bloquer en force. Le mouvement descendant de Uke est prolongé au lieu d'être arrêté : son poids, déjà engagé vers l'avant par le pas d'attaque, passe au-delà de son appui avant et son buste s'incline. Le déséquilibre est obtenu avant même que Tori ait tourné.",
            tsukuri: "Dans la continuité du même temps, Tori pivote sur ses appuis pour amener son dos contre la poitrine de Uke, et engage son bras sous l'aisselle du bras attaquant, coude passé en dessous. Les genoux sont fléchis, le bassin descend nettement sous celui de Uke, les deux pieds à l'intérieur de sa base d'appui. Le dos de Tori est en contact plein : Uke se retrouve chargé, ses talons ne portent plus.",
            kake: "Tori se redresse par l'extension des jambes et fait tourner son buste. Uke passe par-dessus l'épaule et roule vers l'avant. La projection vient du redressement et de la rotation, pas d'un tirage de bras. Tori conserve le contrôle du bras de Uke jusqu'au sol.",
            uke: "Uke porte une attaque réelle et engagée, puis accompagne le chargement sans se raidir. Il conserve le contact avec le dos de Tori, chute en roulant vers l'avant et frappe le tapis du bras libre. Un Uke qui retient son attaque rend la technique illisible pour le jury.",
            erreur: "Entrer trop loin ou rester trop haut : le dos n'est pas sous le centre de gravité de Uke, et Tori doit compenser en tirant. Autre défaut : bloquer le coup de face au lieu de le dévier, ce qui oppose la force à la force et interrompt le mouvement.",
          },
        },
        {
          nom: 'Kata-guruma',
          detail: {
            miseEnAction: "Le début est identique à celui d'Uki-otoshi : saisie fondamentale, Uke pousse, Tori recule en tsugi-ashi, Uke suit. Le même rythme est installé sur les premiers temps, ce qui rend la suite d'autant plus lisible : Uke s'attend à la continuité du déplacement.",
            kuzushi: "Sur le temps décisif, Tori conduit la main qui tient la manche vers l'avant et vers le haut, amenant Uke sur la pointe de ses appuis avant, buste allongé. Le déséquilibre est vers l'avant, mais plus haut que dans Uki-otoshi : il ne s'agit pas de faire basculer Uke vers le sol, mais de l'étirer et de le rendre léger pour pouvoir passer dessous. Uke est en extension, il ne peut plus réajuster ses appuis.",
            tsukuri: "Tori avance profondément un pied entre les jambes de Uke et descend en fente, jambes fléchies et dos droit, jusqu'à venir sous son centre de gravité. Le bras libre passe entre les cuisses de Uke tandis que la main qui tient la manche continue de tirer vers l'avant. Uke est ainsi réparti sur la ligne des épaules de Tori, en équilibre : le chargement se fait par la descente de Tori, jamais en soulevant avec le dos.",
            kake: "Tori se redresse par l'extension des jambes et fait rouler Uke autour de ses épaules, d'un côté vers l'autre, pour le déposer devant lui. Le mouvement est une roue continue, pas un lancer. La main de Tori conserve la manche jusqu'au bout, ce qui contrôle l'arrivée au sol.",
            uke: "Uke pousse franchement, puis se laisse porter sans se raidir ni chercher à s'asseoir sur les épaules de Tori. Il garde la tête dégagée, accompagne la rotation et frappe le tapis. Une résistance à ce moment est dangereuse pour les deux partenaires.",
            erreur: "Se redresser avant d'avoir réellement chargé, ou charger sans avoir installé le déséquilibre : la roue ne tourne pas et Tori termine en force avec le dos. Autre défaut : descendre en arrondissant le dos au lieu de fléchir les jambes.",
          },
        },
      ],
      apprend: "À créer la chute par le déplacement et le déséquilibre plutôt que par la force : ce sont les projections les plus aériennes.",
    },
    {
      nom: '2e série — Koshi-waza',
      objectif: 'Comprendre l’engagement de la hanche comme point d’appui de la projection.',
      techniques: [
        {
          nom: 'Uki-goshi',
          detail: {
            miseEnAction: "Depuis la position de départ, Tori et Uke avancent l'un vers l'autre. Uke lève le poing au-dessus de la tête et attaque le sommet du crâne de Tori d'un coup descendant, en avançant le pied du même côté. L'attaque est réelle et engagée : c'est elle qui fournit l'énergie que Tori va exploiter.",
            kuzushi: "Tori ne recule pas et ne bloque pas de force. Il avance en diagonale sur le côté de Uke pour sortir de l'axe du coup, tout en remontant l'avant-bras au contact du bras attaquant : le coup est dévié, pas arrêté. Uke, dont le poids était déjà porté vers l'avant par son attaque, se retrouve projeté au-delà de son appui avant, buste incliné : le déséquilibre est vers l'avant.",
            tsukuri: "Dans le même temps, le bras libre de Tori passe autour de la taille de Uke et vient se plaquer dans le bas du dos, main ouverte. Tori pivote sur ses appuis pour amener son dos contre le ventre de Uke. Caractéristique d'Uki-goshi : la hanche reste en retrait, décalée sur le côté — elle n'est pas engagée à fond sous le centre de gravité comme dans O-goshi. Le contact se fait par la hanche, pas par le bassin entier. C'est ce placement flottant qui donne son nom à la technique. Les genoux restent souples, Tori ne s'accroupit pas.",
            kake: "Tori tourne le buste en tirant du bras plaqué dans le dos, pendant que l'autre main continue de conduire le bras de Uke. La projection vient de la rotation du corps, pas d'un soulever de jambes : Uke bascule autour de la hanche de Tori et passe par-dessus.",
            uke: "Uke porte une attaque sincère — une attaque molle rend la technique impossible à lire pour le jury. Une fois déséquilibré, il ne résiste pas et accompagne la rotation. Tori ne lâche pas la saisie de la main de Uke : il conserve le contrôle jusqu'à la fin de la chute, ce qui permet à Uke de frapper le tapis dans de bonnes conditions. C'est ce lien maintenu qui distingue une projection maîtrisée d'un simple lâcher.",
            erreur: "Engager la hanche à fond sous Uke et fléchir les jambes : on ne fait plus Uki-goshi mais O-goshi, et le jury le voit immédiatement. Autre défaut classique : lâcher la main de Uke au moment du kake, ce qui casse le contrôle et fait chuter Uke seul.",
          },
        },
        {
          nom: 'Harai-goshi',
          detail: {
            miseEnAction: "Tori et Uke prennent la saisie fondamentale et se déplacent ensemble, Tori conduisant Uke vers l'avant sur plusieurs pas. Le déplacement n'est pas décoratif : il met Uke en marche et rend ses appuis successivement disponibles. Tori choisit le temps où l'appui avant de Uke vient d'être chargé.",
            kuzushi: "Tori libère la main qui tenait le revers et la fait passer autour du dos de Uke, pour venir se plaquer entre les omoplates. C'est ce placement — et non la traction des bras — qui amène le poids de Uke vers l'avant et le colle contre Tori. Le buste de Uke se redresse puis s'incline en avant, ses talons se décollent, il ne peut plus reculer son bassin. Le déséquilibre est vers l'avant, légèrement sur le côté.",
            tsukuri: "Tori pivote sur son appui et amène sa hanche contre le flanc de Uke, buste tourné dans le même sens, sans espace entre les deux corps. La jambe d'attaque, tendue, vient se placer le long de la cuisse de Uke, orteils pointés vers le bas. Tout le poids de Tori repose sur une seule jambe : l'équilibre est tenu par le contact avec Uke, ce qui suppose que le kuzushi soit réellement installé.",
            kake: "La jambe tendue balaie la cuisse de Uke vers l'arrière et vers le haut, en même temps que le buste de Tori tourne et que la main plaquée dans le dos continue de conduire. Les trois actions sont simultanées : c'est leur synchronisation qui projette, pas la puissance du balayage. Uke tourne vers l'avant autour de la hanche de Tori.",
            uke: "Uke se déplace franchement, ne bloque pas la jambe balayée et accompagne la rotation. Il chute vers l'avant et frappe le tapis du bras libre. Tori conserve la saisie pendant toute la chute.",
            erreur: "Faucher la jambe sans avoir engagé la hanche ni le buste : il ne reste qu'un croche-pied. Autre défaut : garder un espace entre les deux corps, ce qui oblige Tori à compenser en tirant sur les bras.",
          },
        },
        {
          nom: 'Tsurikomi-goshi',
          detail: {
            miseEnAction: "Saisie fondamentale, puis déplacement conduit par Tori. La main qui tient le revers vient se placer haut, au niveau du col : c'est cette prise haute qui rend possible l'action de tsuri (lever) caractéristique de la technique.",
            kuzushi: "Tori tire et lève simultanément — tsurikomi — vers l'avant et vers le haut. Uke est redressé, presque étiré : son buste se relève, son poids monte sur ses appuis avant et ses talons quittent le tapis. Contrairement aux techniques précédentes, le déséquilibre n'incline pas Uke vers l'avant mais le rend haut et léger. Cette tension doit être installée avant l'entrée et ne plus jamais se relâcher.",
            tsukuri: "Tori pivote en fléchissant nettement les genoux et fait passer son bassin bas, sous celui de Uke. C'est le point technique de la série : là où Uki-goshi laisse la hanche flottante, Tsurikomi-goshi exige une hanche placée très bas et pleinement engagée. Les deux mains conservent la tension de la levée pendant toute la rotation, ce qui maintient Uke collé et l'empêche de récupérer ses appuis.",
            kake: "Tori se redresse par l'extension des jambes et fait tourner son buste : Uke, qui n'avait plus d'appui, passe par-dessus la hanche et tourne vers l'avant. La levée initiale se transforme en rotation ; il n'y a pas de nouvelle impulsion.",
            uke: "Uke garde sa posture et suit la levée sans relâcher les bras ni se pencher pour aider. Il accompagne la rotation, chute vers l'avant et frappe le tapis. Tori maintient les saisies jusqu'au sol.",
            erreur: "Relâcher la traction pendant l'entrée : la levée disparaît, Uke retrouve ses appuis et Tori doit forcer avec le dos. Autre défaut : pivoter jambes tendues, ce qui place la hanche trop haut pour servir de point d'appui.",
          },
        },
      ],
      apprend: "À placer son centre sous celui du partenaire et à utiliser la rotation du corps plutôt que la traction des bras.",
    },
    {
      nom: '3e série — Ashi-waza',
      objectif: 'Travailler le timing et la précision des appuis.',
      techniques: [
        {
          nom: 'Okuri-ashi-harai',
          ressource: 'Okuri-ashi-barai',
          detail: {
            miseEnAction: "Tori et Uke, en saisie, se déplacent latéralement à travers le tatami, face à face, en pas chassés réguliers : un pied conduit, l'autre le rejoint sans le dépasser. Le déplacement est franc et cadencé sur plusieurs temps. C'est le seul mouvement du kata où la technique naît uniquement du rythme de la marche, sans attaque ni traction préalable.",
            kuzushi: "Le déséquilibre est un instant, pas une action. À chaque temps, le pied qui rejoint se rapproche du pied qui conduit : pendant cette fraction de seconde, les deux appuis de Uke sont serrés et son poids passe de l'un à l'autre sans être posé nulle part. Tori accompagne le déplacement sans le précéder ni le ralentir, en conservant une légère tension dans les bras, et attend exactement ce moment. Toute anticipation le supprime.",
            tsukuri: "Il n'y a pas de placement particulier à construire : Tori est déjà en position parce qu'il a suivi le déplacement. Il prépare simplement la plante du pied qui va balayer, en la gardant proche du tatami, et allège son propre appui pour pouvoir agir sans casser sa marche.",
            kake: "Tori balaie les deux chevilles de Uke au ras du tapis, d'un mouvement latéral ample et rasant, avec la plante du pied et non la pointe. Dans le même temps, ses bras soulèvent et conduisent le buste de Uke dans la direction du balayage. Uke, dont les deux appuis viennent d'être emportés, chute à plat sur le côté, corps aligné parallèlement au sol.",
            uke: "Uke se déplace régulièrement, sans anticiper, sans raccourcir ses pas et sans alourdir ses appuis pour se protéger. Il chute sur le côté et frappe le tapis du bras. La régularité de sa marche est ce qui rend le timing de Tori démontrable.",
            erreur: "Balayer trop tôt ou trop tard, quand un pied est encore chargé : le balayage bute au lieu de glisser et devient un coup de pied. Autre défaut : balayer trop haut, au niveau du mollet, ou oublier l'action des bras — Uke tombe alors assis au lieu de partir à plat.",
          },
        },
        {
          nom: 'Sasae-tsurikomi-ashi',
          detail: {
            miseEnAction: "En saisie, Tori conduit Uke vers l'avant sur quelques pas. Il choisit le temps où Uke va poser un pied : c'est cet appui, non encore chargé, qui sera bloqué. Toute la technique tient dans la coïncidence entre le blocage du pied et l'action des mains.",
            kuzushi: "Tori tire et lève vers l'avant et vers le côté : Uke est amené haut sur son appui avant, buste redressé, à la limite de sa base de sustentation. Le déséquilibre est installé avant que le pied ne vienne bloquer — c'est l'ordre à respecter. Si Uke est encore d'aplomb, le blocage ne fait que le gêner.",
            tsukuri: "Tori pose la plante du pied contre la cheville ou le bas de la jambe de Uke, jambe tendue mais non raide. C'est un point d'appui, pas un coup : le pied se pose et reste, il ne frappe pas. Le corps de Tori s'oriente déjà dans le sens de la rotation à venir, son poids sur la jambe d'appui.",
            kake: "Les deux mains décrivent un mouvement circulaire autour du point bloqué, comme un volant que l'on tourne : celle qui tient la manche conduit vers le bas, celle qui tient le revers pousse vers le haut et l'avant. Uke, arrêté par le bas et emmené par le haut, bascule vers l'avant en tournant autour de son pied bloqué.",
            uke: "Uke avance franchement pour que le blocage soit visible et lisible. Il ne cherche pas à retirer son pied ni à s'asseoir. Il chute vers l'avant, en rotation, et frappe le tapis.",
            erreur: "Frapper le pied au lieu de le bloquer : la technique change de nature et devient dangereuse. Autre défaut : placer le pied trop haut sur la jambe, ou bloquer avant d'avoir installé la levée — Uke se contente alors de trébucher.",
          },
        },
        {
          nom: 'Uchi-mata',
          detail: {
            miseEnAction: "Uchi-mata se prépare par un déplacement circulaire : Tori et Uke, en saisie, tournent ensemble autour d'un axe commun, sur plusieurs temps. Ce cercle n'est pas une figure de style — il place Uke en rotation continue, jambes qui s'écartent naturellement à chaque pas, et rend son appui intérieur disponible. Tori agit au moment où il rompt le cercle.",
            kuzushi: "Tori interrompt la rotation en conduisant les mains vers l'avant et vers le haut, dans une direction légèrement différente de celle du cercle. Uke, emporté par le mouvement circulaire, se retrouve porté sur un seul appui, buste incliné vers l'avant, jambes écartées par la marche. C'est cette combinaison — un seul appui et les jambes ouvertes — qui rend la technique possible.",
            tsukuri: "Tori pivote et place son axe sous celui de Uke, en appui sur une seule jambe, bassin rapproché au contact et buste tourné dans le sens de la projection. La tension dans les bras ne se relâche à aucun moment : c'est elle qui maintient Uke sur son unique appui pendant que Tori se place.",
            kake: "La cuisse de Tori s'élève entre les jambes de Uke, d'une action montante et vers l'arrière, pendant que le buste tourne et que les mains continuent de conduire. La jambe ne frappe pas : elle prolonge la rotation déjà engagée. Uke tourne vers l'avant, par-dessus la jambe d'appui de Tori.",
            uke: "Uke suit le déplacement circulaire sans le contrarier, garde ses appuis mobiles et n'anticipe pas la rupture du cercle. Au moment de la projection, il ne bloque pas la jambe et accompagne la rotation vers l'avant, bras libre en frappe.",
            erreur: "Lancer la jambe sans avoir rapproché le bassin ni maintenu la traction : Uke reste sur ses appuis et la jambe passe dans le vide. Autre défaut : rompre le cercle trop tôt, avant que les appuis de Uke ne soient ouverts.",
          },
        },
      ],
      apprend: "À agir au moment exact où l'appui de Uke devient disponible : balayer, bloquer ou faucher au bon instant.",
    },
  ],
  regardExaminateur: [
    'La sécurité prime : une projection non contrôlée annule la qualité technique.',
    'Le rythme doit rester régulier du premier au dernier mouvement.',
    'Le cérémonial est évalué au même titre que les techniques.',
    'Tori et Uke sont jugés ensemble : le rôle de Uke compte autant que celui de Tori.',
    'La précision des placements prime sur la puissance.',
    'Les déplacements doivent être lisibles, réguliers et orientés vers Joséki.',
    'La constance à droite et à gauche est un marqueur de maîtrise.',
  ],
  conseilExpert: [], // alimente ulterieurement a partir de sources expertes
  aRetenir: [
    'Le Nage-no-kata est la forme pure des projections fondamentales du judo debout.',
    'Trois temps structurent chaque technique : Kuzushi, Tsukuri, Kake.',
    'Tori et Uke ont des rôles complémentaires : le kata se juge à deux.',
    'Les repères sur le tatami (Joséki, distances, orientation) font partie de l’évaluation.',
    'Au 1er Dan, trois séries sont présentées : Te-waza, Koshi-waza et Ashi-waza.',
  ],
}

// ── Kime-no-kata (UV1, 4e Dan) ───────────────────────────────────────────────
// Même structure que Nage-no-kata. Les 20 techniques officielles (src/lib/kimeNoKata.ts)
// alimentent les 5 séries ; chaque « Comprendre cette technique » ouvre la fiche.

const GROUPE_ORDRE: { groupe: KimeGroupe; nom: string; objectif: string; apprend: string }[] = [
  { groupe: 'idori-mains-nues', nom: 'Idori — mains nues (5)', objectif: 'À genoux (Seiza), répondre à une saisie ou un atemi par un déséquilibre, un atemi puis une clé ou une immobilisation.', apprend: 'Le principe de base du kata : rompre l’équilibre et ouvrir par l’atemi avant de contrôler, sans opposer la force à la force.' },
  { groupe: 'idori-poignard', nom: 'Idori — poignard (3)', objectif: 'À genoux, neutraliser une attaque au poignard : sortir de la ligne de l’arme, contrôler le bras armé, verrouiller le coude.', apprend: 'On ne saisit jamais la lame : c’est le bras armé que Tori contrôle et dirige loin des deux partenaires.' },
  { groupe: 'tachiai-mains-nues', nom: 'Tachiai — mains nues (8)', objectif: 'Debout, répondre par le Tai-sabaki à une saisie, un coup de poing, un coup de pied ou une prise par derrière.', apprend: 'Le déplacement (Tai-sabaki) précède toujours la technique : esquiver, puis contrôler ou projeter.' },
  { groupe: 'tachiai-poignard', nom: 'Tachiai — poignard (2)', objectif: 'Debout, esquiver une attaque de poignard puis contrôler le bras armé par une clé de coude.', apprend: 'Les mêmes principes qu’à genoux, transposés debout : distance, esquive, contrôle du bras armé.' },
  { groupe: 'tachiai-sabre', nom: 'Tachiai — sabre (2)', objectif: 'Debout, gérer la distance (Ma-ai) face au sabre : bloquer le dégainage, puis esquiver et contrôler la coupe descendante.', apprend: 'La maîtrise de la distance face à l’arme la plus dangereuse ; les techniques de clôture du kata.' },
]

function ficheTechnique(t: KimeTechnique): TechniqueDetail {
  return {
    fiche: [
      { label: 'Objectif', texte: t.objectif },
      { label: 'Situation', texte: t.situation },
      { label: 'Attaque de Uke', texte: t.attaque },
      { label: 'Principe de défense', texte: t.defense },
      { label: 'Points clés', texte: t.pointsCles.map((p) => `• ${p}`).join('\n') },
      { label: 'Erreurs fréquentes', texte: t.erreurs.map((e) => `• ${e}`).join('\n') },
      { label: 'Sécurité', texte: t.securite.map((s) => `• ${s}`).join('\n') },
      { label: 'En résumé', texte: t.resume },
    ],
  }
}

// Cérémonies d'ouverture et de clôture (protocole officiel Kodokan, retranscrit).
const CEREMONIE_OUVERTURE: SerieCard = {
  nom: 'Cérémonie d’ouverture',
  objectif: 'Le salut et la mise en place du sabre et du poignard avant le kata.',
  apprend: 'Le protocole d’ouverture : saluts debout et à genoux, dépôt et disposition des armes.',
  techniques: [
    {
      nom: 'Le déroulé pas à pas',
      detail: {
        fiche: [
          { label: 'Positions de départ', texte: "Tori se tient du côté gauche, Uke du côté droit, face au Shomen. Uke tient le sabre et le poignard de la main droite, la pointe du sabre vers le bas (environ 45°) : le sabre à l’extérieur, les lames du sabre et du poignard vers le haut, la base de la poignée du poignard posée contre le bas de la garde du sabre. Les deux sont debout à environ 5,4 m (3 ken)." },
          { label: 'Salut debout', texte: "Tori et Uke font face au Shomen pour effectuer simultanément le salut debout, puis s’agenouillent face à face." },
          { label: 'Dépôt des armes', texte: "Uke dépose le sabre et le poignard sur son côté droit (le sabre à l’extérieur, le poignard à l’intérieur, la base de la poignée du poignard alignée avec la garde du sabre, les lames tournées vers l’intérieur). Les deux font ensuite le salut à genoux." },
          { label: 'Mise en place des armes', texte: "Tori reste agenouillé en Seiza. Uke reprend le sabre et le poignard de la main droite (lames vers le haut), les positionne sur son côté droit à hauteur de hanche puis se lève. Il effectue un demi-tour à droite et avance d’environ 1,8 m (1 ken), puis s’agenouille en Seiza. Il place les armes devant lui, met la main gauche sur le côté gauche du sabre et les tourne vers la gauche pour les déposer devant lui : le poignard près de lui, le sabre plus éloigné, les deux poignées en direction du Shomen, les lames tournées vers l’intérieur." },
          { label: 'Reprise des positions', texte: "Uke se relève. Tori se relève lorsque Uke se lève. Uke fait un demi-tour à gauche et retourne à sa position initiale pour se tenir face à Tori." },
        ],
      },
    },
  ],
}

const CEREMONIE_CLOTURE: SerieCard = {
  nom: 'Cérémonie de clôture',
  objectif: 'Le rangement des armes et les saluts qui referment le kata.',
  apprend: 'Le protocole de clôture : retour aux positions initiales, dépôt des armes et saluts.',
  techniques: [
    {
      nom: 'Le déroulé pas à pas',
      detail: {
        fiche: [
          { label: 'Rangement du sabre', texte: "Uke se retourne et se dirige en direction du poignard. Il s’agenouille en Seiza et repose le sabre à sa position initiale." },
          { label: 'Retour aux positions', texte: "Uke reprend ensemble le poignard et le sabre de la main droite (les deux lames vers le haut), se relève et se retourne pour revenir à sa position de départ (là où a débuté Kiri-oroshi). Au cours de cette séquence, Tori revient également à la même position." },
          { label: 'Saluts à genoux', texte: "Debout, Tori et Uke font un pas en arrière, s’agenouillent face à face. Uke dépose le poignard et le sabre sur son côté droit, puis les deux se saluent à genoux." },
          { label: 'Salut final', texte: "Après le salut, Tori et Uke se relèvent, se tournent pour faire face au Shomen et saluent debout simultanément." },
        ],
      },
    },
  ],
}

const KIME_NO_KATA: PremiumLessonContent = {
  meta: {
    tempsLecture: KIME_NO_KATA_META.tempsLecture,
    objectif: 'Comprendre la logique du Kime-no-kata — le kata de la décision — avant d’en apprendre les 20 techniques.',
    niveau: 'Préparation du 4e Dan',
    difficulte: KIME_NO_KATA_META.difficulte,
  },
  objectifIntro:
    'Le Kime-no-kata, « kata de la décision », est un kata de combat de Jigoro Kano : 20 techniques de défense contre une saisie, un atemi, un poignard ou un sabre, la moitié à genoux (Idori), la moitié debout (Tachiai).',
  objectifs: KIME_NO_KATA_META.objectifsApprentissage,
  pourquoi: {
    timeline: [
      { annee: '1888', label: 'Jigoro Kano codifie le Shobu-no-kata, kata de combat réel.' },
      { annee: '1906', label: 'Le Kodokan fixe la forme officielle sous le nom de Kime-no-kata.' },
      { annee: "Aujourd'hui", label: 'Kata imposé de l’UV1 du 4e Dan : self-défense, armes et atemi.' },
    ],
    blocs: [
      { titre: 'Un kata de combat, pas de démonstration', texte: 'Là où le Nage-no-kata montre les projections, le Kime-no-kata montre la réponse à une agression réelle : saisies, coups, poignard et sabre. L’intention (Kime) est celle d’une défense décidée et efficace.' },
      { titre: 'Idori et Tachiai', texte: 'Les 8 premières techniques (Idori) se font à genoux en Seiza ; les 12 suivantes (Tachiai) se font debout. La même logique de défense se transpose des deux positions.' },
    ],
    principes: [
      { titre: 'Tai-sabaki', technique: 'Toutes les techniques', texte: 'Le déplacement précède la technique : on esquive pour sortir de la ligne d’attaque avant de contrôler. Jamais la force contre la force.' },
      { titre: 'Atemi', technique: 'Suigetsu · Uto', texte: 'L’atemi (au plexus, entre les sourcils…) crée l’ouverture qui rend le contrôle possible. Il est toujours maîtrisé, sans contact réel.' },
      { titre: 'Contrôle du bras armé', technique: 'Poignard · sabre', texte: 'Face à une arme, Tori contrôle le bras armé — jamais la lame — et le dirige loin des deux partenaires.' },
      { titre: 'Kime', technique: 'L’intention', texte: 'Chaque réponse est décidée et menée jusqu’au contrôle complet : c’est la décision (Kime) qui donne son nom au kata.' },
    ],
  },
  jury: [
    { critere: 'Le Tai-sabaki précède la technique', exemple: 'Esquive nette avant tout contrôle, sur chaque technique.', tori: 'Sort de la ligne d’attaque avant d’agir.', uke: 'Attaque franchement, avec Kiai et intention.' },
    { critere: 'Atemi juste et maîtrisé', exemple: 'Atemi au Suigetsu ou à l’Uto, contrôlé, sans impact.', tori: 'Marque l’atemi comme ouverture, sans frapper réellement.', uke: 'Marque la vulnérabilité sans exagérer.' },
    { critere: 'Contrôle du bras armé', exemple: 'Sur poignard et sabre, la lame est toujours dirigée à l’écart.', tori: 'Contrôle le poignet et le bras, jamais la lame.', uke: 'Tient l’arme fermement, attaque dans l’axe annoncé.' },
    { critere: 'Distance et rythme (Ma-ai)', exemple: 'Distances Seiza, debout, Toma respectées ; rythme régulier.', tori: 'Gère la distance face à main nue, poignard et sabre.', uke: 'Respecte les Ma-ai d’attaque de chaque technique.' },
    { critere: 'Fin de technique décidée (Kime)', exemple: 'Clé ou immobilisation menée jusqu’au contrôle, Mairi respecté.', tori: 'Contrôle jusqu’au signal, relâche aussitôt.', uke: 'Signale Mairi en tapant deux fois.' },
  ],
  reperes: [
    { titre: 'Les positions', icone: '🧍', items: ['Idori : à genoux en Seiza, distance Hizazume-no-maai (≈ 2 poings).', 'Tachiai : debout, distance d’un pas (≈ 40 cm).', 'Sabre : distances Toma (≈ 1,2 m) et Ma-ai élargie.'] },
    { titre: 'Les cibles d’atemi', icone: '🎯', items: ['Suigetsu — plexus / abdomen.', 'Uto — entre les sourcils.', 'Kasumi — la tempe.'] },
    { titre: 'Les contrôles', icone: '🔒', items: ['Udehishigi-waki / hara / hiza-gatame — clés de coude.', 'Kata-gatame — immobilisation d’épaule.', 'Seoi-nage — projection sur Ushiro-dori.'] },
    { titre: 'La sécurité', icone: '🤝', items: ['Mairi : Uke tape deux fois, Tori relâche aussitôt.', 'Armes d’entraînement, bras armé dirigé à l’écart.', 'Atemi maîtrisés, sans contact réel.'] },
  ],
  series: [
    CEREMONIE_OUVERTURE,
    ...GROUPE_ORDRE.map((g) => ({
      nom: g.nom,
      objectif: g.objectif,
      apprend: g.apprend,
      techniques: KIME_NO_KATA_TECHNIQUES.filter((t) => t.groupe === g.groupe).map((t) => ({
        nom: `${t.nom} — ${t.titreFr}`,
        detail: ficheTechnique(t),
      })),
    })),
    CEREMONIE_CLOTURE,
  ],
  seriesTitre: 'Les séries du kata',
  regardExaminateur: [
    'L’examinateur observe d’abord l’intention : chaque défense doit être décidée, menée jusqu’au contrôle complet.',
    'Il vérifie que le déplacement (Tai-sabaki) précède la technique et que Tori ne s’oppose jamais en force.',
    'Sur les armes, il attend un contrôle constant du bras armé et une distance rigoureuse.',
  ],
  conseilExpert: [],
  aRetenir: [
    '20 techniques : 8 Idori (à genoux) + 12 Tachiai (debout).',
    'Trois familles d’attaque : mains nues, poignard, sabre.',
    'Le Tai-sabaki précède toujours la technique.',
    'L’atemi crée l’ouverture ; le bras armé se contrôle, jamais la lame.',
    'Kime = la décision : contrôler jusqu’au bout, relâcher au Mairi.',
  ],
}

export const PREMIUM_LESSONS: Record<string, PremiumLessonContent> = {
  [NAGE_NO_KATA_RESSOURCE_ID]: NAGE_NO_KATA,
  [KIME_NO_KATA_RESSOURCE_ID]: KIME_NO_KATA,
}

export function getPremiumContent(ressourceId: string | undefined): PremiumLessonContent | undefined {
  return ressourceId ? PREMIUM_LESSONS[ressourceId] : undefined
}

// Niveaux du quiz premium (tranches de 5 questions, par ordre).
export const QUIZ_NIVEAUX = [
  { start: 0, label: 'Niveau 1 · Comprendre' },
  { start: 5, label: 'Niveau 2 · Observer' },
  { start: 10, label: 'Niveau 3 · Analyser' },
]
