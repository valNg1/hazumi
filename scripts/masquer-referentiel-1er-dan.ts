/**
 * Retire de la Bibliotheque les 35 ressources issues de l'import du referentiel
 * technique 1er Dan (lot du 2026-07-10), jugees non exploitables en l'etat.
 *
 * Aucune suppression : seul le drapeau `visible_bibliotheque` passe a false.
 * Les ressources restent utilisables dans les parcours et les lecons, et le
 * geste est reversible (`--restaurer`).
 *
 * Les ressources portant une lecon publiee sont conservees visibles : une lecon
 * complete rend la ressource exploitable.
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const LOT = '2026-07-10'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter((l) => l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
)

const sb = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_KEY)
const restaurer = process.argv.includes('--restaurer')

const { data: cat } = await sb
  .from('catalogue_hazumi')
  .select('id, titre, created_at')
  .order('created_at')

const { data: lecons } = await sb.from('lesson').select('ressource_id').eq('published', true)
const avecLecon = new Set((lecons ?? []).map((l: { ressource_id: string }) => l.ressource_id))

const lot = ((cat as { id: string; titre: string; created_at: string }[]) ?? []).filter(
  (r) => (r.created_at ?? '').slice(0, 10) === LOT
)

console.log(`Lot du ${LOT} : ${lot.length} ressources.`)

const cibles = lot.filter((r) => !avecLecon.has(r.id))
const conservees = lot.filter((r) => avecLecon.has(r.id))

if (conservees.length) {
  console.log(`Conservees visibles (lecon publiee) : ${conservees.map((r) => r.titre).join(', ')}`)
}

const { error } = await sb
  .from('catalogue_hazumi')
  .update({ visible_bibliotheque: restaurer })
  .in('id', cibles.map((r) => r.id))

if (error) {
  console.error('Echec :', error.message)
  process.exit(1)
}

console.log(
  restaurer
    ? `${cibles.length} ressources reaffichees dans la Bibliotheque.`
    : `${cibles.length} ressources masquees de la Bibliotheque (aucune suppression).`
)

const { count } = await sb
  .from('catalogue_hazumi')
  .select('*', { count: 'exact', head: true })
  .eq('visible_bibliotheque', true)
console.log(`Ressources visibles en Bibliotheque : ${count}`)
