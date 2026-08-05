import type { FDJourney } from './fdJourney'
import type { MasterclassContent } from '../masterclass/masterclassContent'

// Collection Frédéric Demontfaucon — « Projet Excellence Judo » (7 masterclasses).
// 1 vidéo = 1 journey (parcours-first, univers JUDO-KÂ hérité, non exposé).
//
// Les SECTIONS pédagogiques sont MASQUÉES (décision PO) → on ne remplit ici que
// ce qui est réellement exploitable et affiché : chapitres horodatés (ancrés sur
// les transitions du transcript ASR) + méta (objectif = thème de la vidéo).
// Les chapitres relèvent d'un « best engineering judgement » sur un transcript
// auto-généré bruité — à réviser/affiner par le PO. Aucun contenu technique inventé.
// Sections de contenu laissées vides (non affichées). Quiz non généré (transcript
// trop bruité pour des questions fiables sans invention).

function mc(objectif: string, tempsLecture: string): MasterclassContent {
  return {
    meta: { tempsLecture, objectif, niveau: 'JUDO-KÂ', difficulte: 4 },
    objectifs: [], prerequis: [], concepts: [], explications: [],
    erreurs: [], conseils: [], drills: [], aRetenir: [],
  }
}

export const PROJET_EXCELLENCE_JOURNEYS: FDJourney[] = [
  {
    slug: 'systeme-attaque-kumikata',
    ressourceId: 'edc5e596-56d0-4387-af33-9da673a82872',
    titre: 'Système d’attaque et kumi-kata — Projet Excellence Judo',
    univers: 'judo-ka',
    video: { url: 'https://www.youtube.com/watch?v=ByZjOVY1M_M', titre: 'Projet Excellence Judo — Système d’attaque / Kumi-kata', dureeSeconds: 883 },
    chapitres: [
      { titre: 'Introduction — la bataille de la saisie', timestampSeconds: 0,
        transcript: 'Encore une fois, dans l’idée de travailler, on a [à vérifier] différentes phases : la phase d’approche, la phase de saisie, et la phase où on est un petit peu pris. Donc on travaille déjà sur sa position. Là, on est en droite-droite, d’accord ?\n\nL’idée, c’est déjà d’analyser comment mon partenaire se comporte. Souvent, sur les droite-droite, on dit qu’on maîtrise son bras droit, c’est le bras fort. On voit souvent aujourd’hui en compétition les gens très forts sur cette main et ce contrôle. Donc on se retrouve avec beaucoup de situations manche-manche : tout le monde se neutralise, on ne fait plus de jeu.\n\nDonc l’idée, c’est : qu’est-ce que je tolère ? Qu’est-ce que je suis capable d’accepter ? Est-ce que j’empêche mon partenaire de faire, ou est-ce que… Pour nous, en tout cas dans notre pratique : là, je ne me sens pas spécialement agressé, pas en danger, mais pas agressé. Par contre [à vérifier], là ça va peut-être ne pas me plaire. Donc, dans cette position, à moi de me repositionner pour être dans la tolérance que j’accepte pour pouvoir faire du judo. Toujours la notion de distance : essayer d’être le premier à la saisie.' },
      { titre: 'Protéger et imposer sa saisie', timestampSeconds: 79,
        transcript: 'Alors pareil, ce n’est pas forcément toujours vrai. Il y en a qui aiment qu’on les saisisse pour ensuite prendre et vous verrouiller. Moi, je préfère avoir un temps d’avance et une disponibilité pour faire, plutôt que d’être dans l’attente qu’on me saisisse. C’est souvent des gens qui viennent un peu croisés.\n\nDonc déjà, droitier : je m’oriente. Quelle est ma main forte ? Quel est son bras fort ? Ma main forte était la main droite ; j’avais besoin de positionner mon bras au revers pour ensuite contrôler le reste. Il y en a, ça va être la manche pour pouvoir positionner la main. Ça dépend un petit peu de chacun, comment vous vous sentez. Il n’y a pas de fausse note, entre guillemets.\n\nMoi, je protège ma manche, mon revers, ici, pour ne pas être saisi et pour me permettre de me déplacer — ce qui me permet d’accéder au revers, en faisant un relais, ou de venir saisir pour dégager. À chaque fois que je viens ici, je protège : j’ai tendu, j’ai protégé, et j’ai récupéré, repositionné mon épaule, pour venir travailler derrière et agir sur le partenaire.\n\nEncore une fois, si je ne mets pas d’information, j’ai du mal. Donc je suis obligé d’inciter mon partenaire, de le déstabiliser, pour que ce bras se libère [à vérifier] un petit peu, que je puisse saisir le revers ou la manche pour travailler. On essaie un petit peu ce travail-là. Travaillez sur votre position : c’est un peu comme au laser game, le moins de surface possible.' },
      { titre: 'Prises de garde et profils d’adversaires', timestampSeconds: 220,
        transcript: 'Voilà, comment vous vous sentez dans votre positionnement. Et ce qui est intéressant, c’est cette oscillation, d’accord ? C’est un travail de distance : je sais que je vais pouvoir soit rapidement saisir, soit refaire un petit pas pour rentrer dans la garde du partenaire, ou, quand il va me saisir, reprendre la distance et l’obliger à être en bout de course pour ne pas m’en saisir. C’est un travail qu’on n’aborde pas assez souvent, ce travail de distance.\n\nMoi, j’avais un adversaire, Mark Winger [à vérifier], qui était extrêmement difficile à prendre parce qu’il était toujours en train d’osciller comme ça, avant-arrière, pour ajuster la distance : extrêmement inconfortable. Et je me prépare [à vérifier], comme au fleuret [à vérifier], et à un moment donné je suis capable d’accélérer pour essayer. Donc je travaille un petit peu sur mes appuis, sur la distance que je vais proposer à mon partenaire, et à un moment donné j’accélère.' },
      { titre: 'Mise en application', timestampSeconds: 280,
        transcript: 'Allez, on y va tranquillement, puis vous rajoutez un palier. On est vraiment dans une expression assez libre pour l’instant. On essaie de prendre des repères, de distance et visuels : ressentir, quand je me déplace, comment le partenaire se déplace ; quand je me rapproche, comment il réagit ; quand je m’approche, est-ce qu’il s’engage ?\n\nSouvent, quand j’arrivais sur le combat sans connaître mon adversaire, il fallait que rapidement j’aie des informations. Souvent, c’est la position de ses jambes, et ça appelle la position de sa main. Si ça arrivait bas, ici… par contre, quand ça arrivait haut, je savais que c’était un droitier engagé haut ; et parfois des gauchers inversés [à vérifier] — droitier mais placé de l’autre côté — donc il fallait faire attention à la manière dont il engageait.\n\nEt le partenaire n’est pas inerte : il joue aussi à positionner ses mains sans mettre de la force, et il m’incite à préciser [à vérifier] ma posture, à me décaler. Quand il monte son bras, on va pousser son bras, peut-être retirer. Ce n’est pas juste « j’ouvre ». S’il vient par en dessous pour placer la main au revers, là je ne vais pas ouvrir : je vais reculer mon bassin et m’appuyer sur sa main. Quand il vient par au-dessus, je m’organise et je me positionne ; quand il vient par en dessous, je m’organise et je me positionne.\n\nEt j’essaie d’utiliser [à vérifier] ma main forte, la main droite : venir saisir au revers. S’il vient bloquer la main, la fois d’après je vais effacer ce qui me gêne : soit je reviens pour reprendre, soit je travaille sur sa main, je saisis le revers et je crée un déplacement.\n\nEncore une fois, plus je laisse le partenaire en stabilité, plus je vais mettre d’énergie pour le faire tomber. Alors que si je le mets en mouvement, je facilite le travail : ce n’est pas juste « je prends puis je démarre ». Si, dans un même temps, je m’organise pour le mettre en mouvement, j’ai gagné un temps. Tout à l’heure, on a fait le jeu des deux mains : l’idée, c’est de créer un déséquilibre. Une main contre une main, on est à égalité ; deux mains contre deux mains, égalité. Donc l’idée, c’est de créer ce déséquilibre : peut-être avant qu’il ait saisi, bouger, créer une information qui va l’obliger à se structurer différemment pour me laisser…' },
      { titre: 'Créer l’ouverture, gagner du temps', timestampSeconds: 458,
        transcript: '…le temps de faire autre chose. Donc j’essaie toujours de coupler les actions : dissocier main gauche, main droite, pied gauche, pied droit, si je peux. Quand je saisis, rapidement, j’essaie de mettre aussi un déplacement, et si je peux un accrochage sur le bas. Ce n’est pas forcément de la traction : ça peut être de le faire déplacer, de le mobiliser pour le faire réagir.\n\nÀ l’inverse, quand je pousse, j’ai percuté [à vérifier], j’ai pris ma position, et j’essaie d’avoir ce travail de déséquilibre sur les mains. Le but, ce n’est pas de l’empêcher de faire — ce qu’on voit trop souvent aujourd’hui, le verrouillage —, ce qui m’intéresse, c’est qu’il revienne et qu’il essaie de me ressaisir : quand il saisit, je fais mon attaque, parce qu’il se met aussi en instabilité.\n\nDonc travaillez un petit peu sur les mains et le déplacement. Dès qu’on est à deux mains contre deux mains [à vérifier], j’essaie de recréer le déséquilibre et de chercher des solutions. Votre partenaire joue une fois là, une fois là, une fois là ; voilà, il vous embête un petit peu.' },
      { titre: 'Exercice guidé', timestampSeconds: 550,
        transcript: 'Allez, c’est parti. Maintenant, on travaille un petit peu sur les lâchers de garde, notamment quand j’ai le bras pris. On voit souvent les gens qui tirent — ça peut marcher, mais il faut aussi un point d’opposition. Souvent, les gens tirent mais il n’y a pas d’opposition : il faut que, ici, je repousse mon partenaire pour pouvoir mettre l’autre à distance.\n\nMoi, ce que j’aime bien, c’est avancer : mettre en tension, puis avancer le coude dans la main, ici, pour monter — en faisant attention de ne pas lui mettre un coup dans le nez. Ce n’est pas monter comme ça, c’est plier et avancer le coude en direction des doigts.\n\nJe peux aussi, si c’est difficile selon là où il a pris, enrouler : tirer, enrouler, puis passer pour m’engager directement. Ça peut être la même chose dans l’autre sens : j’ouvre vers moi, je ne pars pas tout de suite vers le bras, d’abord vers moi, puis je pars et j’engage directement mon attaque.\n\nLa même chose en manche-manche : quand on est ici, j’essaie d’être au-dessus pour pouvoir engager et tourner en poussant. Je peux aussi me servir de mon autre main pour venir chasser : il faut que j’enroule et que je sois à l’extérieur pour ensuite pousser sur l’autre main et dégager la main au revers.' },
      { titre: 'Variantes de contrôle', timestampSeconds: 653,
        transcript: 'Toujours pareil, l’idée c’est d’avoir une tension — on l’avait déjà vu —, de prendre un petit peu de ressort ici pour ensuite continuer à appuyer.\n\nMaintenant, je parle pour les compétiteurs : avant, le lâcher [à vérifier] était sanctionné ; aujourd’hui, si je fais lâcher et que je conserve, il n’y a pas de sanction. Par contre, si je fais lâcher et que ça lâche, je prends un chido. Donc, toujours : prise de distance et de tension, je mets un petit peu d’énergie, et je lâche. Je ne suis pas obligé de faire lâcher : les Japonais le font très bien, ils font glisser leur veste ici pour descendre un peu la main, en gardant la pression vers le bas pour garder la main basse.\n\nEncore une fois, le but n’est pas forcément de bloquer : s’il reste dans cette position, il ne va pas se passer grand-chose. Par contre, si je relâche et qu’il remonte, je lance mon attaque. Jouer sur la reconstruction de la garde de l’autre, et pas juste fermer — ça n’a pas de sens.\n\nQuand je sens que je suis en équilibre, je fais lâcher et je récupère, je crée mon déséquilibre. Il y a aussi une manière de prendre la manche qui est intéressante : sur une garde comme ça, je viens attraper ici, je lève [à vérifier], je twiste ici et je viens attraper ici. Technique autorisée pendant les tournois. Mon partenaire, lui, venait mettre la tension dans le kimono, mais au lieu de partir dans le sens inverse, il inversait tout de suite sa main et glissait les doigts dans le kimono ; ce qui fait que quand on tourne et qu’on part…' },
      { titre: 'De l’autre côté (prise pistolet)', timestampSeconds: 816,
        transcript: '…de l’autre côté, on est en prise pistolet [à vérifier], et on est beaucoup plus fort que l’autre. Par contre, pour faire sauter les doigts, ça va être beaucoup plus compliqué.\n\nEst-ce autorisé ? Maintenant c’est autorisé, mais avant… C’est pour ça que je disais à mon partenaire, à l’époque : tu n’as pas le droit de mettre le doigt dans le kimono de l’autre, mais dans le tien tu peux — tu peux faire la « pistolet », mais tu ne peux pas avoir les doigts dans celui de l’autre. Dans tous les cas, c’est les trois derniers doigts, ou les deux derniers, selon comment vous êtes.\n\nDu coup, vous mettez la main vers vous, les trois derniers doigts, et vous venez tirer de l’autre côté : là vous êtes en pistolet, l’autre ne le voit pas — l’arbitre non plus —, et en plus vous êtes plus fort. Comme les doigts sont plus vers le haut, on ne les voit pas.' },
    ],
    quiz: [],
    content: mc('Construire son système d’attaque et son kumi-kata (saisies) : prendre l’avantage à la saisie et préparer ses attaques.', '15 minutes'),
  },
  {
    slug: 'harai-goshi',
    ressourceId: '33ca6240-95c2-4a67-9033-3a9d6900d1d7',
    titre: 'Harai-goshi — Projet Excellence Judo',
    univers: 'judo-ka',
    video: { url: 'https://www.youtube.com/watch?v=Jp9dFOPb2LM', titre: 'Projet Excellence Judo — Harai', dureeSeconds: 692 },
    chapitres: [
      { titre: 'Introduction et mise en place', timestampSeconds: 0 },
      { titre: 'Le déplacement et l’entrée', timestampSeconds: 97 },
      { titre: 'Premier essai', timestampSeconds: 182 },
      { titre: 'Deuxième forme', timestampSeconds: 238 },
      { titre: 'Fixer le haut, engager la hanche', timestampSeconds: 344 },
      { titre: 'Traverser / enchaîner', timestampSeconds: 404 },
      { titre: 'De l’autre côté', timestampSeconds: 626 },
      { titre: 'À vous', timestampSeconds: 687 },
    ],
    quiz: [],
    content: mc('Travailler le Harai-goshi : le déplacement, l’entrée, le déséquilibre et la projection.', '12 minutes'),
  },
  {
    slug: 'preparation-attaque',
    ressourceId: 'b20271c3-6e09-4d4e-96d8-bb9c9830c193',
    titre: 'Préparation de l’attaque — Projet Excellence Judo',
    univers: 'judo-ka',
    video: { url: 'https://www.youtube.com/watch?v=Ur4Eeh8QCqY', titre: 'Frédéric Demontfaucon — Préparation attaque', dureeSeconds: 586 },
    chapitres: [
      { titre: 'Introduction — relâcher et se placer', timestampSeconds: 0 },
      { titre: 'Doser sa poussée', timestampSeconds: 75 },
      { titre: 'Créer la première ouverture', timestampSeconds: 124 },
      { titre: 'La première attaque', timestampSeconds: 197 },
      { titre: 'Mise en application', timestampSeconds: 269 },
      { titre: 'Lancer l’attaque depuis le bassin', timestampSeconds: 352 },
      { titre: 'Travail des mains et des appuis', timestampSeconds: 430 },
      { titre: 'Trois formes / synthèse', timestampSeconds: 474 },
    ],
    quiz: [],
    content: mc('La préparation de l’attaque : créer et exploiter les ouvertures avant d’attaquer.', '10 minutes'),
  },
  {
    slug: 'reprise-initiative-quadrupedique',
    ressourceId: '8f2b2427-4943-48ca-b19a-521d37c109b1',
    titre: 'Reprise d’initiative quadrupédique — Projet Excellence Judo',
    univers: 'judo-ka',
    video: { url: 'https://www.youtube.com/watch?v=zgQidLmOXG8', titre: 'Projet Excellence Judo — Reprise initiative quadrupédique', dureeSeconds: 464 },
    chapitres: [
      { titre: 'Introduction — la position à quatre pattes', timestampSeconds: 0 },
      { titre: 'Sortir et se retourner', timestampSeconds: 36 },
      { titre: 'Depuis la position à genoux', timestampSeconds: 123 },
      { titre: 'Pousser et déséquilibrer', timestampSeconds: 186 },
      { titre: 'Mise en application', timestampSeconds: 253 },
      { titre: 'De l’autre sens', timestampSeconds: 304 },
      { titre: 'Renverser le partenaire', timestampSeconds: 412 },
      { titre: 'Synthèse', timestampSeconds: 457 },
    ],
    quiz: [],
    content: mc('Reprendre l’initiative au sol depuis la position quadrupédique (à quatre pattes).', '8 minutes'),
  },
  {
    slug: 'continuite-ne-waza',
    ressourceId: 'd4110d51-1629-4721-9726-6fd10a6c71bb',
    titre: 'Continuité en ne-waza — Projet Excellence Judo',
    univers: 'judo-ka',
    video: { url: 'https://www.youtube.com/watch?v=nPjfLtNaCVM', titre: 'Projet Excellence — Continuité Ne-Waza', dureeSeconds: 669 },
    chapitres: [
      { titre: 'Introduction — garder l’initiative au sol', timestampSeconds: 0 },
      { titre: 'Contrôle et changement de contrôle', timestampSeconds: 61 },
      { titre: 'Descendre en maintenant le poids', timestampSeconds: 120 },
      { titre: 'Utiliser l’opposition', timestampSeconds: 259 },
      { titre: 'De l’autre côté', timestampSeconds: 321 },
      { titre: 'Contrôle de la tête / relâcher', timestampSeconds: 376 },
      { titre: 'Le passage', timestampSeconds: 473 },
      { titre: 'Puissance et position', timestampSeconds: 535 },
      { titre: 'Passer en dessous', timestampSeconds: 654 },
    ],
    quiz: [],
    content: mc('La continuité en ne-waza : enchaîner et garder l’initiative dans le travail au sol.', '11 minutes'),
  },
  {
    slug: 'liaison-debout-sol-face',
    ressourceId: '800acbbc-b51c-4064-901b-bcdb9b354f2e',
    titre: 'Liaison debout-sol : l’opportunité de face — Projet Excellence Judo',
    univers: 'judo-ka',
    video: { url: 'https://www.youtube.com/watch?v=dWh1LB-mSMI', titre: 'LDS — opportunité offerte de face', dureeSeconds: 744 },
    chapitres: [
      { titre: 'Introduction — l’opportunité offerte de face', timestampSeconds: 0 },
      { titre: 'Se déplacer et s’accrocher', timestampSeconds: 66 },
      { titre: 'Mise en application', timestampSeconds: 222 },
      { titre: 'Selon la réaction du partenaire', timestampSeconds: 272 },
      { titre: 'Attaquer le bras (clé)', timestampSeconds: 370 },
      { titre: 'Contrôle', timestampSeconds: 419 },
      { titre: 'Se servir de la main', timestampSeconds: 461 },
      { titre: 'Passage à quatre pattes', timestampSeconds: 574 },
      { titre: 'Finition', timestampSeconds: 622 },
      { titre: 'Positionnement et flexion', timestampSeconds: 705 },
    ],
    quiz: [],
    content: mc('La liaison debout-sol : exploiter l’opportunité offerte de face pour enchaîner vers le sol.', '12 minutes'),
  },
  {
    slug: 'placement-deplacement',
    ressourceId: 'b79dba55-d907-4e9a-a590-e86fbe0e9e68',
    titre: 'Placement dans le déplacement — Projet Excellence Judo',
    univers: 'judo-ka',
    video: { url: 'https://www.youtube.com/watch?v=2SYniO6bF5w', titre: 'Projet Excellence Judo — Placement dans le déplacement', dureeSeconds: 802 },
    chapitres: [
      { titre: 'Introduction — ouvrir et se placer', timestampSeconds: 0 },
      { titre: 'Attraper et s’éloigner', timestampSeconds: 34 },
      { titre: 'Ouvrir les bras', timestampSeconds: 93 },
      { titre: 'Le moment de la chute', timestampSeconds: 136 },
      { titre: 'Mise en application', timestampSeconds: 311 },
      { titre: 'Sur l’autre côté', timestampSeconds: 364 },
      { titre: 'Le contact et le timing', timestampSeconds: 428 },
      { titre: 'Le croisé', timestampSeconds: 531 },
      { titre: 'Enchaînement', timestampSeconds: 596 },
      { titre: 'Continuer / synthèse', timestampSeconds: 687 },
    ],
    quiz: [],
    content: mc('Le placement dans le déplacement : se placer et créer les conditions de l’attaque en mouvement.', '13 minutes'),
  },
]
