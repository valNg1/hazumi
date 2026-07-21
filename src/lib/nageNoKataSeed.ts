import { NAGE_NO_KATA_TECHNIQUES, totalDansSerie, ROLE_PRINCIPAL } from './nageNoKata'
import { getPremiumContent, NAGE_NO_KATA_RESSOURCE_ID } from './lessonPremium'
import { techniqueCard, canonicalTechniqueName, techniqueAliases } from './techniqueCards'
import { parseTimecode, validateSegment, detectOverlaps } from './segments'
import type { MediaRole } from './assetMedia'

export interface BorneSaisie {
  nom: string
  debut: string | number | null
  fin: string | number | null
}

export interface SectionPlan {
  type: 'fiche' | 'points_attention' | 'erreurs'
  ordre: number
  titre: string
  contenu: string
}

export interface TechniquePlan {
  nom: string
  famille: string
  ordre: number
  total: number
  grade: string
  start: number
  end: number
  role: MediaRole
  estPrincipal: boolean
  thumbnail: string
  aliases: string[]
  sections: SectionPlan[]
}

export type SeedPlan =
  | { ok: false; erreurs: string[] }
  | { ok: true; techniques: TechniquePlan[] }

const GRADE = '1er dan'

/** Retrouve la decomposition premium d'une technique par son nom canonique. */
function detailPremium(nomCanonique: string) {
  const premium = getPremiumContent(NAGE_NO_KATA_RESSOURCE_ID)
  if (!premium) return null
  for (const serie of premium.series) {
    for (const t of serie.techniques) {
      if (canonicalTechniqueName(t.nom) === nomCanonique && t.detail) return t.detail
    }
  }
  return null
}

function sectionsDepuisDetail(nomCanonique: string): SectionPlan[] {
  const d = detailPremium(nomCanonique)
  if (!d) return []
  const fiche = [d.miseEnAction, d.kuzushi, d.tsukuri, d.kake].filter(Boolean).join('\n\n')
  return [
    { type: 'fiche', ordre: 0, titre: 'La technique', contenu: fiche },
    { type: 'points_attention', ordre: 0, titre: 'Rôle de Uke', contenu: d.uke },
    { type: 'erreurs', ordre: 0, titre: 'Erreur fréquente', contenu: d.erreur },
  ]
}

/**
 * Construit le plan de seed a partir des bornes saisies. Ne cree rien : il
 * valide et prepare. Renvoie la liste des erreurs si une seule borne manque ou
 * est incoherente — aucune donnee approximative ne peut passer.
 */
export function buildSeedPlan(bornes: BorneSaisie[], dureeVideo: number): SeedPlan {
  const erreurs: string[] = []

  // Chaque technique du roster doit avoir sa borne, dans l'ordre.
  const parNom = new Map(bornes.map((b) => [canonicalTechniqueName(b.nom), b]))

  const segments: { nom: string; start: number; end: number }[] = []
  const techniques: TechniquePlan[] = []

  for (const t of NAGE_NO_KATA_TECHNIQUES) {
    const b = parNom.get(t.nom)
    if (!b) { erreurs.push(`Borne manquante pour ${t.nom}`); continue }

    const start = b.debut === null ? null : parseTimecode(b.debut)
    const end = b.fin === null ? null : parseTimecode(b.fin)

    if (start === null) { erreurs.push(`${t.nom} : début non renseigné ou illisible`); continue }
    if (end === null) { erreurs.push(`${t.nom} : fin non renseignée ou illisible`); continue }

    const v = validateSegment(start, end, dureeVideo)
    if (!v.valide) { erreurs.push(`${t.nom} : ${v.raison}`); continue }

    segments.push({ nom: t.nom, start, end })
    const total = totalDansSerie(t.famille)
    techniques.push({
      nom: t.nom,
      famille: t.famille,
      ordre: t.ordre,
      total,
      grade: GRADE,
      start,
      end,
      role: ROLE_PRINCIPAL,
      estPrincipal: true,
      thumbnail: techniqueCard({ nom: t.nom, famille: t.famille, ordre: t.ordre, total }),
      aliases: techniqueAliases(t.nom),
      sections: sectionsDepuisDetail(t.nom),
    })
  }

  // Deux techniques ne doivent pas se chevaucher.
  detectOverlaps(segments).forEach((c) => erreurs.push(c))

  if (erreurs.length > 0) return { ok: false, erreurs }
  return { ok: true, techniques }
}
