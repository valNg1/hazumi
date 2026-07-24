/**
 * Chapitrage du Kime-no-kata (UV1 — 3e Dan), source `Hsvx-zNDEUo`.
 *
 * DEUX NIVEAUX :
 *
 * 1. Bornes MACRO (7) — fournies par le Directeur Technique. Fixes, validées.
 * 2. Bornes DÉTAILLÉES (26 techniques) — **non déterminables** sur cette source :
 *    la vidéo ne porte NI chapitrage YouTube, NI timestamps en description,
 *    NI piste de sous-titres (`has no automatic captions / no subtitles`).
 *    Aucune n'est inventée : toutes sont marquées « À valider » et ancrées sur
 *    le début de leur série, pour rester cliquables sans prétendre être exactes.
 *
 * L'ordre des techniques est le référentiel officiel fourni par le Directeur
 * Technique. Il n'a pas été recherché ni vérifié.
 */
export interface ChapitreCandidat {
  ordre: number
  titre: string
  /** Secondes depuis le début de la vidéo. */
  timestamp: number
  /** false = borne à valider par le PO avant toute exploitation pédagogique. */
  valide: boolean
  note: string
}

export interface SerieKata {
  titre: string
  timestamp: number
  techniques: string[]
}

/** Bornes macro validées + ordre officiel des techniques. Structure fixe. */
export const KIME_NO_KATA_SERIES: SerieKata[] = [
  { titre: 'Opening', timestamp: 0, techniques: [] },
  {
    titre: 'Series 1 — Idori (Unarmed)',
    timestamp: 64,
    techniques: ['Ryote-dori', 'Sode-tori', 'Tsukkake', 'Tsuki-age', 'Suri-age', 'Yoko-uchi', 'Ke-age', 'Ushiro-dori'],
  },
  {
    titre: 'Series 2 — Idori (Knife)',
    timestamp: 200,
    techniques: ['Tsukkake', 'Choku-zuki', 'Naname-zuki', 'Kiri-komi'],
  },
  {
    titre: 'Series 3 — Tachi-ai (Unarmed)',
    timestamp: 363,
    techniques: ['Ryote-dori', 'Sode-tori', 'Tsukkake', 'Tsuki-age', 'Suri-age', 'Yoko-uchi', 'Ushiro-dori'],
  },
  {
    titre: 'Series 4 — Tachi-ai (Knife)',
    timestamp: 507,
    techniques: ['Tsukkake', 'Choku-zuki', 'Naname-zuki', 'Nuki-gake'],
  },
  {
    titre: 'Series 5 — Tachi-ai (Sword)',
    timestamp: 590,
    techniques: ['Kiri-oroshi', 'Morote-zuki', 'Nukiuchi'],
  },
  { titre: 'Closing', timestamp: 673, techniques: [] },
]

const VALIDE = 'Borne macro validée par le Directeur Technique.'
const A_VALIDER =
  'À VALIDER : borne fine non déterminable — cette source n’a ni chapitrage, ni description horodatée, ni sous-titres. Ancrée sur le début de sa série.'

/** 7 bornes macro validées + 26 techniques marquées « À valider ». */
export const KIME_NO_KATA_CHAPITRES: ChapitreCandidat[] = KIME_NO_KATA_SERIES.flatMap((s) => [
  { titre: s.titre, timestamp: s.timestamp, valide: true, note: VALIDE },
  ...s.techniques.map((t) => ({
    titre: `${s.titre} · ${t}`,
    timestamp: s.timestamp,
    valide: false,
    note: A_VALIDER,
  })),
]).map((c, i) => ({ ordre: i + 1, ...c }))

export const KIME_NO_KATA_SOURCE = {
  url: 'https://www.youtube.com/watch?v=Hsvx-zNDEUo',
  titre: 'Kime-no-kata — Démonstration Kodokan',
  fournisseur: 'youtube',
  dureeSeconds: 757,
}
