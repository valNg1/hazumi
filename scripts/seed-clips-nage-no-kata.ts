/**
 * Seed des neuf clips du Nage-no-kata.
 *
 * PRÉ-REQUIS : renseigner les bornes dans
 *   scripts/data/horodatages-nage-no-kata.ts
 * Tant qu'une seule borne manque ou est incohérente, le script s'arrête sans
 * rien écrire — aucune donnée de production approximative n'est créée.
 *
 * Idempotent : ré-exécutable sans doublon (upsert par titre / clé naturelle).
 *
 * Ce qu'il crée, une fois les bornes valides :
 *   1. media_sources        : la vidéo maîtresse Kodokan (une ligne)
 *   2. catalogue_hazumi     : 9 ressources-clips (titre, famille, grade, ordre,
 *                             aliases, vignette = carte typographique)
 *   3. asset_media          : 1 média « démonstration » principal par clip,
 *                             segmenté sur ses bornes
 *   4. asset_sections       : fiche / points d'attention / erreurs par clip
 *   5. lesson               : une leçon publiée minimale par clip
 *   6. parcours_ressources  : rattachement au parcours « Préparer le 1er Dan »
 *
 * La ressource « Nage-no-kata » (vidéo complète) est conservée telle quelle et
 * reçoit un média « complet » non segmenté, comme démonstration de référence.
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { buildSeedPlan } from '../src/lib/nageNoKataSeed'
import { NAGE_NO_KATA_SOURCE } from '../src/lib/nageNoKata'
import { HORODATAGES } from './data/horodatages-nage-no-kata'

const PARCOURS_1ER_DAN = '42f98544-a7ba-44bd-a08f-fefda12ef216'
const NAGE_RESSOURCE_ID = '04375145-35c7-4569-9409-6df8358caa13'
const UNIVERS = 'kyu' // cohérent avec la ressource Nage-no-kata existante

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter((l) => l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
)
const sb = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_KEY)

// ── Garde-fou : bornes valides avant toute écriture ─────────────────────────
const plan = buildSeedPlan(HORODATAGES, NAGE_NO_KATA_SOURCE.dureeSeconds)
if (!plan.ok) {
  console.error('ARRÊT — les horodatages ne sont pas valides. Aucune donnée créée.\n')
  plan.erreurs.forEach((e) => console.error('  • ' + e))
  console.error('\nRenseigne scripts/data/horodatages-nage-no-kata.ts puis relance.')
  process.exit(1)
}
console.log(`Bornes valides pour les ${plan.techniques.length} techniques.\n`)

// ── 1. Source vidéo (idempotent par URL) ────────────────────────────────────
const { data: srcExist } = await sb.from('media_sources').select('id').eq('url', NAGE_NO_KATA_SOURCE.url).maybeSingle()
let sourceId = (srcExist as { id: string } | null)?.id
if (!sourceId) {
  const { data, error } = await sb.from('media_sources').insert({
    url: NAGE_NO_KATA_SOURCE.url,
    titre: NAGE_NO_KATA_SOURCE.titre,
    fournisseur: NAGE_NO_KATA_SOURCE.fournisseur,
    duree_seconds: NAGE_NO_KATA_SOURCE.dureeSeconds,
  }).select('id').single()
  if (error) { console.error('media_sources:', error.message); process.exit(1) }
  sourceId = (data as { id: string }).id
}
console.log('media_sources OK:', sourceId)

// ── La vidéo complète = média « complet » de la ressource Nage-no-kata ──────
await sb.from('asset_media').upsert({
  asset_id: NAGE_RESSOURCE_ID, source_id: sourceId, role: 'complet',
  segment_start_s: null, segment_end_s: null, est_principal: false, ordre: 99,
  titre: 'Démonstration complète',
}, { onConflict: 'asset_id,role' })

// ── 2 à 6 : chaque clip ─────────────────────────────────────────────────────
for (const t of plan.techniques) {
  // Ressource-clip (idempotent par titre)
  const { data: exist } = await sb.from('catalogue_hazumi').select('id').eq('titre', t.nom).maybeSingle()
  let assetId = (exist as { id: string } | null)?.id
  const champs = {
    titre: t.nom, type: 'video', parcours: UNIVERS, famille: t.famille, grade: t.grade,
    ordre: t.ordre, aliases: t.aliases, thumbnail_url: t.thumbnail,
    visible_bibliotheque: true, contenu: null as string | null,
  }
  if (assetId) {
    await sb.from('catalogue_hazumi').update(champs).eq('id', assetId)
  } else {
    const { data, error } = await sb.from('catalogue_hazumi').insert(champs).select('id').single()
    if (error) { console.error(`${t.nom}:`, error.message); process.exit(1) }
    assetId = (data as { id: string }).id
  }

  // Média démonstration principal (idempotent par asset_id + role)
  await sb.from('asset_media').upsert({
    asset_id: assetId, source_id: sourceId, role: t.role,
    segment_start_s: t.start, segment_end_s: t.end, est_principal: t.estPrincipal,
    ordre: 0, titre: null,
  }, { onConflict: 'asset_id,role' })

  // Sections (idempotent par asset_id + type + ordre)
  for (const s of t.sections) {
    await sb.from('asset_sections').upsert({
      asset_id: assetId, type: s.type, ordre: s.ordre, titre: s.titre, contenu: s.contenu,
    }, { onConflict: 'asset_id,type,ordre' })
  }

  // Leçon minimale publiée (idempotent par ressource_id)
  const { data: lesExist } = await sb.from('lesson').select('id').eq('ressource_id', assetId).maybeSingle()
  if (!lesExist) {
    await sb.from('lesson').insert({
      ressource_id: assetId, published: true,
      objectif: `${t.nom} — ${t.famille}, ${t.ordre}/${t.total} de la série.`,
    })
  }

  // Rattachement au parcours 1er Dan (idempotent)
  await sb.from('parcours_ressources').upsert(
    { parcours_id: PARCOURS_1ER_DAN, ressource_id: assetId, ordre: t.ordre, obligatoire: true },
    { onConflict: 'parcours_id,ressource_id', ignoreDuplicates: true }
  )

  console.log(`  ✓ ${t.nom} (${t.start}s → ${t.end}s)`)
}

console.log('\nSeed terminé. Les neuf clips sont en production.')
