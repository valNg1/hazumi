/**
 * Kime-no-kata — contenu pédagogique complet (UV1, 4e Dan).
 *
 * SOURCE DE VÉRITÉ : le manuel officiel Kodokan Kime-no-Kata (traduction FIJ),
 * `KodokanKimeNoKata.pdf`. La séquence officielle compte 20 techniques :
 * 8 Idori (à genoux) + 12 Tachiai (debout). Toute donnée antérieure divergente
 * est écrasée : le document officiel fait foi.
 *
 * Les champs situation / attaque / défense sont tirés du manuel. Les points
 * clés, erreurs, sécurité et le résumé Hazumi en sont la synthèse pédagogique.
 *
 * TIMESTAMPS : seules les 7 bornes macro validées par le Directeur Technique
 * sont utilisées. Chaque technique est ancrée sur le début de son groupe
 * (série + arme). Les bornes fines par technique restent « À valider ».
 */

export type Groupe =
  | 'idori-mains-nues'
  | 'idori-poignard'
  | 'tachiai-mains-nues'
  | 'tachiai-poignard'
  | 'tachiai-sabre'

export interface TechniqueKime {
  ordre: number
  nom: string
  titreFr: string
  serie: 'Idori' | 'Tachiai'
  groupe: Groupe
  objectif: string
  situation: string
  attaque: string
  defense: string
  pointsCles: string[]
  erreurs: string[]
  securite: string[]
  resume: string
}

/** Bornes macro validées (Directeur Technique). Chaque groupe ancre ses techniques. */
export const GROUPE_TIMESTAMP: Record<Groupe, number> = {
  'idori-mains-nues': 64,
  'idori-poignard': 200,
  'tachiai-mains-nues': 363,
  'tachiai-poignard': 507,
  'tachiai-sabre': 590,
}

export const KIME_MACRO_CHAPITRES = [
  { titre: 'Cérémonie d’ouverture', timestamp: 0 },
  { titre: 'Idori — mains nues', timestamp: 64 },
  { titre: 'Idori — poignard', timestamp: 200 },
  { titre: 'Tachiai — mains nues', timestamp: 363 },
  { titre: 'Tachiai — poignard', timestamp: 507 },
  { titre: 'Tachiai — sabre', timestamp: 590 },
  { titre: 'Cérémonie de clôture', timestamp: 673 },
] as const

const SEIZA = 'Tori et Uke sont à genoux en Seiza, face à face, à la distance de Hizazume-no-maai (environ deux poings entre les genoux).'
const DEBOUT = 'Tori et Uke se font face debout, à la distance d’un pas (environ 40 cm).'
const MAIRI = 'Uke signale « Mairi » en tapant deux fois dès que la clé ou l’immobilisation devient efficace ; Tori relâche aussitôt.'
const TAI_SABAKI = 'Le déplacement (Tai-sabaki) précède la technique : esquiver puis contrôler, jamais opposer la force à la force.'

export const KIME_NO_KATA_TECHNIQUES: TechniqueKime[] = [
  // ── Idori — mains nues (5) ────────────────────────────────────────────────
  {
    ordre: 1, nom: 'Ryote-dori', titreFr: 'Saisie des deux poignets', serie: 'Idori', groupe: 'idori-mains-nues',
    objectif: 'Se libérer d’une saisie des deux poignets à genoux et contrôler par une clé de bras.',
    situation: SEIZA,
    attaque: 'Uke saisit les deux poignets de Tori en prise normale (pouces à l’intérieur) pour le contrôler, avec Kiai.',
    defense: 'Tori déséquilibre Uke vers l’avant en écartant les bras, frappe l’abdomen (Suigetsu) du pied droit, libère sa main gauche puis verrouille le coude gauche de Uke en Udehishigi-waki-gatame.',
    pointsCles: ['Écarter les bras vers l’extérieur pour rompre l’équilibre avant tout', 'Atemi au Suigetsu comme ouverture', 'Coude de Uke maintenu sous l’aisselle pour la clé'],
    erreurs: ['Tirer en force sans déséquilibrer d’abord', 'Négliger l’atemi qui crée l’ouverture', 'Poser la clé sans contrôler le poignet'],
    securite: ['Atemi contrôlé, sans contact réel', MAIRI],
    resume: 'La première réponse du kata : rompre l’équilibre, ouvrir par l’atemi, finir par la clé de coude.',
  },
  {
    ordre: 2, nom: 'Tsukkake', titreFr: 'Coup de poing direct', serie: 'Idori', groupe: 'idori-mains-nues',
    objectif: 'Esquiver un coup de poing à l’abdomen et contrôler par une clé de bras sur le ventre.',
    situation: SEIZA,
    attaque: 'Uke tente de frapper l’abdomen (Suigetsu) de Tori du poing droit, avec Kiai.',
    defense: 'Tori pivote vers sa droite pour esquiver, déséquilibre le bras de Uke vers l’avant, frappe entre les sourcils (Uto), saisit le poignet et verrouille le coude en Udehishigi-hara-gatame.',
    pointsCles: ['Pivot du corps pour sortir de la ligne du coup', 'Atemi à l’Uto en réponse immédiate', 'Coude de Uke plaqué contre l’abdomen de Tori'],
    erreurs: ['Reculer au lieu de pivoter', 'Bloquer le poing de face', 'Clé sans avoir déséquilibré'],
    securite: ['Atemi maîtrisé', MAIRI],
    resume: 'Esquive par pivot, atemi à l’Uto, puis clé de coude sur le ventre (hara-gatame).',
  },
  {
    ordre: 3, nom: 'Suri-age', titreFr: 'Poussée du front vers le haut', serie: 'Idori', groupe: 'idori-mains-nues',
    objectif: 'Répondre à une poussée du front et contrôler par une clé de coude au genou.',
    situation: SEIZA,
    attaque: 'Uke tente de pousser le front de Tori vers le haut et l’arrière avec la paume droite, doigts tendus, Kiai.',
    defense: 'Tori esquive le poignet de Uke vers le haut, déséquilibre vers l’avant à deux mains, frappe le Suigetsu du pied droit, amène Uke au sol et contrôle le coude en Udehishigi-hiza-gatame (genou sur le coude).',
    pointsCles: ['Dévier la poussée vers le haut, ne pas résister de front', 'Déséquilibre avant à deux mains', 'Pression du genou sur le coude pour la clé'],
    erreurs: ['Opposer la force à la poussée', 'Oublier l’atemi au Suigetsu', 'Genou mal placé sur l’articulation'],
    securite: ['Pression progressive du genou', MAIRI],
    resume: 'Déviation de la poussée, atemi, puis clé de coude au genou (hiza-gatame).',
  },
  {
    ordre: 4, nom: 'Yoko-uchi', titreFr: 'Coup à la tempe', serie: 'Idori', groupe: 'idori-mains-nues',
    objectif: 'Esquiver un coup circulaire à la tempe et immobiliser en Kata-gatame.',
    situation: SEIZA,
    attaque: 'Uke lève la main droite et tente de frapper la tempe gauche de Tori (Kasumi) du poing (Uzumaki), Kiai.',
    defense: 'Tori passe la tête sous le bras de Uke, avance le genou droit, immobilise en Kata-gatame, puis frappe verticalement le Suigetsu du coude droit.',
    pointsCles: ['Passer sous le bras plutôt que reculer', 'Immobilisation Kata-gatame stable', 'Atemi vertical du coude en finition'],
    erreurs: ['Se relever dans l’axe du coup', 'Kata-gatame sans contrôle du cou', 'Finition sans contrôle du bras'],
    securite: ['Atemi du coude contrôlé', MAIRI],
    resume: 'Esquive sous le bras, immobilisation Kata-gatame, atemi de finition.',
  },
  {
    ordre: 5, nom: 'Ushiro-dori', titreFr: 'Saisie par derrière', serie: 'Idori', groupe: 'idori-mains-nues',
    objectif: 'Se dégager d’une ceinture par derrière et projeter en Seoi-nage à genoux.',
    situation: 'Uke se déplace derrière Tori et se rapproche à genoux à la distance de Chikama (environ 20 cm).',
    attaque: 'Uke entoure les bras de Tori par derrière avec ses deux bras, tête à gauche, Kiai.',
    defense: 'Tori écarte les bras pour créer de l’espace, contrôle le bras gauche de Uke, glisse sa jambe droite en arrière et enroule Uke sur l’épaule en Seoi-nage, contrôle en Ushiro-kesa-gatame puis atemi à l’aine.',
    pointsCles: ['Créer l’espace en écartant les bras', 'Descendre le centre pour charger Uke', 'Contrôle final en Ushiro-kesa-gatame'],
    erreurs: ['Chercher à s’arracher en force', 'Charger sans avoir baissé les hanches', 'Lâcher le contrôle après la projection'],
    securite: ['Projection accompagnée, chute maîtrisée', MAIRI],
    resume: 'Dégagement, projection Seoi-nage à genoux, contrôle au sol et atemi.',
  },
  // ── Idori — poignard (3) ──────────────────────────────────────────────────
  {
    ordre: 6, nom: 'Tsukkomi', titreFr: 'Coup de poignard à l’abdomen', serie: 'Idori', groupe: 'idori-poignard',
    objectif: 'Esquiver une attaque de poignard à l’abdomen et contrôler par une clé de coude.',
    situation: 'Uke a inséré le poignard dans sa veste ; les deux sont à genoux à environ 45 cm.',
    attaque: 'Uke sort le poignard (lame vers le haut), avance le pied gauche et tente de poignarder l’abdomen (Suigetsu) de Tori, Kiai.',
    defense: 'Tori pivote pour esquiver, chasse le bras armé vers l’avant, frappe l’Uto, saisit le poignet et verrouille le coude en Udehishigi-hara-gatame.',
    pointsCles: ['Sortir de la ligne de l’arme par le pivot', 'Contrôler le bras armé, jamais la lame', 'Clé de coude après l’atemi'],
    erreurs: ['Reculer face à l’arme', 'Saisir la lame', 'Poser la clé sans contrôle du poignet armé'],
    securite: ['Poignard d’entraînement, geste maîtrisé', 'Le bras armé est toujours dirigé loin des deux partenaires', MAIRI],
    resume: 'Première attaque armée : esquiver l’arme, contrôler le bras, clé de coude.',
  },
  {
    ordre: 7, nom: 'Kiri-komi', titreFr: 'Coup de couteau vertical', serie: 'Idori', groupe: 'idori-poignard',
    objectif: 'Répondre à une attaque verticale de poignard et contrôler par Udehishigi-waki-gatame.',
    situation: 'Uke place le poignard à la ceinture (comme un sabre court), les deux à genoux à environ 45 cm.',
    attaque: 'Uke dégaine lentement et tente de frapper directement le front de Tori, Kiai.',
    defense: 'Tori pivote vers sa droite sans résister à l’attaque verticale, saisit le poignet armé à deux mains, déséquilibre en diagonale et verrouille le bras en Udehishigi-waki-gatame.',
    pointsCles: ['Ne pas opposer de blocage à l’attaque verticale', 'Reculer le corps en tournant', 'Deux mains sur le poignet armé'],
    erreurs: ['Bloquer la descente de front', 'Saisir trop haut sur l’avant-bras', 'Clé sans déséquilibre diagonal'],
    securite: ['Contrôle constant du bras armé', MAIRI],
    resume: 'Esquive de l’attaque verticale, contrôle du poignet, clé de bras (waki-gatame).',
  },
  {
    ordre: 8, nom: 'Yoko-tsuki', titreFr: 'Coup de poignard de côté', serie: 'Idori', groupe: 'idori-poignard',
    objectif: 'Esquiver un coup de poignard latéral et contrôler par une clé de coude.',
    situation: 'Uke s’agenouille sur le côté droit de Tori à environ 20 cm.',
    attaque: 'Uke pivote, avance le pied gauche et tente de poignarder le côté droit de l’abdomen de Tori, lame vers le haut, Kiai.',
    defense: 'Tori pivote de 180° vers la droite pour esquiver, chasse le bras armé vers l’avant, frappe l’Uto, saisit le poignet et verrouille le coude en Udehishigi-hara-gatame.',
    pointsCles: ['Grand pivot pour sortir de l’axe latéral', 'Chasser le bras armé loin du corps', 'Clé de coude après contrôle du poignet'],
    erreurs: ['Pivot insuffisant', 'Saisir la lame', 'Finir sans contrôle du poignet armé'],
    securite: ['Bras armé dirigé à l’écart', MAIRI],
    resume: 'Grand pivot, contrôle du bras armé latéral, clé de coude (hara-gatame).',
  },
  // ── Tachiai — mains nues (8) ──────────────────────────────────────────────
  {
    ordre: 9, nom: 'Ryote-dori', titreFr: 'Saisie des deux poignets (debout)', serie: 'Tachiai', groupe: 'tachiai-mains-nues',
    objectif: 'Se libérer debout d’une saisie des deux poignets et contrôler par une clé de bras.',
    situation: DEBOUT,
    attaque: 'Uke avance le pied droit et saisit les deux poignets de Tori en prise normale, Kiai.',
    defense: 'Tori déséquilibre vers l’avant en écartant les bras, frappe l’aine du pied droit, libère sa main gauche, tourne le corps et contrôle le bras de Uke sous l’aisselle en clé de coude.',
    pointsCles: ['Écarter les bras pour rompre l’équilibre', 'Atemi du pied comme ouverture', 'Rotation du corps pour placer la clé'],
    erreurs: ['Tirer sans déséquilibrer', 'Rester statique', 'Clé sans contrôle du bras'],
    securite: ['Atemi maîtrisé', MAIRI],
    resume: 'Version debout de Ryote-dori : déséquilibre, atemi, clé de bras.',
  },
  {
    ordre: 10, nom: 'Sode-tori', titreFr: 'Saisie de la manche', serie: 'Tachiai', groupe: 'tachiai-mains-nues',
    objectif: 'Répondre à une saisie de la manche par derrière et contrôler par un atemi.',
    situation: 'Uke se positionne sur l’arrière gauche de Tori.',
    attaque: 'Uke saisit la manche gauche de Tori à deux mains et pousse le bras vers l’avant en verrouillant, Kiai.',
    defense: 'Tori fait trois pas et, au troisième, avance en diagonale avant droite pour déséquilibrer Uke, puis donne un coup de pied de contrôle avec Kiai.',
    pointsCles: ['Suivre le déplacement sans résister à la poussée', 'Déséquilibre en diagonale au troisième pas', 'Atemi dans la direction du déséquilibre'],
    erreurs: ['S’opposer à la poussée de la manche', 'Rompre le rythme des trois pas', 'Atemi hors de l’axe de déséquilibre'],
    securite: ['Atemi de pied contrôlé', MAIRI],
    resume: 'Déplacement pour déséquilibrer, puis atemi de contrôle.',
  },
  {
    ordre: 11, nom: 'Tsukkake', titreFr: 'Coup de poing direct (debout)', serie: 'Tachiai', groupe: 'tachiai-mains-nues',
    objectif: 'Esquiver un coup de poing debout et contrôler par une clé de bras.',
    situation: DEBOUT,
    attaque: 'Uke avance et tente de frapper le visage de Tori du poing droit, Kiai.',
    defense: 'Tori esquive par le Tai-sabaki, dévie le bras, atemi en réponse, saisit le poignet et verrouille le coude sous l’aisselle.',
    pointsCles: ['Esquive par déplacement du corps', 'Contrôle du poignet frappeur', 'Clé de coude en finition'],
    erreurs: ['Bloquer le coup de face', 'Saisir sans dévier d’abord', 'Clé sans déséquilibre'],
    securite: ['Atemi maîtrisé', MAIRI],
    resume: 'Esquive, contrôle du bras frappeur, clé de coude debout.',
  },
  {
    ordre: 12, nom: 'Tsuki-age', titreFr: 'Uppercut au menton', serie: 'Tachiai', groupe: 'tachiai-mains-nues',
    objectif: 'Esquiver un uppercut et contrôler par une clé de bras.',
    situation: DEBOUT,
    attaque: 'Uke avance le pied droit et tente de frapper le menton de Tori par dessous du poing droit, Kiai.',
    defense: 'Tori esquive en inclinant le buste en arrière, saisit le poignet à deux mains, soulève le bras, recule et tourne le corps pour verrouiller le coude sous l’aisselle.',
    pointsCles: ['Retrait du buste pour esquiver l’uppercut', 'Saisie à deux mains du poignet', 'Rotation du corps pour la clé'],
    erreurs: ['Reculer les pieds sans esquiver le buste', 'Saisie instable du poignet', 'Clé sans rotation du corps'],
    securite: ['Atemi maîtrisé', MAIRI],
    resume: 'Esquive du buste, contrôle du poignet, clé de coude.',
  },
  {
    ordre: 13, nom: 'Suri-age', titreFr: 'Poussée du front (debout)', serie: 'Tachiai', groupe: 'tachiai-mains-nues',
    objectif: 'Répondre debout à une poussée du front et contrôler par une clé.',
    situation: DEBOUT,
    attaque: 'Uke tente de pousser le front de Tori vers le haut et l’arrière avec la paume, Kiai.',
    defense: 'Tori dévie le poignet vers le haut, déséquilibre vers l’avant, atemi puis contrôle du coude.',
    pointsCles: ['Dévier la poussée, ne pas résister', 'Déséquilibre avant', 'Clé de coude après atemi'],
    erreurs: ['Opposer la force', 'Oublier l’atemi', 'Clé mal placée'],
    securite: ['Atemi maîtrisé', MAIRI],
    resume: 'Version debout de Suri-age : déviation, atemi, clé de coude.',
  },
  {
    ordre: 14, nom: 'Yoko-uchi', titreFr: 'Coup à la tempe (debout)', serie: 'Tachiai', groupe: 'tachiai-mains-nues',
    objectif: 'Esquiver un coup circulaire debout et immobiliser.',
    situation: DEBOUT,
    attaque: 'Uke tente de frapper la tempe de Tori du poing droit en mouvement circulaire, Kiai.',
    defense: 'Tori passe sous le bras, contrôle en Kata-gatame ou clé selon l’engagement, atemi de finition.',
    pointsCles: ['Passer sous le bras du coup', 'Contrôle stable après esquive', 'Atemi de finition contrôlé'],
    erreurs: ['Rester dans l’axe du coup', 'Contrôle sans le cou', 'Finition sans le bras'],
    securite: ['Atemi maîtrisé', MAIRI],
    resume: 'Esquive sous le bras, immobilisation, atemi.',
  },
  {
    ordre: 15, nom: 'Ke-age', titreFr: 'Coup de pied à l’aine', serie: 'Tachiai', groupe: 'tachiai-mains-nues',
    objectif: 'Esquiver un coup de pied à l’aine et contrôler la jambe.',
    situation: DEBOUT,
    attaque: 'Uke avance le pied gauche et tente un coup de pied du pied droit à l’aine de Tori, Kiai.',
    defense: 'Tori recule le pied droit en tournant le corps, saisit la cheville de Uke à deux mains, déporte la jambe et donne un atemi de contrôle, Kiai.',
    pointsCles: ['Retrait et rotation pour esquiver le coup de pied', 'Saisie ferme de la cheville', 'Déport de la jambe pour déséquilibrer'],
    erreurs: ['Esquive tardive', 'Saisie glissante de la cheville', 'Atemi hors déséquilibre'],
    securite: ['Contrôle de la jambe sans torsion excessive', MAIRI],
    resume: 'Esquive du coup de pied, contrôle de la cheville, atemi.',
  },
  {
    ordre: 16, nom: 'Ushiro-dori', titreFr: 'Saisie par derrière (debout)', serie: 'Tachiai', groupe: 'tachiai-mains-nues',
    objectif: 'Se dégager debout d’une ceinture par derrière et projeter.',
    situation: 'Uke se place derrière Tori.',
    attaque: 'Uke entoure les bras de Tori par derrière, Kiai.',
    defense: 'Tori écarte les bras pour créer l’espace, baisse les hanches et projette Uke en Seoi-nage, contrôle au sol.',
    pointsCles: ['Créer l’espace en écartant les bras', 'Descendre le centre de gravité', 'Projection accompagnée'],
    erreurs: ['S’arracher en force', 'Charger trop haut', 'Lâcher après la projection'],
    securite: ['Chute maîtrisée', MAIRI],
    resume: 'Version debout d’Ushiro-dori : dégagement et projection Seoi-nage.',
  },
  // ── Tachiai — poignard (2) ────────────────────────────────────────────────
  {
    ordre: 17, nom: 'Tsukkomi', titreFr: 'Coup de poignard (debout)', serie: 'Tachiai', groupe: 'tachiai-poignard',
    objectif: 'Esquiver debout une attaque de poignard à l’abdomen et contrôler.',
    situation: 'Uke arme le poignard ; les deux se font face debout.',
    attaque: 'Uke avance et tente de poignarder l’abdomen de Tori, Kiai.',
    defense: 'Tori esquive par le Tai-sabaki, chasse le bras armé, atemi, saisit le poignet et verrouille le coude.',
    pointsCles: ['Sortir de la ligne de l’arme', 'Contrôler le bras armé, jamais la lame', 'Clé de coude après atemi'],
    erreurs: ['Reculer face à l’arme', 'Saisir la lame', 'Clé sans contrôle du poignet'],
    securite: ['Bras armé dirigé à l’écart', 'Poignard d’entraînement', MAIRI],
    resume: 'Version debout de Tsukkomi : esquiver l’arme, contrôler, clé de coude.',
  },
  {
    ordre: 18, nom: 'Kiri-komi', titreFr: 'Coup de couteau vertical (debout)', serie: 'Tachiai', groupe: 'tachiai-poignard',
    objectif: 'Répondre debout à une attaque verticale de poignard et contrôler.',
    situation: 'Uke arme le poignard comme un sabre court ; les deux debout.',
    attaque: 'Uke tente de frapper verticalement le front de Tori, Kiai.',
    defense: 'Tori esquive sans opposer de blocage, saisit le poignet armé, déséquilibre et verrouille le bras en waki-gatame.',
    pointsCles: ['Ne pas bloquer la descente de front', 'Contrôle du poignet armé', 'Déséquilibre avant la clé'],
    erreurs: ['Blocage de force', 'Saisie trop haute', 'Clé sans déséquilibre'],
    securite: ['Contrôle constant du bras armé', MAIRI],
    resume: 'Version debout de Kiri-komi : esquive, contrôle, clé de bras.',
  },
  // ── Tachiai — sabre (2) ───────────────────────────────────────────────────
  {
    ordre: 19, nom: 'Nuki-gake', titreFr: 'Blocage du dégainage', serie: 'Tachiai', groupe: 'tachiai-sabre',
    objectif: 'Empêcher le dégainage d’un sabre et contrôler avant que l’arme ne sorte.',
    situation: 'Tori et Uke se font face à la distance de Toma (environ 1,2 m).',
    attaque: 'Uke avance le pied droit et tente de dégainer le sabre de la main droite, Kiai.',
    defense: 'Tori avance vivement, saisit le poignet droit de Uke pour bloquer la sortie du sabre, passe derrière Uke et contrôle en saisissant le revers pour immobiliser.',
    pointsCles: ['Intervenir avant que la lame sorte du fourreau', 'Bloquer le poignet de dégainage', 'Prendre le dos de Uke pour contrôler'],
    erreurs: ['Réagir trop tard, une fois le sabre sorti', 'Bloquer le fourreau plutôt que le poignet', 'Contrôle sans passer derrière'],
    securite: ['Sabre d’entraînement, dégainage maîtrisé', MAIRI],
    resume: 'Anticiper le dégainage : bloquer le poignet, contrôler dans le dos.',
  },
  {
    ordre: 20, nom: 'Kiri-oroshi', titreFr: 'Coupe descendante du sabre', serie: 'Tachiai', groupe: 'tachiai-sabre',
    objectif: 'Esquiver une coupe descendante de sabre et contrôler l’attaquant — technique finale du kata.',
    situation: 'Tori en Shizen-hontai ; Uke à environ 2,7 m, sabre dégainé, pointé aux yeux de Tori, avance en Tsugi-ashi.',
    attaque: 'Uke avance et tente une coupe verticale descendante du sabre sur Tori, Kiai.',
    defense: 'Tori maintient la distance en reculant, esquive la coupe par le Tai-sabaki, entre sur le côté du bras armé, contrôle le poignet et immobilise Uke en le désarmant.',
    pointsCles: ['Gérer la distance (Ma-ai) face au sabre', 'Esquiver la ligne de coupe par le déplacement', 'Entrer sur le côté de l’arme pour contrôler'],
    erreurs: ['Rester dans la ligne de la coupe', 'Entrer de face contre le sabre', 'Contrôler sans neutraliser le poignet armé'],
    securite: ['Sabre d’entraînement, distance rigoureuse', 'Le bras armé est neutralisé avant tout contrôle', MAIRI],
    resume: 'La technique de clôture : maîtrise de la distance, esquive de la coupe, contrôle et désarmement.',
  },
]

export const KIME_NO_KATA_META = {
  titre: 'Kime-no-kata',
  sousTitre: 'Le kata de la décision',
  grade: '4e dan',
  famille: 'Kata',
  tempsLecture: '20 minutes',
  difficulte: 4,
  dureeEstimee: '≈ 6 semaines',
  prerequis: ['1er Dan — Nage-no-kata', 'Maîtrise du Tai-sabaki et des ukemi', 'Connaissance des atemi de kata'],
  objectifsApprentissage: [
    'Situer le Kime-no-kata dans l’histoire du Kodokan (kata de combat de Jigoro Kano)',
    'Distinguer les techniques Idori (à genoux) et Tachiai (debout)',
    'Reconnaître les réponses à mains nues, au poignard et au sabre',
    'Comprendre le rôle du Tai-sabaki et des atemi dans le contrôle de l’adversaire',
  ],
  tags: ['kata', 'kime-no-kata', '4e dan', 'idori', 'tachiai', 'self-défense', 'atemi', 'tai-sabaki', 'poignard', 'sabre'],
  motsCles: ['kime no kata', 'kata de la décision', 'combat', 'défense', 'kodokan', 'shobu no kata'],
}

/** Ressource catalogue_hazumi « Kime-no-kata » (clé du contenu premium). */
export const KIME_NO_KATA_RESSOURCE_ID = '185e7142-bf95-4cf4-b954-97b86edc0cf5'

export const KIME_NO_KATA_SOURCE = {
  url: 'https://www.youtube.com/watch?v=Hsvx-zNDEUo',
  titre: 'Kime-no-kata — Démonstration Kodokan',
  fournisseur: 'youtube',
  dureeSeconds: 757,
}

/** Note transverse : le déplacement précède toujours la technique. */
export const KIME_PRINCIPE_TRANSVERSE = TAI_SABAKI

export interface QuestionKime {
  categorie: 'comprehension' | 'technique' | 'securite' | 'erreurs'
  question: string
  reponses: string[]
  bonneReponse: number[]
  explication: string
}

/** Quiz Hazumi — même structure que Nage-no-kata (choix unique, correction expliquée). */
export const KIME_NO_KATA_QUIZ: QuestionKime[] = [
  { categorie: 'comprehension', question: 'Que signifie « Kime » dans Kime-no-kata ?', reponses: ['La souplesse', 'La décision', 'La vitesse', 'La chute'], bonneReponse: [1], explication: 'Kime-no-kata est le kata de la décision, un kata de combat créé par Jigoro Kano.' },
  { categorie: 'comprehension', question: 'Combien de techniques compte le Kime-no-kata officiel ?', reponses: ['15', '20', '26', '12'], bonneReponse: [1], explication: '20 techniques : 8 Idori (à genoux) et 12 Tachiai (debout).' },
  { categorie: 'comprehension', question: 'Que désigne « Idori » ?', reponses: ['Les techniques debout', 'Les techniques à genoux', 'Les techniques au sabre', 'La cérémonie'], bonneReponse: [1], explication: 'Idori regroupe les 8 techniques exécutées à genoux, en Seiza.' },
  { categorie: 'comprehension', question: 'Quel nom Jigoro Kano avait-il d’abord donné à ce kata ?', reponses: ['Shobu-no-kata', 'Ju-no-kata', 'Koshiki-no-kata', 'Goshin-jutsu'], bonneReponse: [0], explication: 'Le kata s’appelait initialement Shobu-no-kata avant de devenir le Kime-no-kata.' },
  { categorie: 'comprehension', question: 'Contre quelles armes Uke attaque-t-il dans le kata ?', reponses: ['Poignard uniquement', 'Poignard et sabre', 'Bâton et sabre', 'Aucune arme'], bonneReponse: [1], explication: 'Uke attaque à mains nues, au poignard, puis au sabre dans les dernières techniques.' },
  { categorie: 'technique', question: 'Quelle est la première technique du kata ?', reponses: ['Tsukkake', 'Ryote-dori', 'Ushiro-dori', 'Kiri-oroshi'], bonneReponse: [1], explication: 'Ryote-dori (saisie des deux poignets) ouvre la série Idori.' },
  { categorie: 'technique', question: 'Quelle est la technique finale du Kime-no-kata ?', reponses: ['Yoko-tsuki', 'Nuki-gake', 'Kiri-oroshi', 'Ryote-dori'], bonneReponse: [2], explication: 'Kiri-oroshi, réponse à la coupe descendante du sabre, clôt le kata.' },
  { categorie: 'technique', question: 'Sur quelle zone porte l’atemi le plus fréquent de Tori ?', reponses: ['Le genou', 'Le Suigetsu (abdomen) et l’Uto (entre les sourcils)', 'La nuque', 'Le poignet'], bonneReponse: [1], explication: 'Les atemi visent surtout le Suigetsu (plexus) et l’Uto (entre les sourcils).' },
  { categorie: 'technique', question: 'Quel principe précède toujours la technique dans ce kata ?', reponses: ['La force', 'Le Tai-sabaki (déplacement)', 'La vitesse pure', 'Le cri'], bonneReponse: [1], explication: 'Le Tai-sabaki — esquiver puis contrôler — précède la technique, sans opposer la force à la force.' },
  { categorie: 'technique', question: 'Dans Ushiro-dori, quelle projection Tori utilise-t-il ?', reponses: ['O-goshi', 'Seoi-nage', 'Uchi-mata', 'Tomoe-nage'], bonneReponse: [1], explication: 'Tori enroule Uke sur son épaule en forme de Seoi-nage.' },
  { categorie: 'securite', question: 'Comment Uke signale-t-il l’abandon ?', reponses: ['Il crie', 'Il tape deux fois (Mairi)', 'Il lève la main', 'Il ferme les yeux'], bonneReponse: [1], explication: 'Uke signale « Mairi » en tapant deux fois ; Tori relâche aussitôt.' },
  { categorie: 'securite', question: 'Que doit Tori contrôler en priorité sur une attaque armée ?', reponses: ['La lame', 'Le bras armé, dirigé loin des partenaires', 'Le pied de Uke', 'Le revers'], bonneReponse: [1], explication: 'Tori contrôle le bras armé — jamais la lame — et le dirige à l’écart des deux partenaires.' },
  { categorie: 'securite', question: 'Comment doivent être exécutés les atemi dans le kata ?', reponses: ['Au contact réel', 'Contrôlés, sans impact', 'Le plus fort possible', 'Sans Kiai'], bonneReponse: [1], explication: 'Les atemi sont maîtrisés et contrôlés, sans contact réel, pour la sécurité des partenaires.' },
  { categorie: 'erreurs', question: 'Quelle est l’erreur classique sur une attaque de poignard verticale (Kiri-komi) ?', reponses: ['Esquiver par pivot', 'Bloquer la descente de force', 'Contrôler le poignet', 'Déséquilibrer en diagonale'], bonneReponse: [1], explication: 'Bloquer de force l’attaque verticale est une erreur : Tori esquive sans s’opposer, puis contrôle.' },
  { categorie: 'erreurs', question: 'Quelle erreur guette Tori face au dégainage du sabre (Nuki-gake) ?', reponses: ['Bloquer le poignet trop tôt', 'Réagir trop tard, une fois la lame sortie', 'Passer derrière Uke', 'Saisir le revers'], bonneReponse: [1], explication: 'Il faut intervenir avant que la lame ne sorte du fourreau : réagir trop tard est l’erreur clé.' },
]
