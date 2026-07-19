/**
 * Supprime definitivement du catalogue Hazumi toutes les ressources sauf celles
 * retenues par le Product Owner.
 *
 * Garde-fou : le script refuse de s'executer si le parcours contenant
 * Nage-no-kata perdrait une ressource (condition posee par le Product Owner).
 *
 * Une sauvegarde JSON complete est ecrite avant toute suppression.
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync } from 'fs'

const A_GARDER = [
  'Uchi Mata - Kodokan (Aaron Wolf)',
  'O Ouchi Gari - Kodokan (Aaron Wolf)',
  'Nage-no-kata',
]

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter((l) => l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
)
const sb = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_KEY)

const { data: cat } = await sb.from('catalogue_hazumi').select('*')
const { data: liens } = await sb.from('parcours_ressources').select('*')
const { data: parc } = await sb.from('parcours').select('id, titre')
const { data: lecons } = await sb.from('lesson').select('*')

const rows = (cat as Record<string, unknown>[]) ?? []
const aSupprimer = rows.filter((r) => !A_GARDER.includes(r.titre as string))
const gardees = rows.filter((r) => A_GARDER.includes(r.titre as string))

const introuvables = A_GARDER.filter((t) => !rows.some((r) => r.titre === t))
if (introuvables.length) {
  console.error('Ressources a garder introuvables :', introuvables.join(', '))
  process.exit(1)
}

// ── Garde-fou : le parcours Nage-no-kata ne doit rien perdre ────────────────
const idNage = rows.find((r) => r.titre === 'Nage-no-kata')!.id as string
const nomParcours = new Map(((parc as { id: string; titre: string }[]) ?? []).map((p) => [p.id, p.titre]))
const tousLiens = (liens as { ressource_id: string; parcours_id: string }[]) ?? []
const parcoursNage = tousLiens.filter((l) => l.ressource_id === idNage).map((l) => l.parcours_id)
const idsSupprimes = new Set(aSupprimer.map((r) => r.id as string))

for (const pid of parcoursNage) {
  const perdues = tousLiens.filter((l) => l.parcours_id === pid && idsSupprimes.has(l.ressource_id))
  if (perdues.length > 0) {
    console.error(
      `ARRET : le parcours "${nomParcours.get(pid)}" perdrait ${perdues.length} ressource(s). ` +
        'La condition posee par le Product Owner n\'est pas respectee.'
    )
    process.exit(1)
  }
}
console.log(`Garde-fou OK : le parcours "${parcoursNage.map((p) => nomParcours.get(p)).join(', ')}" ne perd aucune ressource.`)

// ── Sauvegarde avant suppression ────────────────────────────────────────────
const horodatage = new Date().toISOString().replace(/[:.]/g, '-')
const fichier = `backup-catalogue-${horodatage}.json`
writeFileSync(
  fichier,
  JSON.stringify({ catalogue: aSupprimer, parcours_ressources: tousLiens, lesson: lecons }, null, 2),
  'utf8'
)
console.log(`Sauvegarde ecrite : ${fichier} (${aSupprimer.length} ressources)`)

// ── Suppression des dependances puis des ressources ─────────────────────────
const ids = Array.from(idsSupprimes)
const lesconsSupprimees = ((lecons as { id: string; ressource_id: string }[]) ?? []).filter((l) =>
  idsSupprimes.has(l.ressource_id)
)

if (lesconsSupprimees.length) {
  const lids = lesconsSupprimees.map((l) => l.id)
  for (const table of ['lesson_chapters', 'lesson_quiz', 'lesson_notes', 'lesson_progress', 'lesson_quiz_results']) {
    const { error } = await sb.from(table).delete().in('lesson_id', lids)
    if (error) console.warn(`  ${table} : ${error.message}`)
  }
  const { error } = await sb.from('lesson').delete().in('id', lids)
  if (error) { console.error('Echec suppression lesson :', error.message); process.exit(1) }
  console.log(`Lecons supprimees : ${lesconsSupprimees.length}`)
}

const { error: errLiens } = await sb.from('parcours_ressources').delete().in('ressource_id', ids)
if (errLiens) { console.error('Echec suppression des liens :', errLiens.message); process.exit(1) }

const { error: errCat } = await sb.from('catalogue_hazumi').delete().in('id', ids)
if (errCat) { console.error('Echec suppression du catalogue :', errCat.message); process.exit(1) }

// ── Etat final ──────────────────────────────────────────────────────────────
const { count } = await sb.from('catalogue_hazumi').select('*', { count: 'exact', head: true })
console.log(`\nSupprimees : ${aSupprimer.length}`)
console.log(`Restantes : ${count} — ${gardees.map((r) => r.titre).join(' · ')}`)

const { data: restants } = await sb.from('parcours_ressources').select('parcours_id')
const compte = new Map<string, number>()
;((restants as { parcours_id: string }[]) ?? []).forEach((l) =>
  compte.set(l.parcours_id, (compte.get(l.parcours_id) ?? 0) + 1)
)
console.log('\nParcours apres suppression :')
nomParcours.forEach((titre, id) => console.log(`  ${compte.get(id) ?? 0} ressource(s) — ${titre}`))
