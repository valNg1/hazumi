import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { parseTimestampChapters } from '../src/lib/lessonChapters'

// Usage:
//   npx tsx scripts/import-lesson-chapters.ts "<titre ressource>" <fichier.txt>
//   npx tsx scripts/import-lesson-chapters.ts "<titre ressource>" --clear
//
// Le fichier contient la liste de repères de la video (copiee depuis la
// description YouTube), au format "0:00 Titre" / "1:02:03 Titre". Les timestamps
// ne sont JAMAIS inventes : ils viennent de la video elle-meme.

const envContent = readFileSync('.env.local', 'utf-8')
const env: Record<string, string> = {}
envContent.split('\n').forEach((l) => { const i = l.indexOf('='); if (i > 0) env[l.slice(0, i).trim()] = l.slice(i + 1).trim() })
const supabase = createClient(env.VITE_SUPABASE_URL!, env.SUPABASE_SERVICE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } })

async function main() {
  const titre = process.argv[2]
  const arg = process.argv[3]
  if (!titre || !arg) {
    console.error('Usage: import-lesson-chapters "<titre ressource>" <fichier.txt | --clear>')
    process.exit(1)
  }

  const { data: res } = await supabase.from('catalogue_hazumi').select('id').eq('titre', titre).maybeSingle()
  if (!res) throw new Error(`Ressource introuvable: ${titre}`)
  const { data: lesson } = await supabase.from('lesson').select('id').eq('ressource_id', res.id).maybeSingle()
  if (!lesson) throw new Error(`Aucune lecon pour: ${titre}`)

  // Remplace integralement les chapitres de cette lecon.
  await supabase.from('lesson_chapters').delete().eq('lesson_id', lesson.id)

  if (arg === '--clear') {
    console.log(`Chapitres supprimes pour "${titre}".`)
    return
  }

  const text = readFileSync(arg, 'utf-8')
  const chapters = parseTimestampChapters(text)
  if (chapters.length === 0) {
    console.log('Aucun repère détecté dans le fichier — chapitres laissés vides.')
    return
  }
  const { error } = await supabase.from('lesson_chapters').insert(
    chapters.map((c) => ({ lesson_id: lesson.id, ordre: c.ordre, titre: c.titre, timestamp_seconds: c.timestamp_seconds, description: null }))
  )
  if (error) throw error
  console.log(`${chapters.length} chapitres importés pour "${titre}" :`)
  chapters.forEach((c) => console.log(`  ${Math.floor(c.timestamp_seconds / 60)}:${String(c.timestamp_seconds % 60).padStart(2, '0')} — ${c.titre}`))
}

main().catch((e) => { console.error(e); process.exit(1) })
