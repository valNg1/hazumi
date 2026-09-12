/**
 * Migration — Kime-no-kata : 4e Dan → 5e Dan (réglementation kata 2026-2027).
 *
 * CHANGEMENT DE RATTACHEMENT, PAS de recréation. Non destructif :
 *  - ne touche NI aux chapitres, NI au quiz, NI aux médias, NI au contenu premium ;
 *  - réutilise le parcours existant (même id) → routes + progressions `user_parcours`
 *    (clé = parcours_id) préservées ;
 *  - conserve le ressource_id Kime et tout ce qui en dépend (leçon, approfondissements).
 *
 * Effets :
 *  1. Renomme le parcours Kime « Préparer le 4e Dan » → « Préparer le 5e Dan »
 *     (niveau '5e dan'), idempotent (reconnaît aussi l'ancien « 3e Dan »).
 *  2. Passe le grade + les tags de la ressource Kime au 5e dan.
 *  3. Garantit le rattachement parcours ↔ ressource (upsert).
 *  4. Vérifie qu'aucun parcours 4e Dan ne porte encore Kime.
 *
 * Idempotent — rejouable sans effet de bord.
 *   npx tsx scripts/move-kime-to-5e-dan.ts
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { KIME_NO_KATA_RESSOURCE_ID, KIME_NO_KATA_META } from '../src/lib/kimeNoKata'

const NEW_TITRE = 'Préparer le 5e Dan'
const NEW_NIVEAU = '5e dan'
const NEW_DESC =
  'Parcours 5e Dan. Kime-no-kata, le kata de la décision — 20 techniques de défense, 8 à genoux (Idori) et 12 debout (Tachiai).'
const OLD_TITRES = ['Préparer le 4e Dan', 'Préparer le 3e Dan']

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n').filter((l) => l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
)
const sb = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_KEY)
const rid = KIME_NO_KATA_RESSOURCE_ID

// ── 1. Ressource Kime : grade + tags au 5e dan (contenu inchangé) ────────────
{
  const { error } = await sb.from('catalogue_hazumi')
    .update({ grade: NEW_NIVEAU, tags: KIME_NO_KATA_META.tags })
    .eq('id', rid)
  if (error) { console.error('catalogue_hazumi:', error.message); process.exit(1) }
}

// ── 2. Parcours Kime : renommer en « Préparer le 5e Dan » (même id) ──────────
// On identifie le parcours par le lien existant (le plus fiable), sinon par titre.
const { data: liens } = await sb.from('parcours_ressources').select('parcours_id').eq('ressource_id', rid)
const idsLies = ((liens as { parcours_id: string }[]) ?? []).map((l) => l.parcours_id)

let parcoursId: string | undefined
if (idsLies.length) {
  const { data } = await sb.from('parcours').select('id, titre').in('id', idsLies)
    .in('titre', [NEW_TITRE, ...OLD_TITRES])
  parcoursId = (data as { id: string }[] | null)?.[0]?.id
}
if (!parcoursId) {
  const { data } = await sb.from('parcours').select('id').in('titre', [NEW_TITRE, ...OLD_TITRES]).maybeSingle()
  parcoursId = (data as { id: string } | null)?.id
}
if (!parcoursId) { console.error('Parcours Kime introuvable (ni 5e, ni 4e/3e Dan).'); process.exit(1) }

{
  const { error } = await sb.from('parcours')
    .update({ titre: NEW_TITRE, niveau: NEW_NIVEAU, description: NEW_DESC })
    .eq('id', parcoursId)
  if (error) { console.error('parcours:', error.message); process.exit(1) }
}

// ── 3. Rattachement parcours ↔ ressource (idempotent) ────────────────────────
await sb.from('parcours_ressources').upsert(
  { parcours_id: parcoursId, ressource_id: rid, ordre: 1, obligatoire: true },
  { onConflict: 'parcours_id,ressource_id', ignoreDuplicates: true }
)

// ── 4. Vérifications ─────────────────────────────────────────────────────────
const { data: apres } = await sb.from('parcours_ressources')
  .select('parcours_id, parcours(titre, niveau)').eq('ressource_id', rid)
const rows = (apres as { parcours_id: string; parcours: { titre: string; niveau: string | null } | null }[]) ?? []
const en4e = rows.filter((r) => /4e/i.test(r.parcours?.titre ?? '') || /4e/i.test(r.parcours?.niveau ?? ''))
const en5e = rows.filter((r) => r.parcours_id === parcoursId)

console.log('Kime-no-kata rattachements après migration :')
rows.forEach((r) => console.log(`  - ${r.parcours?.titre} (niveau=${r.parcours?.niveau})`))
if (en4e.length) { console.error('ÉCHEC : Kime encore rattaché à un parcours 4e Dan.'); process.exit(1) }
if (!en5e.length) { console.error('ÉCHEC : Kime non rattaché au 5e Dan.'); process.exit(1) }
console.log(`OK — Kime-no-kata rattaché au « ${NEW_TITRE} » (parcours ${parcoursId}), 4e Dan libéré. Contenu, chapitres et progressions intacts.`)
