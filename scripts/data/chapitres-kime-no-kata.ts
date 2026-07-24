/**
 * Chapitres initiaux du Kime-no-kata (UV1 — 3e Dan).
 *
 * Issus du pipeline d'extraction (`scripts/extract-video-chapters.ts`) sur la
 * vidéo Kodokan `1-YAOozPQNU`. La vidéo ne porte NI chapitrage YouTube NI
 * timestamps en description : la seule source exploitable est la transcription
 * automatique anglaise.
 *
 * ⚠️ Toutes ces bornes sont des CANDIDATS à valider par le Product Owner.
 * Aucune n'est présentée comme validée. Les 20 techniques individuelles ne sont
 * pas bornées : l'ASR anglaise ne restitue pas les noms japonais
 * (« Kime-no-kata » est transcrit « Kimino cutter », « Ryote-dori » absent).
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

export const KIME_NO_KATA_CHAPITRES: ChapitreCandidat[] = [
  {
    ordre: 1,
    titre: 'Introduction et salut',
    timestamp: 0,
    valide: true,
    note: 'Début de vidéo — borne certaine.',
  },
  {
    ordre: 2,
    titre: 'Idori — les 8 techniques à genoux',
    timestamp: 0,
    valide: false,
    note: 'À VALIDER : début exact inconnu. La section commence après le cérémonial d’ouverture ; la transcription ne marque pas ce passage.',
  },
  {
    ordre: 3,
    titre: 'Tachi-ai — les 12 techniques debout',
    timestamp: 1636,
    valide: false,
    note: 'À VALIDER : dérivé de la transcription (27:16 « Now tachi, the uke and tori stand together »), après la repose du poignard qui clôt Idori.',
  },
]

export const KIME_NO_KATA_SOURCE = {
  url: 'https://www.youtube.com/watch?v=1-YAOozPQNU',
  titre: 'Kime-no-kata — Démonstration Kodokan',
  fournisseur: 'youtube',
  dureeSeconds: 2566,
}
