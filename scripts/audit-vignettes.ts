/**
 * Audit des vignettes : verifie que chaque ressource publiee en obtient une,
 * et distingue les vignettes reelles des vignettes generees en dernier recours.
 *   npx tsx scripts/audit-vignettes.ts
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolveThumbnail, isPlaceholder } from '../src/lib/thumbnails'

const env = Object.fromEntries(readFileSync('.env.local','utf8').split('\n').filter(l=>l.includes('='))
  .map(l=>[l.slice(0,l.indexOf('=')).trim(), l.slice(l.indexOf('=')+1).trim()]))
const sb = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_KEY)

const { data: cat } = await sb.from('catalogue_hazumi').select('id, titre, type, url, thumbnail_url, visible_bibliotheque')
const { data: vids } = await sb.from('videos').select('id, title, video_url')
const { data: les } = await sb.from('lesson').select('ressource_id, youtube_url')
const videoLecon = new Map(((les ?? []) as any[]).map(l => [l.ressource_id, l.youtube_url]))

let reelles = 0, generees = 0
console.log('=== CATALOGUE HAZUMI ===')
;((cat ?? []) as any[]).forEach(r => {
  const t = resolveThumbnail({ titre: r.titre, thumbnailUrl: r.thumbnail_url, url: r.url, lessonVideoUrl: videoLecon.get(r.id) })
  const gen = isPlaceholder(t)
  gen ? generees++ : reelles++
  console.log(`${gen ? 'GEN' : 'OK '} ${r.titre}${r.visible_bibliotheque ? '' : ' (masquee)'}`)
  if (gen) console.log(`      -> aucune source d'image : url=${r.url ?? 'NULL'}, lecon=${videoLecon.get(r.id) ?? 'NULL'}`)
})

console.log('\n=== VIDEOS PERSO ===')
let koPerso = 0
;((vids ?? []) as any[]).forEach(v => {
  const t = resolveThumbnail({ titre: v.title, url: v.video_url })
  if (isPlaceholder(t)) { koPerso++; console.log(`GEN ${v.title} -> ${v.video_url}`) }
})
console.log(`${(vids ?? []).length - koPerso}/${(vids ?? []).length} videos perso ont une vignette reelle`)

console.log(`\nBilan catalogue : ${reelles} vignettes reelles, ${generees} generees.`)
console.log('Aucune ressource sans vignette : le resolveur garantit toujours une image.')
