import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const e = readFileSync('.env.local', 'utf-8')
const env: Record<string, string> = {}
e.split('\n').forEach((l) => { const i = l.indexOf('='); if (i > 0) env[l.slice(0, i).trim()] = l.slice(i + 1).trim() })
const sb = createClient(env.VITE_SUPABASE_URL!, env.SUPABASE_SERVICE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } })

async function ensureParcours(titre: string, univers: 'shiai' | 'kyu' | 'judo-ka', description: string): Promise<string> {
  const { data: ex } = await sb.from('parcours').select('id').eq('titre', titre).maybeSingle()
  let id = ex?.id as string | undefined
  if (!id) {
    const { data, error } = await sb.from('parcours').insert({ titre, description, ordre: 50, publie: true }).select('id').single()
    if (error) throw error
    id = data!.id
  } else {
    await sb.from('parcours').update({ publie: true }).eq('id', id)
  }
  await sb.from('parcours_univers').upsert({ parcours_id: id, univers }, { onConflict: 'parcours_id,univers', ignoreDuplicates: true })
  return id
}

async function link(parcoursId: string, ressourceIds: string[]) {
  if (ressourceIds.length === 0) return
  const rows = ressourceIds.map((rid, i) => ({ parcours_id: parcoursId, ressource_id: rid, ordre: i + 1, obligatoire: true }))
  await sb.from('parcours_ressources').upsert(rows, { onConflict: 'parcours_id,ressource_id', ignoreDuplicates: true })
}

async function main() {
  // Recalcule les orphelins (ressources hors de tout parcours publie).
  const { data: cat } = await sb.from('catalogue_hazumi').select('id, titre, parcours')
  const { data: pub } = await sb.from('parcours').select('id').eq('publie', true)
  const pubIds = new Set((pub ?? []).map((p: any) => p.id))
  const { data: links } = await sb.from('parcours_ressources').select('parcours_id, ressource_id')
  const inPublished = new Set((links ?? []).filter((l: any) => pubIds.has(l.parcours_id)).map((l: any) => l.ressource_id))
  const orphans = (cat ?? []).filter((c: any) => !inPublished.has(c.id))

  const kyuOrphans = orphans.filter((o: any) => o.parcours === 'kyu').map((o: any) => o.id)
  const judokaOrphans = orphans.filter((o: any) => o.parcours === 'judo-ka').map((o: any) => o.id)

  // JUDO-KA : publier "Culture judo" (deja lie aux PDF) et garantir le lien.
  const culture = await ensureParcours('Culture judo — les essentiels', 'judo-ka', 'Les documents fondamentaux de la culture judo.')
  await link(culture, judokaOrphans)

  // KYU : parcours de rattachement pour ceintures + videos.
  const kyuRes = await ensureParcours('Ressources complémentaires Kyu', 'kyu', 'Documents par ceinture et vidéos techniques de référence.')
  await link(kyuRes, kyuOrphans)

  // Verification finale.
  const { data: pub2 } = await sb.from('parcours').select('id').eq('publie', true)
  const pub2Ids = new Set((pub2 ?? []).map((p: any) => p.id))
  const { data: links2 } = await sb.from('parcours_ressources').select('parcours_id, ressource_id')
  const inPub2 = new Set((links2 ?? []).filter((l: any) => pub2Ids.has(l.parcours_id)).map((l: any) => l.ressource_id))
  const remaining = (cat ?? []).filter((c: any) => !inPub2.has(c.id) && (c.parcours === 'kyu' || c.parcours === 'judo-ka'))
  console.log(`JUDO-KA orphelins rattachés: ${judokaOrphans.length} -> Culture judo (${culture})`)
  console.log(`KYU orphelins rattachés: ${kyuOrphans.length} -> Ressources complémentaires Kyu (${kyuRes})`)
  console.log(`Orphelins KYU/JUDO-KA restants: ${remaining.length}`)
  if (remaining.length > 0) { console.log(JSON.stringify(remaining.map((r: any) => r.titre))); process.exit(1) }
  console.log('ORPHELINS OK (0 restant)')
}
main().catch((e) => { console.error(e); process.exit(1) })
