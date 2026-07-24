/**
 * Chapitres initiaux du Kime-no-kata (UV1 — 3e Dan).
 *
 * Issus du pipeline d'extraction (`scripts/extract-video-chapters.ts`) sur la
 * vidéo Kodokan `Hsvx-zNDEUo`. La vidéo ne porte NI chapitrage YouTube NI
 * timestamps en description : la seule source exploitable est la transcription
 * automatique anglaise.
 *
 * ⚠️ Source vidéo remplacée sur décision du Product Owner : toutes les bornes
 * détaillées ont été REMISES À ZÉRO et sont à revalider sur la nouvelle vidéo.
 * La structure du kata est conservée : 8 techniques Idori + 12 Tachi-ai.
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
    note: 'À VALIDER : borne réinitialisée suite au changement de source vidéo. À relever sur la nouvelle vidéo.',
  },
  {
    ordre: 3,
    titre: 'Tachi-ai — les 12 techniques debout',
    timestamp: 0,
    valide: false,
    note: 'À VALIDER : borne réinitialisée suite au changement de source vidéo. À relever sur la nouvelle vidéo.',
  },
]

export const KIME_NO_KATA_SOURCE = {
  url: 'https://www.youtube.com/watch?v=Hsvx-zNDEUo',
  titre: 'Kime-no-kata — Démonstration Kodokan',
  fournisseur: 'youtube',
  dureeSeconds: 757,
}
