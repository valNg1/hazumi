/**
 * Ne laisse visibles en Bibliotheque que les ressources retenues par le
 * Product Owner. Aucune suppression : seul `visible_bibliotheque` change.
 *
 * Les ressources masquees restent utilisables dans les parcours et les lecons,
 * et la progression des judokas est preservee.
 *
 * Restaurer une ressource : passer son titre en argument.
 *   npx tsx scripts/bibliotheque-garder-selection.ts --restaurer "Harai-goshi"
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

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

const iRestaurer = process.argv.indexOf('--restaurer')
if (iRestaurer !== -1) {
  const titre = process.argv[iRestaurer + 1]
  if (!titre) {
    console.error('Titre manquant apres --restaurer.')
    process.exit(1)
  }
  const { error } = await sb
    .from('catalogue_hazumi')
    .update({ visible_bibliotheque: true })
    .eq('titre', titre)
  if (error) {
    console.error('Echec :', error.message)
    process.exit(1)
  }
  console.log(`"${titre}" est de nouveau visible en Bibliotheque.`)
  process.exit(0)
}

const { data: cat } = await sb.from('catalogue_hazumi').select('id, titre')
const rows = (cat as { id: string; titre: string }[]) ?? []

const gardees = rows.filter((r) => A_GARDER.includes(r.titre))
const masquees = rows.filter((r) => !A_GARDER.includes(r.titre))

const introuvables = A_GARDER.filter((t) => !rows.some((r) => r.titre === t))
if (introuvables.length) {
  console.error('Ressources a garder introuvables :', introuvables.join(', '))
  process.exit(1)
}

const { error } = await sb
  .from('catalogue_hazumi')
  .update({ visible_bibliotheque: false })
  .in('id', masquees.map((r) => r.id))
if (error) {
  console.error('Echec du masquage :', error.message)
  process.exit(1)
}

const { error: err2 } = await sb
  .from('catalogue_hazumi')
  .update({ visible_bibliotheque: true })
  .in('id', gardees.map((r) => r.id))
if (err2) {
  console.error('Echec de la mise en visibilite :', err2.message)
  process.exit(1)
}

console.log(`Visibles en Bibliotheque (${gardees.length}) : ${gardees.map((r) => r.titre).join(' · ')}`)
console.log(`Masquees (${masquees.length}) — conservees en base, toujours utilisables dans les parcours.`)
