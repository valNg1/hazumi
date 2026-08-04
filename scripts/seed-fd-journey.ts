/**
 * Seed d'un journey de la collection Frédéric Demontfaucon (masterclass technique).
 *
 * Usage : npx tsx scripts/seed-fd-journey.ts <slug>
 * Le journey doit exister dans le registre FD_JOURNEYS (src/lib/fd/index.ts).
 *
 * Crée/actualise : media_sources -> catalogue_hazumi (ressource) -> asset_media
 * -> lesson (published) -> lesson_chapters -> lesson_quiz -> parcours + parcours_ressources.
 * Le contenu masterclass (sections) est porté par le code (registre), pas la base.
 * Idempotent. Univers : judo-ka.
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fdJourneyBySlug } from '../src/lib/fd'

const slug = process.argv[2]
if (!slug) { console.error('Usage : npx tsx scripts/seed-fd-journey.ts <slug>'); process.exit(1) }
const j = fdJourneyBySlug(slug)
if (!j) { console.error(`Journey introuvable dans FD_JOURNEYS : "${slug}"`); process.exit(1) }
if (!j.ressourceId || !j.titre || !j.video.url) { console.error('Journey incomplet (ressourceId/titre/video.url requis).'); process.exit(1) }

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n').filter((l) => l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
)
const sb = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_KEY)

// Parcours-first : 1 vidéo = 1 journey. Le PARCOURS EST le journey (titre = sujet).
// `LEGACY_UNIVERS` = contrainte technique héritée (colonne catalogue_hazumi.parcours,
// NOT NULL) : on renseigne la valeur la moins intrusive, mais on N'EXPOSE PAS l'univers
// comme structure produit → AUCUNE ligne parcours_univers (pas de navigation/catégorisation
// par univers hérité), et la ressource n'est pas listée dans la bibliothèque par univers.
const LEGACY_UNIVERS = j.univers

// 1. Parcours = le journey masterclass
const { data: pE } = await sb.from('parcours').select('id').eq('titre', j.titre).maybeSingle()
let parcoursId = (pE as { id: string } | null)?.id
if (!parcoursId) {
  const { data, error } = await sb.from('parcours').insert({
    titre: j.titre, description: j.content.meta.objectif, niveau: null, ordre: 10, publie: true,
  }).select('id').single()
  if (error) { console.error('parcours:', error.message); process.exit(1) }
  parcoursId = (data as { id: string }).id
} else {
  await sb.from('parcours').update({ description: j.content.meta.objectif, publie: true }).eq('id', parcoursId)
}
// NB : pas de parcours_univers (parcours-first, pas de navigation par univers hérité).

// 2. Source vidéo
const { data: sE } = await sb.from('media_sources').select('id').eq('url', j.video.url).maybeSingle()
let sourceId = (sE as { id: string } | null)?.id
if (!sourceId) {
  const { data, error } = await sb.from('media_sources').insert({
    url: j.video.url, titre: j.video.titre, fournisseur: 'youtube', duree_seconds: j.video.dureeSeconds,
  }).select('id').single()
  if (error) { console.error('media_sources:', error.message); process.exit(1) }
  sourceId = (data as { id: string }).id
}

// 3. Ressource (catalogue_hazumi) — id figé = ressourceId du journey
const champs = { id: j.ressourceId, titre: j.titre, type: 'video', parcours: LEGACY_UNIVERS, famille: 'Masterclass', grade: null, visible_bibliotheque: false, ordre: 1 }
const { data: rE } = await sb.from('catalogue_hazumi').select('id').eq('id', j.ressourceId).maybeSingle()
if (rE) await sb.from('catalogue_hazumi').update(champs).eq('id', j.ressourceId)
else {
  const { error } = await sb.from('catalogue_hazumi').insert(champs)
  if (error) { console.error('catalogue_hazumi:', error.message); process.exit(1) }
}

// 4. Média complet (principal)
await sb.from('asset_media').upsert({
  asset_id: j.ressourceId, source_id: sourceId, role: 'complet', segment_start_s: null, segment_end_s: null,
  est_principal: true, ordre: 0, titre: 'Masterclass complète',
}, { onConflict: 'asset_id,role' })

// 5. Leçon publiée
const objectif = j.content.meta.objectif
const { data: lE } = await sb.from('lesson').select('id').eq('ressource_id', j.ressourceId).maybeSingle()
let lessonId = (lE as { id: string } | null)?.id
if (!lessonId) {
  const { data, error } = await sb.from('lesson').insert({
    ressource_id: j.ressourceId, published: true, youtube_url: j.video.url,
    duree_estimee: j.content.meta.tempsLecture, objectif,
  }).select('id').single()
  if (error) { console.error('lesson:', error.message); process.exit(1) }
  lessonId = (data as { id: string }).id
} else {
  await sb.from('lesson').update({ youtube_url: j.video.url, published: true, objectif, duree_estimee: j.content.meta.tempsLecture }).eq('id', lessonId)
}

// 6. Chapitres (nav timestamps)
await sb.from('lesson_chapters').delete().eq('lesson_id', lessonId)
if (j.chapitres.length) {
  const chapitres = j.chapitres.map((c, i) => ({
    lesson_id: lessonId, ordre: i + 1, titre: c.titre, timestamp_seconds: c.timestampSeconds, description: c.description ?? null,
  }))
  const { error } = await sb.from('lesson_chapters').insert(chapitres)
  if (error) { console.error('lesson_chapters:', error.message); process.exit(1) }
}

// 7. Quiz
await sb.from('lesson_quiz').delete().eq('lesson_id', lessonId)
if (j.quiz.length) {
  const quiz = j.quiz.map((q, i) => ({
    lesson_id: lessonId, ordre: i + 1, question: q.question, type: 'choix_unique',
    reponses: q.reponses, bonne_reponse: q.bonneReponse, explication: q.explication,
  }))
  const { error } = await sb.from('lesson_quiz').insert(quiz)
  if (error) { console.error('lesson_quiz:', error.message); process.exit(1) }
}

// 8. Rattachement au parcours de collection
await sb.from('parcours_ressources').upsert(
  { parcours_id: parcoursId, ressource_id: j.ressourceId, ordre: 1, obligatoire: true },
  { onConflict: 'parcours_id,ressource_id', ignoreDuplicates: true }
)

console.log(`Seed FD OK — "${j.titre}" (${slug}) : ${j.chapitres.length} chapitres, ${j.quiz.length} questions.`)
