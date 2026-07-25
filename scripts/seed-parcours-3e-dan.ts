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
  KIME_NO_KATA_TECHNIQUES,
  KIME_MACRO_CHAPITRES,
  GROUPE_TIMESTAMP,
  KIME_NO_KATA_META,
  KIME_NO_KATA_SOURCE,
  KIME_NO_KATA_QUIZ,
} from './data/kime-no-kata'

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

// ── 6. Chapitres : cérémonies + 20 techniques ancrées sur leur groupe ───────
await sb.from('lesson_chapters').delete().eq('lesson_id', lessonId)
const groupeTitre: Record<string, string> = {
  'idori-mains-nues': 'Idori — mains nues', 'idori-poignard': 'Idori — poignard',
  'tachiai-mains-nues': 'Tachiai — mains nues', 'tachiai-poignard': 'Tachiai — poignard',
  'tachiai-sabre': 'Tachiai — sabre',
}
const chapitres = [
  { lesson_id: lessonId, ordre: 1, titre: KIME_MACRO_CHAPITRES[0].titre, timestamp_seconds: 0, description: 'Salut debout, mise en place des armes, salut à genoux.' },
  ...KIME_NO_KATA_TECHNIQUES.map((t, i) => ({
    lesson_id: lessonId, ordre: i + 2,
    titre: `${groupeTitre[t.groupe]} · ${t.nom}`,
    timestamp_seconds: GROUPE_TIMESTAMP[t.groupe],
    description: t.resume,
  })),
  { lesson_id: lessonId, ordre: KIME_NO_KATA_TECHNIQUES.length + 2, titre: KIME_MACRO_CHAPITRES[6].titre, timestamp_seconds: 673, description: 'Saluts de clôture, remise des armes.' },
]
const { error: eC } = await sb.from('lesson_chapters').insert(chapitres)
if (eC) { console.error('lesson_chapters:', eC.message); process.exit(1) }

// ── 7. Sections pédagogiques : une fiche + sécurité + erreurs par technique ──
await sb.from('asset_sections').delete().eq('asset_id', rid)
const sections = KIME_NO_KATA_TECHNIQUES.flatMap((t) => {
  const fiche = [
    `**${t.nom}** — ${t.titreFr}`,
    `**Objectif.** ${t.objectif}`,
    `**Situation.** ${t.situation}`,
    `**Attaque.** ${t.attaque}`,
    `**Principe de défense.** ${t.defense}`,
    `**Points clés.**\n${t.pointsCles.map((p) => `- ${p}`).join('\n')}`,
    `**En résumé.** ${t.resume}`,
  ].join('\n\n')
  return [
    { asset_id: rid, type: 'fiche', ordre: t.ordre, titre: `${t.ordre}. ${t.nom} — ${t.titreFr}`, contenu: fiche },
    { asset_id: rid, type: 'points_attention', ordre: t.ordre, titre: `${t.nom} — Sécurité`, contenu: t.securite.map((s) => `• ${s}`).join('\n') },
    { asset_id: rid, type: 'erreurs', ordre: t.ordre, titre: `${t.nom} — Erreurs fréquentes`, contenu: t.erreurs.map((e) => `• ${e}`).join('\n') },
  ]
})
const { error: eS } = await sb.from('asset_sections').insert(sections)
if (eS) { console.error('asset_sections:', eS.message); process.exit(1) }

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

console.log(`Seed 3e Dan OK — ${KIME_NO_KATA_TECHNIQUES.length} techniques, ${chapitres.length} chapitres, ${sections.length} sections, ${quiz.length} questions.`)
