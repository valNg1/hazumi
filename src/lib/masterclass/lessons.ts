import type { MasterclassContent, MasterclassChapitre } from './masterclassContent'
import { fdMasterclassEntries, fdChapitreEntries } from '../fd'

// Registre global des masterclasses, par ressource_id (équivalent de PREMIUM_LESSONS
// pour les katas). Composé des collections existantes (aujourd'hui : Frédéric Demontfaucon).
export const MASTERCLASS_LESSONS: Record<string, MasterclassContent> = {
  ...fdMasterclassEntries(),
}

// Chapitres + transcript par ressource_id (section « Comprendre les techniques »).
export const MASTERCLASS_CHAPITRES: Record<string, MasterclassChapitre[]> = {
  ...fdChapitreEntries(),
}

export function getMasterclassContent(ressourceId: string | undefined): MasterclassContent | undefined {
  return ressourceId ? MASTERCLASS_LESSONS[ressourceId] : undefined
}

/**
 * Une leçon est une masterclass (vidéo + chapitres + notes ; quiz et sections
 * pédagogiques kata masqués) si un contenu est enregistré en code (collections comme
 * Frédéric Demontfaucon) OU, de façon data-driven, si la ressource est de la famille
 * « Masterclass » dans le catalogue — ce qui permet d'ajouter une masterclass par la
 * seule donnée, sans code par vidéo.
 */
export function estMasterclass(
  famille: string | null | undefined,
  contenuEnregistre?: MasterclassContent | undefined,
): boolean {
  return !!contenuEnregistre || famille === 'Masterclass'
}

export function getMasterclassChapitres(ressourceId: string | undefined): MasterclassChapitre[] {
  return ressourceId ? (MASTERCLASS_CHAPITRES[ressourceId] ?? []) : []
}

// Découpe le markdown d'une masterclass (table Supabase `masterclass`) en chapitres
// { titre, timestampSeconds, transcript }. Un chapitre commence à un titre
// « ## MM:SS — Titre » (ou HH:MM:SS) ; son corps s'arrête au chapitre suivant ou à un
// titre de niveau 1 (« # Metadata », « # Synthèse… »). Source unique de la section
// « Approfondir les techniques » (rendu par chapitre), commune à toutes les masterclasses.
const MC_CHAPITRE_RE = /^##\s+(?:(\d{1,2}):)?(\d{1,2}):(\d{2})\s+[—–-]\s+(.+?)\s*$/
export function parseMasterclassSections(markdown: string | null | undefined): MasterclassChapitre[] {
  const out: MasterclassChapitre[] = []
  let cur: MasterclassChapitre | null = null
  for (const line of (markdown ?? '').split('\n')) {
    const m = line.match(MC_CHAPITRE_RE)
    if (m) {
      if (cur) out.push(cur)
      const h = m[1] ? parseInt(m[1], 10) : 0
      cur = { titre: m[4].trim(), timestampSeconds: h * 3600 + parseInt(m[2], 10) * 60 + parseInt(m[3], 10), transcript: '' }
    } else if (/^#\s/.test(line)) {
      if (cur) { out.push(cur); cur = null }
    } else if (cur) {
      cur.transcript += line + '\n'
    }
  }
  if (cur) out.push(cur)
  return out
    .map((c) => ({ ...c, transcript: (c.transcript ?? '').trim() }))
    .filter((c) => c.transcript.length > 0)
}

// Approfondissement pédagogique (Espace Enseignant) : chaque item part d'une situation
// montrée dans la vidéo. Sous chaque « ## Titre » (après le marqueur de niveau 1
// « # APPROFONDIR »), chaque « ### Label » devient un bloc { label, contenu } ; le contenu
// est du markdown (le bloc « À retenir » est une liste à puces).
export interface ApprofondirBloc { label: string; contenu: string }
export interface ApprofondirItem { titre: string; blocs: ApprofondirBloc[] }
export function parseApprofondir(markdown: string | null | undefined): ApprofondirItem[] {
  const src = markdown ?? ''
  const marker = src.search(/^#\s+APPROFONDIR\s*$/m)
  if (marker < 0) return []
  const part = src.slice(marker).replace(/^#\s+APPROFONDIR\s*$/m, '')
  const out: ApprofondirItem[] = []
  for (const block of part.split(/^##\s+/m).slice(1)) {
    const nl = block.indexOf('\n')
    const titre = (nl < 0 ? block : block.slice(0, nl)).trim()
    const body = nl < 0 ? '' : block.slice(nl + 1)
    const heads = [...body.matchAll(/^###\s+(.+?)\s*$/gm)]
    const blocs: ApprofondirBloc[] = heads
      .map((h, i) => {
        const start = (h.index ?? 0) + h[0].length
        const end = i + 1 < heads.length ? (heads[i + 1].index ?? body.length) : body.length
        return { label: h[1].trim(), contenu: body.slice(start, end).trim() }
      })
      .filter((b) => b.contenu.length > 0)
    if (titre) out.push({ titre, blocs })
  }
  return out
}
