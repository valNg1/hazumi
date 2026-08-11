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
// montrée dans la vidéo. Les 3 blocs (propose / construit / enseignant) sont lus DANS
// L'ORDRE sous chaque « ## Titre », après le marqueur de niveau 1 « # APPROFONDIR ».
export interface ApprofondirItem { titre: string; propose: string; construit: string; enseignant: string }
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
    const secs = body.split(/^###\s+.*$/m).slice(1).map((s) => s.trim())
    out.push({ titre, propose: secs[0] ?? '', construit: secs[1] ?? '', enseignant: secs[2] ?? '' })
  }
  return out.filter((x) => x.titre)
}
