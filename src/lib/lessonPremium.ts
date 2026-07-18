// Contenu structure des lecons "premium" Hazumi (modele de reference editorial).
// Pilote par ressource_id -> extensible aux futures lecons sans changer l'archi.

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
export interface RepereGroupe { titre: string; items: string[] }
export interface Technique { nom: string; ressource?: string } // ressource = titre catalogue si different
export interface SerieCard { nom: string; objectif: string; techniques: Technique[]; apprend: string }

export interface PremiumLessonContent {
  meta: PremiumMeta
  objectifIntro: string
  objectifs: string[]
  pourquoi: { timeline: TimelineStep[]; blocs: Bloc[]; principes: PrincipeIllustre[] }
  jury: JuryCritere[]
  reperes: RepereGroupe[]
  series: SerieCard[]
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
          "Chaque technique illustre concrètement un principe fondamental : adaptation à la force du partenaire, économie d'effort, entraide, contrôle. Le kata ne se contente pas de les énoncer, il oblige à les appliquer : sans déséquilibre préalable, la projection ne fonctionne pas ; sans placement juste, il faut forcer. Le judoka fait donc l'expérience physique de ce qu'il a entendu en théorie. C'est cette compréhension incarnée que le jury cherche à évaluer, bien plus que la performance athlétique.",
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
      { titre: 'Contrôle', technique: 'Harai-goshi', texte: "Tori conserve la saisie jusqu'au bout et accompagne Uke au sol : il ne lâche pas. Le contrôle distingue une projection maîtrisée d'une chute subie." },
    ],
  },
  jury: [
    { critere: 'Sécurité', exemple: 'Kata-guruma', tori: 'Charge Uke dos droit et l’accompagne jusqu’au sol sans jamais le lâcher.', uke: 'Se laisse porter sans se raidir et protège sa tête à la chute.' },
    { critere: 'Rythme', exemple: 'Okuri-ashi-harai', tori: 'Balaie au moment exact où le pied de Uke devient léger, sans à-coup.', uke: 'Se déplace régulièrement pour rendre le temps lisible.' },
    { critere: 'Cérémonial', exemple: 'Ouverture et clôture', tori: 'Salue Joséki puis Uke, prend sa garde sans précipitation.', uke: 'Reproduit les mêmes gestes, au même tempo que Tori.' },
    { critere: 'Contrôle', exemple: 'Harai-goshi', tori: 'Garde la saisie du début à la fin et accompagne la chute.', uke: 'Suit la projection sans résister ni anticiper.' },
    { critere: 'Précision', exemple: 'Sasae-tsurikomi-ashi', tori: 'Place la plante du pied au point exact, ni trop haut ni trop bas.', uke: 'Avance franchement pour que le blocage soit visible.' },
    { critere: 'Déplacements', exemple: 'Uki-otoshi', tori: 'Recule en ligne, sur des pas réguliers, sans dévier de l’axe.', uke: 'Suit la trajectoire imposée sans raccourcir ses appuis.' },
  ],
  reperes: [
    { titre: 'Joséki', items: ["Ne jamais tourner le dos à Joséki (l'examinateur) : règle d'or.", 'Exception : le relevé après une chute, où Uke se relève dans le sens de la chute.', 'Tori est placé à droite de Joséki.'] },
    { titre: 'Distances', items: ['Face à face au départ : 6 m de talon à talon, 5,50 m d’orteil à orteil.', "Après l'ouverture : les partenaires se retrouvent à l'intérieur des 4 mètres.", "L'ensemble du kata s'effectue à l'intérieur des 6 mètres."] },
    { titre: 'Déplacements', items: ["Aujourd'hui : Tori s'avance de 2/3, Uke de 1/3 (Uke avance d'environ un mètre).", 'Anciennement : rapprochement en ayumi ashi (deux pas chacun, ou quatre pas pour Tori).', 'Les déplacements restent lisibles, réguliers et orientés.'] },
    { titre: 'Orientation', items: ['Le kata se déroule face à Joséki, dans un axe constant.', 'Les retours en position se font sans jamais présenter le dos à Joséki.'] },
    { titre: 'Placements', items: ['Chaque technique repart de la même position de référence.', 'Tori et Uke se replacent symétriquement avant de changer de côté.'] },
    { titre: 'Cérémonial', items: ['Salut debout (ritsurei) vers Joséki, puis salut à genoux (zarei) entre partenaires.', 'Ouverture en kamae : jambe gauche puis jambe droite.', 'La clôture reprend les mêmes saluts, en sens inverse.'] },
  ],
  series: [
    {
      nom: '1re série — Te-waza',
      objectif: 'Découvrir les projections où le bras et l’épaule conduisent le mouvement.',
      techniques: [{ nom: 'Uki-otoshi' }, { nom: 'Ippon-seoi-nage' }, { nom: 'Kata-guruma' }],
      apprend: "À créer la chute par le déplacement et le déséquilibre plutôt que par la force : ce sont les projections les plus aériennes.",
    },
    {
      nom: '2e série — Koshi-waza',
      objectif: 'Comprendre l’engagement de la hanche comme point d’appui de la projection.',
      techniques: [{ nom: 'Uki-goshi' }, { nom: 'Harai-goshi' }, { nom: 'Tsurikomi-goshi' }],
      apprend: "À placer son centre sous celui du partenaire et à utiliser la rotation du corps plutôt que la traction des bras.",
    },
    {
      nom: '3e série — Ashi-waza',
      objectif: 'Travailler le timing et la précision des appuis.',
      techniques: [{ nom: 'Okuri-ashi-harai', ressource: 'Okuri-ashi-barai' }, { nom: 'Sasae-tsurikomi-ashi' }, { nom: 'Uchi-mata' }],
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

export const PREMIUM_LESSONS: Record<string, PremiumLessonContent> = {
  [NAGE_NO_KATA_RESSOURCE_ID]: NAGE_NO_KATA,
}

export function getPremiumContent(ressourceId: string | undefined): PremiumLessonContent | undefined {
  return ressourceId ? PREMIUM_LESSONS[ressourceId] : undefined
}

/** Titres catalogue a chercher pour l'action "Comprendre cette technique". */
export function techniqueLookupTitles(content: PremiumLessonContent): string[] {
  return content.series.flatMap((s) => s.techniques.map((t) => t.ressource ?? t.nom))
}

// Niveaux du quiz premium (tranches de 5 questions, par ordre).
export const QUIZ_NIVEAUX = [
  { start: 0, label: 'Niveau 1 · Comprendre' },
  { start: 5, label: 'Niveau 2 · Observer' },
  { start: 10, label: 'Niveau 3 · Analyser' },
]
