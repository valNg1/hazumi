import { supabase } from './supabase'

// Section « Comprendre les techniques » — masterclasses techniques approfondies.
// Contenu 100% en base (table `masterclass`), distinct du moteur Leçon.

export interface Masterclass {
  id: string
  titre: string
  slug: string
  youtube_url: string
  contenu: string // markdown complet (lesson.md), chapitré via titres ## avec horodatages
  published: boolean
  created_at: string
}

export interface MasterclassChapitre {
  label: string
  seconds: number
}

const COLS = 'id, titre, slug, youtube_url, contenu, published, created_at'

// Chapitres pour la nav vidéo : titres markdown « ## MM:SS — Titre » (ou HH:MM:SS).
// N'affecte pas le rendu markdown (fait à part) : sert uniquement au saut vidéo.
export function parseMasterclassChapters(markdown: string): MasterclassChapitre[] {
  const out: MasterclassChapitre[] = []
  const re = /^##\s+(?:(\d{1,2}):)?(\d{1,2}):(\d{2})\s+[—–-]\s+(.+?)\s*$/gm
  let m: RegExpExecArray | null
  while ((m = re.exec(markdown ?? '')) !== null) {
    const h = m[1] ? parseInt(m[1], 10) : 0
    const min = parseInt(m[2], 10)
    const sec = parseInt(m[3], 10)
    out.push({ label: m[4].trim(), seconds: h * 3600 + min * 60 + sec })
  }
  return out
}

// Liste des masterclasses publiées. Tolère l'absence de table (retourne []).
export async function fetchPublishedMasterclasses(): Promise<Masterclass[]> {
  try {
    const { data, error } = await supabase
      .from('masterclass')
      .select(COLS)
      .eq('published', true)
      .order('created_at', { ascending: true })
    if (error) return []
    return (data as Masterclass[]) ?? []
  } catch {
    return []
  }
}

export async function fetchMasterclassBySlug(slug: string): Promise<Masterclass | null> {
  try {
    const { data, error } = await supabase
      .from('masterclass')
      .select(COLS)
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle()
    if (error) return null
    return (data as Masterclass) ?? null
  } catch {
    return null
  }
}
