import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const envContent = readFileSync('.env.local', 'utf-8')
const env: Record<string, string> = {}
envContent.split('\n').forEach((line) => {
  const idx = line.indexOf('=')
  if (idx > 0) env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
})

const supabase = createClient(env.VITE_SUPABASE_URL!, env.SUPABASE_SERVICE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const TITRE = 'Préparer le 1er Dan'

// Ordre pedagogique des familles : projections debout puis travail au sol.
const FAMILLE_ORDER = [
  'Koshi-waza',
  'Te-waza',
  'Ashi-waza',
  'Sutemi-waza',
  'Osaekomi-waza',
  'Shime-waza',
  'Kansetsu-waza',
]

async function main() {
  // 1. Recuperer les fiches existantes (aucune creation de fiche).
  const { data: fiches, error: fErr } = await supabase
    .from('catalogue_hazumi')
    .select('id, titre, famille, created_at')
    .eq('type', 'article')
    .eq('parcours', 'kyu')
    .eq('grade', '1er dan')
  if (fErr) throw fErr
  if (!fiches || fiches.length === 0) throw new Error('Aucune fiche 1er dan trouvee')

  const ordered = [...fiches].sort((a, b) => {
    const fa = FAMILLE_ORDER.indexOf(a.famille ?? '')
    const fb = FAMILLE_ORDER.indexOf(b.famille ?? '')
    if (fa !== fb) return (fa < 0 ? 99 : fa) - (fb < 0 ? 99 : fb)
    return String(a.created_at).localeCompare(String(b.created_at))
  })

  console.log(`${ordered.length} fiches recuperees (aucun doublon: ${new Set(ordered.map((f) => f.id)).size === ordered.length}).`)

  // 2. Trouver ou creer le parcours (idempotent par titre).
  const { data: existing } = await supabase.from('parcours').select('id').eq('titre', TITRE).maybeSingle()
  let parcoursId = existing?.id as string | undefined

  if (!parcoursId) {
    const { data: created, error: pErr } = await supabase
      .from('parcours')
      .insert({
        titre: TITRE,
        description:
          "Un parcours complet pour aborder le programme technique du 1er Dan : projections (Koshi, Te, Ashi, Sutemi) puis travail au sol (immobilisations, étranglements, clés). Progresse fiche après fiche dans un ordre pédagogique.",
        niveau: '1er dan',
        duree_estimee: '≈ 8 semaines',
        image: null,
        ordre: 1,
        publie: true,
      })
      .select('id')
      .single()
    if (pErr) throw pErr
    parcoursId = created!.id
    console.log(`Parcours cree: ${parcoursId}`)
  } else {
    console.log(`Parcours existant reutilise: ${parcoursId}`)
  }

  // 3. Associer les ressources dans l'ordre pedagogique (sans doublon).
  const links = ordered.map((f, i) => ({
    parcours_id: parcoursId!,
    ressource_id: f.id,
    ordre: i + 1,
    obligatoire: true,
  }))

  const { error: lErr } = await supabase
    .from('parcours_ressources')
    .upsert(links, { onConflict: 'parcours_id,ressource_id', ignoreDuplicates: true })
  if (lErr) throw lErr

  // Mettre a jour l'ordre pour les liens deja presents (upsert ignoreDuplicates ne le fait pas).
  for (const l of links) {
    await supabase
      .from('parcours_ressources')
      .update({ ordre: l.ordre, obligatoire: true })
      .eq('parcours_id', l.parcours_id)
      .eq('ressource_id', l.ressource_id)
  }

  // 4. Verification.
  const { data: check, count } = await supabase
    .from('parcours_ressources')
    .select('ressource_id, ordre', { count: 'exact' })
    .eq('parcours_id', parcoursId!)
    .order('ordre')
  const uniqueCount = new Set((check ?? []).map((c) => c.ressource_id)).size
  console.log(`Liens parcours_ressources: ${count} (uniques: ${uniqueCount}).`)
  console.log('Ordre pedagogique (5 premiers):')
  const byId = new Map(ordered.map((f) => [f.id, f]))
  ;(check ?? []).slice(0, 5).forEach((c) => {
    const f = byId.get(c.ressource_id)
    console.log(`  ${c.ordre}. ${f?.titre} [${f?.famille}]`)
  })

  if (count !== 35 || uniqueCount !== 35) {
    console.error('ATTENTION: nombre de liens inattendu.')
    process.exit(1)
  }
  console.log('\nSEED OK')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
