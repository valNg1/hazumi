/**
 * Seed du parcours 3e Dan — UV1 Kime-no-kata (leçon complète).
 *
 * Reconstruit la leçon À PARTIR DE ZÉRO depuis la séquence officielle Kodokan
 * (scripts/data/kime-no-kata.ts, tirée de KodokanKimeNoKata.pdf).
 * Réutilise l'architecture existante : parcours -> catalogue_hazumi ->
 * media_sources -> asset_media -> lesson -> lesson_chapters / asset_sections /
 * lesson_quiz. Aucune nouvelle table, aucun nouveau concept.
 *
 * Idempotent.
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import {
  KIME_MACRO_CHAPITRES,
  KIME_NO_KATA_META,
  KIME_NO_KATA_SOURCE,
  KIME_NO_KATA_QUIZ,
} from '../src/lib/kimeNoKata'

const UNIVERS = 'kyu'
const NIVEAU = '3e dan'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n').filter((l) => l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
)
const sb = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_KEY)

// ── 1. Parcours 3e Dan ──────────────────────────────────────────────────────
const TITRE_PARCOURS = 'Préparer le 3e Dan'
const { data: pE } = await sb.from('parcours').select('id').eq('titre', TITRE_PARCOURS).maybeSingle()
let parcoursId = (pE as { id: string } | null)?.id
if (!parcoursId) {
  const { data, error } = await sb.from('parcours').insert({
    titre: TITRE_PARCOURS,
    description: 'Parcours 3e Dan. UV1 : Kime-no-kata, le kata de la décision — 20 techniques de défense, 8 à genoux (Idori) et 12 debout (Tachiai).',
    niveau: NIVEAU, duree_estimee: KIME_NO_KATA_META.dureeEstimee, ordre: 3, publie: true,
  }).select('id').single()
  if (error) { console.error('parcours:', error.message); process.exit(1) }
  parcoursId = (data as { id: string }).id
}
await sb.from('parcours_univers').upsert({ parcours_id: parcoursId, univers: UNIVERS }, { onConflict: 'parcours_id,univers', ignoreDuplicates: true })

// ── 2. Source vidéo ─────────────────────────────────────────────────────────
const { data: sE } = await sb.from('media_sources').select('id').eq('url', KIME_NO_KATA_SOURCE.url).maybeSingle()
let sourceId = (sE as { id: string } | null)?.id
if (!sourceId) {
  const { data, error } = await sb.from('media_sources').insert({
    url: KIME_NO_KATA_SOURCE.url, titre: KIME_NO_KATA_SOURCE.titre,
    fournisseur: KIME_NO_KATA_SOURCE.fournisseur, duree_seconds: KIME_NO_KATA_SOURCE.dureeSeconds,
  }).select('id').single()
  if (error) { console.error('media_sources:', error.message); process.exit(1) }
  sourceId = (data as { id: string }).id
}

// ── 3. Ressource UV1 ────────────────────────────────────────────────────────
const { data: rE } = await sb.from('catalogue_hazumi').select('id').eq('titre', 'Kime-no-kata').maybeSingle()
const champs = { titre: 'Kime-no-kata', type: 'video', parcours: UNIVERS, famille: 'Kata', grade: NIVEAU, visible_bibliotheque: true, ordre: 1, tags: KIME_NO_KATA_META.tags }
let rid = (rE as { id: string } | null)?.id
if (rid) await sb.from('catalogue_hazumi').update(champs).eq('id', rid)
else {
  const { data, error } = await sb.from('catalogue_hazumi').insert(champs).select('id').single()
  if (error) { console.error('catalogue_hazumi:', error.message); process.exit(1) }
  rid = (data as { id: string }).id
}

// ── 4. Média complet (principal) ────────────────────────────────────────────
await sb.from('asset_media').upsert({
  asset_id: rid, source_id: sourceId, role: 'complet', segment_start_s: null, segment_end_s: null,
  est_principal: true, ordre: 0, titre: 'Démonstration complète',
}, { onConflict: 'asset_id,role' })

// ── 5. Leçon publiée ────────────────────────────────────────────────────────
const objectif = KIME_NO_KATA_META.objectifsApprentissage.join(' · ')
const { data: lE } = await sb.from('lesson').select('id').eq('ressource_id', rid).maybeSingle()
let lessonId = (lE as { id: string } | null)?.id
if (!lessonId) {
  const { data, error } = await sb.from('lesson').insert({
    ressource_id: rid, published: true, youtube_url: KIME_NO_KATA_SOURCE.url,
    duree_estimee: KIME_NO_KATA_META.tempsLecture, objectif,
  }).select('id').single()
  if (error) { console.error('lesson:', error.message); process.exit(1) }
  lessonId = (data as { id: string }).id
} else {
  await sb.from('lesson').update({ youtube_url: KIME_NO_KATA_SOURCE.url, published: true, objectif, duree_estimee: KIME_NO_KATA_META.tempsLecture }).eq('id', lessonId)
}

// ── 6. Chapitres : 7 bornes macro validées uniquement (pas de doublon) ──────
// Les 20 fiches techniques sont portées par le contenu premium
// (src/lib/lessonPremium.ts), section « Les séries du kata ». Les chapitres
// vidéo se limitent donc aux 7 repères horodatés validés.
await sb.from('lesson_chapters').delete().eq('lesson_id', lessonId)
const MACRO_DESC = [
  'Salut debout, mise en place des armes, salut à genoux.',
  'Idori (1–5) : Ryote-dori, Tsukkake, Suri-age, Yoko-uchi, Ushiro-dori.',
  'Idori au poignard (6–8) : Tsukkomi, Kiri-komi, Yoko-tsuki.',
  'Tachiai (9–16) : Ryote-dori, Sode-tori, Tsukkake, Tsuki-age, Suri-age, Yoko-uchi, Ke-age, Ushiro-dori.',
  'Tachiai au poignard (17–18) : Tsukkomi, Kiri-komi.',
  'Tachiai au sabre (19–20) : Nuki-gake, Kiri-oroshi.',
  'Saluts de clôture, remise des armes.',
]
const chapitres = KIME_MACRO_CHAPITRES.map((c, i) => ({
  lesson_id: lessonId, ordre: i + 1, titre: c.titre, timestamp_seconds: c.timestamp, description: MACRO_DESC[i],
}))
const { error: eC } = await sb.from('lesson_chapters').insert(chapitres)
if (eC) { console.error('lesson_chapters:', eC.message); process.exit(1) }

// ── 7. Sections pédagogiques : portées par le contenu premium, pas la DB ─────
// On nettoie d'éventuelles sections héritées pour éviter le mode « clip ».
await sb.from('asset_sections').delete().eq('asset_id', rid)

// ── 8. Quiz ─────────────────────────────────────────────────────────────────
await sb.from('lesson_quiz').delete().eq('lesson_id', lessonId)
const quiz = KIME_NO_KATA_QUIZ.map((q, i) => ({
  lesson_id: lessonId, ordre: i + 1, question: q.question, type: 'choix_unique',
  reponses: q.reponses, bonne_reponse: q.bonneReponse, explication: q.explication,
}))
const { error: eQ } = await sb.from('lesson_quiz').insert(quiz)
if (eQ) { console.error('lesson_quiz:', eQ.message); process.exit(1) }

// ── 9. Rattachement au parcours ─────────────────────────────────────────────
await sb.from('parcours_ressources').upsert(
  { parcours_id: parcoursId, ressource_id: rid, ordre: 1, obligatoire: true },
  { onConflict: 'parcours_id,ressource_id', ignoreDuplicates: true }
)

console.log(`Seed 3e Dan OK — ${chapitres.length} chapitres macro, 0 section (contenu premium), ${quiz.length} questions.`)
