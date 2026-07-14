import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const envContent = readFileSync('.env.local', 'utf-8')
const env: Record<string, string> = {}
envContent.split('\n').forEach((l) => { const i = l.indexOf('='); if (i > 0) env[l.slice(0, i).trim()] = l.slice(i + 1).trim() })
const sb = createClient(env.VITE_SUPABASE_URL!, env.SUPABASE_SERVICE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } })

type Univers = 'shiai' | 'kyu' | 'judo-ka'

let ordreCounter = 10

async function ensureParcours(titre: string, opts: { description?: string; niveau?: string; publie?: boolean }): Promise<string> {
  const { data: existing } = await sb.from('parcours').select('id').eq('titre', titre).maybeSingle()
  if (existing) return existing.id
  const { data, error } = await sb.from('parcours').insert({
    titre,
    description: opts.description ?? null,
    niveau: opts.niveau ?? null,
    ordre: ordreCounter++,
    publie: opts.publie ?? false,
  }).select('id').single()
  if (error) throw error
  return data!.id
}

async function setUnivers(parcoursId: string, univers: Univers) {
  await sb.from('parcours_univers').upsert({ parcours_id: parcoursId, univers }, { onConflict: 'parcours_id,univers', ignoreDuplicates: true })
}

async function linkResources(parcoursId: string, ressourceIds: string[]) {
  if (ressourceIds.length === 0) return
  const rows = ressourceIds.map((rid, i) => ({ parcours_id: parcoursId, ressource_id: rid, ordre: i + 1, obligatoire: true }))
  await sb.from('parcours_ressources').upsert(rows, { onConflict: 'parcours_id,ressource_id', ignoreDuplicates: true })
}

async function main() {
  const created: string[] = []

  // 0. Backfill : le parcours existant appartient a l'univers KYU.
  const { data: premierDan } = await sb.from('parcours').select('id').eq('titre', 'Préparer le 1er Dan').maybeSingle()
  if (premierDan) { await setUnivers(premierDan.id, 'kyu'); created.push('(backfill) Préparer le 1er Dan → kyu') }

  // 1. KYU — parcours thematiques par famille, REUTILISANT les fiches existantes
  //    (demontre la reutilisation N-N : une meme fiche dans plusieurs parcours).
  const familles: { famille: string; titre: string; description: string }[] = [
    { famille: 'Koshi-waza', titre: 'Les Koshi-waza — projections de hanche', description: 'Les techniques de hanche du programme.' },
    { famille: 'Te-waza', titre: 'Les Te-waza — projections d’épaule et de bras', description: 'Les techniques de bras et d’épaule.' },
    { famille: 'Ashi-waza', titre: 'Les Ashi-waza — techniques de jambe', description: 'Les balayages et fauchages de jambe.' },
    { famille: 'Sutemi-waza', titre: 'Les Sutemi-waza — techniques de sacrifice', description: 'Les projections en sacrifice.' },
    { famille: 'Osaekomi-waza', titre: 'Ne-waza — les immobilisations', description: 'Le contrôle au sol : osae-komi.' },
    { famille: 'Shime-waza', titre: 'Ne-waza — les étranglements', description: 'Les étranglements : shime-waza.' },
    { famille: 'Kansetsu-waza', titre: 'Ne-waza — les clés de bras', description: 'Les clés articulaires : kansetsu-waza.' },
  ]
  for (const f of familles) {
    const { data: fiches } = await sb.from('catalogue_hazumi')
      .select('id, created_at').eq('parcours', 'kyu').eq('famille', f.famille).order('created_at', { ascending: true })
    const ids = (fiches ?? []).map((x: any) => x.id)
    const pid = await ensureParcours(f.titre, { description: f.description, niveau: '1er dan', publie: false })
    await setUnivers(pid, 'kyu')
    await linkResources(pid, ids)
    created.push(`KYU thème: ${f.titre} (${ids.length} leçons réutilisées)`)
  }

  // 2. KYU — squelettes ceintures (vides, a completer).
  for (const belt of ['Ceinture jaune', 'Ceinture orange', 'Ceinture verte', 'Ceinture bleue', 'Ceinture marron', 'Préparer le 2e Dan']) {
    const pid = await ensureParcours(belt, { description: 'Parcours de progression (à compléter).', niveau: belt.toLowerCase(), publie: false })
    await setUnivers(pid, 'kyu')
    created.push(`KYU ceinture (vide): ${belt}`)
  }

  // 3. JUDO-KA — parcours culture rempli avec les PDF existants + themes vides.
  const { data: judokaRes } = await sb.from('catalogue_hazumi').select('id, created_at').eq('parcours', 'judo-ka').order('created_at', { ascending: true })
  const judokaIds = (judokaRes ?? []).map((x: any) => x.id)
  const cultureId = await ensureParcours('Culture judo — les essentiels', { description: 'Les documents fondamentaux de la culture judo.', publie: false })
  await setUnivers(cultureId, 'judo-ka')
  await linkResources(cultureId, judokaIds)
  created.push(`JUDO-KÂ: Culture judo — les essentiels (${judokaIds.length} ressources)`)
  for (const t of ['Histoire du judo', 'Le Kodokan', 'Jigoro Kano', 'L’étiquette', 'Philosophie et principes du judo']) {
    const pid = await ensureParcours(t, { description: 'Parcours culturel (à compléter).', publie: false })
    await setUnivers(pid, 'judo-ka')
    created.push(`JUDO-KÂ thème (vide): ${t}`)
  }

  // 4. SHIAI — squelettes vus competition (vides, aucun contenu shiai en base).
  for (const t of ['Techniques offensives', 'Les contres', 'Kumikata — les saisies', 'Tactique de combat', 'Préparation mentale']) {
    const pid = await ensureParcours(t, { description: 'Parcours compétition (à compléter).', publie: false })
    await setUnivers(pid, 'shiai')
    created.push(`SHIAI (vide): ${t}`)
  }

  console.log(created.map((c) => '  • ' + c).join('\n'))

  // Verification
  const { count: pCount } = await sb.from('parcours').select('id', { count: 'exact', head: true })
  const { data: pu } = await sb.from('parcours_univers').select('univers')
  const byU: Record<string, number> = {}
  for (const r of pu ?? []) byU[r.univers] = (byU[r.univers] || 0) + 1
  console.log(`\nTotal parcours: ${pCount} | par univers: ${JSON.stringify(byU)}`)
  console.log('SEED SQUELETTES OK')
}

main().catch((e) => { console.error(e); process.exit(1) })
