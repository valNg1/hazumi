import type { Belt } from '../types'

export type TechniqueStatus = 'a_travailler' | 'en_cours' | 'acquis'

export interface Technique {
  key: string
  nom: string
  categorie: 'ukemi' | 'tachi-waza' | 'ne-waza' | 'kata' | 'regles'
  description?: string
}

export interface BeltCurriculum {
  belt: Belt
  label: string
  color: string
  kyu: string
  objectif: string
  techniques: Technique[]
}

export const CURRICULUM: BeltCurriculum[] = [
  {
    belt: 'blanche',
    label: 'Ceinture Blanche',
    color: '#FFFFFF',
    kyu: '9e kyu',
    objectif: 'Maîtriser les chutes et les premières projections',
    techniques: [
      { key: 'mae-ukemi', nom: 'Mae ukemi', categorie: 'ukemi', description: 'Chute avant' },
      { key: 'yoko-ukemi', nom: 'Yoko ukemi', categorie: 'ukemi', description: 'Chute latérale' },
      { key: 'ushiro-ukemi', nom: 'Ushiro ukemi', categorie: 'ukemi', description: 'Chute arrière' },
      { key: 'mae-mawari-ukemi', nom: 'Mae mawari ukemi', categorie: 'ukemi', description: 'Chute avant roulée' },
      { key: 'o-goshi', nom: 'O-goshi', categorie: 'tachi-waza', description: 'Grande hanche' },
      { key: 'de-ashi-barai', nom: 'De-ashi-barai', categorie: 'tachi-waza', description: 'Balayage du pied avancé' },
      { key: 'kesa-gatame', nom: 'Kesa-gatame', categorie: 'ne-waza', description: 'Immobilisation en écharpe' },
      { key: 'hon-kesa-gatame', nom: 'Hon-kesa-gatame', categorie: 'ne-waza', description: 'Immobilisation en écharpe principale' },
    ],
  },
  {
    belt: 'jaune',
    label: 'Ceinture Jaune',
    color: '#FFD700',
    kyu: '8e kyu',
    objectif: 'Développer les projections de base et les immobilisations',
    techniques: [
      { key: 'ippon-seoi-nage', nom: 'Ippon-seoi-nage', categorie: 'tachi-waza', description: 'Projection sur une épaule' },
      { key: 'morote-seoi-nage', nom: 'Morote-seoi-nage', categorie: 'tachi-waza', description: 'Projection sur deux épaules' },
      { key: 'uki-goshi', nom: 'Uki-goshi', categorie: 'tachi-waza', description: 'Hanche flottante' },
      { key: 'o-soto-otoshi', nom: 'O-soto-otoshi', categorie: 'tachi-waza', description: 'Grande chute extérieure' },
      { key: 'kata-gatame', nom: 'Kata-gatame', categorie: 'ne-waza', description: 'Immobilisation par l\'épaule' },
      { key: 'mune-gatame', nom: 'Mune-gatame', categorie: 'ne-waza', description: 'Immobilisation par la poitrine' },
      { key: 'kuzure-kesa-gatame', nom: 'Kuzure-kesa-gatame', categorie: 'ne-waza', description: 'Variante kesa-gatame' },
    ],
  },
  {
    belt: 'orange',
    label: 'Ceinture Orange',
    color: '#FF8C00',
    kyu: '7e kyu',
    objectif: 'Maîtriser les techniques de hanche et développer le jeu au sol',
    techniques: [
      { key: 'harai-goshi', nom: 'Harai-goshi', categorie: 'tachi-waza', description: 'Projection par fauchage de hanche' },
      { key: 'tai-otoshi', nom: 'Tai-otoshi', categorie: 'tachi-waza', description: 'Chute du corps' },
      { key: 'sasae-tsuri-komi-ashi', nom: 'Sasae-tsuri-komi-ashi', categorie: 'tachi-waza', description: 'Arrêt-traction-soulèvement du pied' },
      { key: 'ko-soto-gake', nom: 'Ko-soto-gake', categorie: 'tachi-waza', description: 'Petit crochet extérieur' },
      { key: 'kami-shiho-gatame', nom: 'Kami-shiho-gatame', categorie: 'ne-waza', description: 'Immobilisation par le haut' },
      { key: 'yoko-shiho-gatame', nom: 'Yoko-shiho-gatame', categorie: 'ne-waza', description: 'Immobilisation latérale des quatre coins' },
      { key: 'kuzure-kami-shiho', nom: 'Kuzure-kami-shiho-gatame', categorie: 'ne-waza', description: 'Variante immobilisation par le haut' },
    ],
  },
  {
    belt: 'verte',
    label: 'Ceinture Verte',
    color: '#228B22',
    kyu: '6e kyu',
    objectif: 'Acquérir les techniques de jambes et initiation aux clés et étranglements',
    techniques: [
      { key: 'o-uchi-gari', nom: 'O-uchi-gari', categorie: 'tachi-waza', description: 'Grand fauchage intérieur' },
      { key: 'ko-uchi-gari', nom: 'Ko-uchi-gari', categorie: 'tachi-waza', description: 'Petit fauchage intérieur' },
      { key: 'hane-goshi', nom: 'Hane-goshi', categorie: 'tachi-waza', description: 'Hanche bondissante' },
      { key: 'ashi-guruma', nom: 'Ashi-guruma', categorie: 'tachi-waza', description: 'Roue du pied' },
      { key: 'okuri-eri-jime', nom: 'Okuri-eri-jime', categorie: 'ne-waza', description: 'Étranglement en glissant sur le revers' },
      { key: 'hadaka-jime', nom: 'Hadaka-jime', categorie: 'ne-waza', description: 'Étranglement à mains nues' },
      { key: 'juji-gatame', nom: 'Ude-hishigi-juji-gatame', categorie: 'ne-waza', description: 'Clé de bras en croix' },
    ],
  },
  {
    belt: 'bleue',
    label: 'Ceinture Bleue',
    color: '#1565C0',
    kyu: '5e kyu',
    objectif: 'Maîtriser les enchaînements et approfondir le jeu au sol',
    techniques: [
      { key: 'uchi-mata', nom: 'Uchi-mata', categorie: 'tachi-waza', description: 'Fauchage intérieur de la cuisse' },
      { key: 'ko-soto-gari', nom: 'Ko-soto-gari', categorie: 'tachi-waza', description: 'Petit fauchage extérieur' },
      { key: 'o-soto-gari', nom: 'O-soto-gari', categorie: 'tachi-waza', description: 'Grand fauchage extérieur' },
      { key: 'sode-tsuri-komi-goshi', nom: 'Sode-tsuri-komi-goshi', categorie: 'tachi-waza', description: 'Hanche traction-soulèvement par la manche' },
      { key: 'sankaku-jime', nom: 'Sankaku-jime', categorie: 'ne-waza', description: 'Étranglement en triangle' },
      { key: 'koshi-jime', nom: 'Koshi-jime', categorie: 'ne-waza', description: 'Étranglement de hanche' },
      { key: 'hiza-gatame', nom: 'Hiza-gatame', categorie: 'ne-waza', description: 'Clé de bras au genou' },
      { key: 'enchainement-tachi-ne', nom: 'Enchaînement debout-sol', categorie: 'tachi-waza', description: 'Transition attaque debout → sol' },
    ],
  },
  {
    belt: 'marron',
    label: 'Ceinture Marron',
    color: '#6D3B1E',
    kyu: '4e - 2e kyu',
    objectif: 'Perfectionner la technique et développer une stratégie de combat',
    techniques: [
      { key: 'tomoe-nage', nom: 'Tomoe-nage', categorie: 'tachi-waza', description: 'Projection en cercle' },
      { key: 'sumi-gaeshi', nom: 'Sumi-gaeshi', categorie: 'tachi-waza', description: 'Renversement du coin' },
      { key: 'yoko-guruma', nom: 'Yoko-guruma', categorie: 'tachi-waza', description: 'Roue latérale' },
      { key: 'harai-tsuri-komi-ashi', nom: 'Harai-tsuri-komi-ashi', categorie: 'tachi-waza', description: 'Balayage-traction-soulèvement du pied' },
      { key: 'gyaku-juji-jime', nom: 'Gyaku-juji-jime', categorie: 'ne-waza', description: 'Étranglement en croix inversée' },
      { key: 'kata-juji-jime', nom: 'Kata-juji-jime', categorie: 'ne-waza', description: 'Étranglement en demi-croix' },
      { key: 'waki-gatame', nom: 'Ude-hishigi-waki-gatame', categorie: 'ne-waza', description: 'Clé de bras sous l\'aisselle' },
      { key: 'nage-no-kata-1', nom: 'Nage-no-kata (notions)', categorie: 'kata', description: '5 premières formes du kata de projection' },
      { key: 'regles-competition', nom: 'Règles de compétition', categorie: 'regles', description: 'Règlement IJF / arbitrage de base' },
    ],
  },
  {
    belt: 'noire',
    label: 'Ceinture Noire',
    color: '#0A0A0A',
    kyu: '1er Dan',
    objectif: 'Excellence technique, pédagogie et esprit du judo',
    techniques: [
      { key: 'nage-no-kata-complet', nom: 'Nage-no-kata (complet)', categorie: 'kata', description: '15 techniques du kata de projection' },
      { key: 'katame-no-kata', nom: 'Katame-no-kata (notions)', categorie: 'kata', description: 'Kata des techniques de contrôle' },
      { key: 'ju-no-kata-1dan', nom: 'Ju-no-kata (notions)', categorie: 'kata', description: 'Kata de la souplesse' },
      { key: 'pedagogie-1dan', nom: 'Pédagogie de base', categorie: 'regles', description: 'Capacité à transmettre une technique' },
      { key: 'arbitrage-regional', nom: 'Arbitrage régional', categorie: 'regles', description: 'Maîtrise du règlement IJF complet' },
      { key: 'programme-libre-1dan', nom: 'Programme libre', categorie: 'tachi-waza', description: 'Enchaînements et contres de haut niveau' },
      { key: 'randori-1dan', nom: 'Niveau randori', categorie: 'tachi-waza', description: 'Randori de qualité 1er dan' },
    ],
  },
  {
    belt: 'noire-2',
    label: 'Ceinture Noire',
    color: '#0A0A0A',
    kyu: '2e Dan',
    objectif: 'Approfondissement technique, enseignement et kata avancé',
    techniques: [
      { key: 'katame-no-kata-complet', nom: 'Katame-no-kata (complet)', categorie: 'kata', description: '15 techniques du kata de contrôle' },
      { key: 'ju-no-kata-2dan', nom: 'Ju-no-kata (complet)', categorie: 'kata', description: '15 formes du kata de souplesse' },
      { key: 'kime-no-kata-notions', nom: 'Kime-no-kata (notions)', categorie: 'kata', description: 'Kata de la décision — techniques de self-défense' },
      { key: 'toku-waza-2dan', nom: 'Tokui-waza', categorie: 'tachi-waza', description: 'Technique favorite maîtrisée à haut niveau' },
      { key: 'contre-attaques-2dan', nom: 'Contre-attaques', categorie: 'tachi-waza', description: 'Kaeshi-waza et hansoku-make techniques' },
      { key: 'enchainements-2dan', nom: 'Renraku-waza', categorie: 'tachi-waza', description: 'Enchaînements debout-sol à haut niveau' },
      { key: 'pedagogie-2dan', nom: 'Pédagogie avancée', categorie: 'regles', description: 'Animation de cours, progression pédagogique' },
      { key: 'arbitrage-2dan', nom: 'Arbitrage officiel', categorie: 'regles', description: 'Capacité à arbitrer en compétition officielle' },
    ],
  },
  {
    belt: 'noire-3',
    label: 'Ceinture Noire',
    color: '#0A0A0A',
    kyu: '3e Dan',
    objectif: 'Maîtrise complète, formation et rayonnement du judo',
    techniques: [
      { key: 'kime-no-kata-complet', nom: 'Kime-no-kata (complet)', categorie: 'kata', description: '20 formes du kata de la décision' },
      { key: 'kodokan-goshin-jutsu', nom: 'Kodokan goshin-jutsu (notions)', categorie: 'kata', description: 'Kata de self-défense moderne' },
      { key: 'itsutsu-no-kata-notions', nom: 'Itsutsu-no-kata (notions)', categorie: 'kata', description: 'Kata des cinq principes' },
      { key: 'toku-waza-3dan', nom: 'Système de judo complet', categorie: 'tachi-waza', description: 'Cohérence tactique debout-sol maîtrisée' },
      { key: 'coaching-3dan', nom: 'Coaching compétition', categorie: 'regles', description: 'Encadrement d\'athlètes en compétition' },
      { key: 'pedagogie-3dan', nom: 'Formation de moniteurs', categorie: 'regles', description: 'Capacité à former des enseignants débutants' },
      { key: 'culture-judo-3dan', nom: 'Histoire & philosophie du judo', categorie: 'regles', description: 'Jigoro Kano, principes du Judo, voie du Budo' },
    ],
  },
  {
    belt: 'noire-4',
    label: 'Ceinture Noire',
    color: '#0A0A0A',
    kyu: '4e Dan',
    objectif: 'Expert reconnu, contribution à la discipline',
    techniques: [
      { key: 'kodokan-goshin-jutsu-complet', nom: 'Kodokan goshin-jutsu (complet)', categorie: 'kata', description: '21 formes du kata de self-défense' },
      { key: 'itsutsu-no-kata-complet', nom: 'Itsutsu-no-kata (complet)', categorie: 'kata', description: 'Les 5 formes des principes universels' },
      { key: 'seiryoku-zen-yo-kokumin-taiiku', nom: 'Seiryoku-zen-yo kokumin-taiiku', categorie: 'kata', description: 'Kata de l\'éducation physique nationale' },
      { key: 'recherche-4dan', nom: 'Contribution technique', categorie: 'regles', description: 'Travail de recherche ou publication technique' },
      { key: 'formation-4dan', nom: 'Formation de cadres', categorie: 'regles', description: 'Formation de ceintures noires et cadres de clubs' },
      { key: 'rayonnement-4dan', nom: 'Rayonnement du judo', categorie: 'regles', description: 'Action de développement du judo (club, ligue, comité)' },
    ],
  },
  {
    belt: 'noire-5',
    label: 'Ceinture Noire',
    color: '#0A0A0A',
    kyu: '5e Dan',
    objectif: 'Maître du judo — transmission et héritage',
    techniques: [
      { key: 'ju-no-kata-5dan', nom: 'Ju-no-kata (enseignement)', categorie: 'kata', description: 'Transmission et correction du kata de souplesse' },
      { key: 'tous-kata-5dan', nom: 'Maîtrise des kata', categorie: 'kata', description: 'Ensemble des kata du programme Kodokan' },
      { key: 'nage-no-kata-enseignement', nom: 'Nage-no-kata (enseignement)', categorie: 'kata', description: 'Démonstration et transmission de haut niveau' },
      { key: 'philosophie-5dan', nom: 'Philosophie du Budo', categorie: 'regles', description: 'Jita-kyoei, Seiryoku-zenyo — les principes du judo' },
      { key: 'heritage-5dan', nom: 'Héritage & transmission', categorie: 'regles', description: 'Formation de Dan, développement de la discipline' },
      { key: 'contribution-nationale', nom: 'Contribution nationale', categorie: 'regles', description: 'Reconnaissance par la FFJDA ou une fédération nationale' },
    ],
  },
]

const CATEGORIE_LABELS: Record<string, string> = {
  'ukemi': 'Chutes',
  'tachi-waza': 'Techniques debout',
  'ne-waza': 'Techniques au sol',
  'kata': 'Kata',
  'regles': 'Règles & culture',
}

export function getCategorieLabel(cat: string): string {
  return CATEGORIE_LABELS[cat] ?? cat
}

export function getBeltCurriculum(belt: Belt): BeltCurriculum | undefined {
  return CURRICULUM.find(c => c.belt === belt)
}

export function getBeltIndex(belt: Belt): number {
  return CURRICULUM.findIndex(c => c.belt === belt)
}
