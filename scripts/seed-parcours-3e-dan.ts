/**
 * Seed MVP du parcours 3e Dan — UV1 Kime-no-kata.
 *
 * Réutilise strictement l'architecture du parcours 1er Dan (Nage-no-kata) :
 *   parcours -> parcours_univers -> catalogue_hazumi -> media_sources
 *   -> asset_media (rôle « complet ») -> lesson -> lesson_chapters
 *
 * Aucune nouvelle architecture, aucun contenu éditorial, aucun quiz.
 * Les chapitres sont des CANDIDATS marqués à valider (voir data/chapitres-kime-no-kata.ts).
 *
 * Idempotent : ré-exécutable sans doublon.
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { KIME_NO_KATA_CHAPITRES, KIME_NO_KATA_SOURCE } from './data/chapitres-kime-no-kata'

const UNIVERS = 'kyu' // même univers que « Préparer le 1er Dan »
const NIVEAU = '3e dan'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter((l) => l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
)
const sb = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_KEY)

// ── 1. Le parcours 3e Dan ───────────────────────────────────────────────────
const TITRE_PARCOURS = 'Préparer le 3e Dan'
const { data: pExist } = await sb.from('parcours').select('id').eq('titre', TITRE_PARCOURS).maybeSingle()
let parcoursId = (pExist as { id: string } | null)?.id
if (!parcoursId) {
  const { data, error } = await sb.from('parcours').insert({
    titre: TITRE_PARCOURS,
    description: 'Parcours 3e Dan. UV1 : Kime-no-kata, le kata de la décision — 20 techniques de défense, 8 à genoux (Idori) et 12 debout (Tachi-ai).',
    niveau: NIVEAU,
    duree_estimee: '≈ 8 semaines',
    ordre: 3,
    publie: true,
  }).select('id').single()
  if (error) { console.error('parcours:', error.message); process.exit(1) }
  parcoursId = (data as { id: string }).id
}
await sb.from('parcours_univers').upsert(
  { parcours_id: parcoursId, univers: UNIVERS },
  { onConflict: 'parcours_id,univers', ignoreDuplicates: true }
)
console.log('Parcours 3e Dan :', parcoursId)

// ── 2. La source vidéo Kodokan ──────────────────────────────────────────────
const { data: sExist } = await sb.from('media_sources').select('id').eq('url', KIME_NO_KATA_SOURCE.url).maybeSingle()
let sourceId = (sExist as { id: string } | null)?.id
if (!sourceId) {
  const { data, error } = await sb.from('media_sources').insert({
    url: KIME_NO_KATA_SOURCE.url,
    titre: KIME_NO_KATA_SOURCE.titre,
    fournisseur: KIME_NO_KATA_SOURCE.fournisseur,
    duree_seconds: KIME_NO_KATA_SOURCE.dureeSeconds,
  }).select('id').single()
  if (error) { console.error('media_sources:', error.message); process.exit(1) }
  sourceId = (data as { id: string }).id
}
console.log('Source vidéo :', sourceId)

// ── 3. La ressource UV1 Kime-no-kata ────────────────────────────────────────
const TITRE_UV1 = 'Kime-no-kata'
const { data: rExist } = await sb.from('catalogue_hazumi').select('id').eq('titre', TITRE_UV1).maybeSingle()
const champs = {
  titre: TITRE_UV1,
  type: 'video',
  parcours: UNIVERS,
  famille: 'Kata',
  grade: NIVEAU,
  visible_bibliotheque: true,
  ordre: 1,
}
let ressourceId = (rExist as { id: string } | null)?.id
if (ressourceId) {
  await sb.from('catalogue_hazumi').update(champs).eq('id', ressourceId)
} else {
  const { data, error } = await sb.from('catalogue_hazumi').insert(champs).select('id').single()
  if (error) { console.error('catalogue_hazumi:', error.message); process.exit(1) }
  ressourceId = (data as { id: string }).id
}
console.log('Ressource UV1 :', ressourceId)

// ── 4. Le média « complet » (vidéo intégrale, non segmentée) ────────────────
const { error: eMedia } = await sb.from('asset_media').upsert({
  asset_id: ressourceId, source_id: sourceId, role: 'complet',
  segment_start_s: null, segment_end_s: null, est_principal: true, ordre: 0,
  titre: 'Démonstration complète',
}, { onConflict: 'asset_id,role' })
if (eMedia) { console.error('asset_media:', eMedia.message); process.exit(1) }

// ── 5. La leçon publiée ─────────────────────────────────────────────────────
const { data: lExist } = await sb.from('lesson').select('id').eq('ressource_id', ressourceId).maybeSingle()
let lessonId = (lExist as { id: string } | null)?.id
if (!lessonId) {
  const { data, error } = await sb.from('lesson').insert({
    ressource_id: ressourceId,
    published: true,
    youtube_url: KIME_NO_KATA_SOURCE.url,
    objectif: 'Découvrir le Kime-no-kata : 8 techniques à genoux (Idori) et 12 debout (Tachi-ai).',
  }).select('id').single()
  if (error) { console.error('lesson:', error.message); process.exit(1) }
  lessonId = (data as { id: string }).id
} else {
  await sb.from('lesson').update({ youtube_url: KIME_NO_KATA_SOURCE.url, published: true }).eq('id', lessonId)
}
console.log('Leçon :', lessonId)

// ── 6. Les chapitres candidats ──────────────────────────────────────────────
// Les bornes non validées sont explicitement signalées dans la description,
// visible côté judoka comme côté PO.
await sb.from('lesson_chapters').delete().eq('lesson_id', lessonId)
const chapitres = KIME_NO_KATA_CHAPITRES.map((c) => ({
  lesson_id: lessonId,
  ordre: c.ordre,
  titre: c.titre,
  timestamp_seconds: c.timestamp,
  description: c.valide ? c.note : `⚠ Borne à valider — ${c.note}`,
}))
const { error: eCh } = await sb.from('lesson_chapters').insert(chapitres)
if (eCh) { console.error('lesson_chapters:', eCh.message); process.exit(1) }
console.log(`Chapitres : ${chapitres.length} (${KIME_NO_KATA_CHAPITRES.filter((c) => !c.valide).length} à valider)`)

// ── 7. Rattachement au parcours ─────────────────────────────────────────────
await sb.from('parcours_ressources').upsert(
  { parcours_id: parcoursId, ressource_id: ressourceId, ordre: 1, obligatoire: true },
  { onConflict: 'parcours_id,ressource_id', ignoreDuplicates: true }
)

console.log('\nSeed 3e Dan terminé — UV1 Kime-no-kata accessible.')
