import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const envContent = readFileSync('.env.local', 'utf-8')
const env: Record<string, string> = {}
envContent.split('\n').forEach((line) => {
  const idx = line.indexOf('=')
  if (idx > 0) env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
})

const URL = env.VITE_SUPABASE_URL!
const ANON = env.VITE_SUPABASE_ANON_KEY!
const SERVICE = env.SUPABASE_SERVICE_KEY!

const admin = createClient(URL, SERVICE, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const PASSWORD = 'VerifPassword123!'
const stamp = Date.now()
const email = `verif-kyu-${stamp}@test.fr`
let userId = ''

async function main() {
  // Cree un judoka reel (comme le fait l'app pour un utilisateur connecte)
  const { data: u, error: uErr } = await admin.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
  })
  if (uErr || !u.user) throw uErr ?? new Error('createUser failed')
  userId = u.user.id
  const { error: jErr } = await admin.from('judokas').insert({
    user_id: userId,
    full_name: `Verif Kyu ${stamp}`,
    email,
    birth_date: '1990-01-01',
    role: 'judoka',
  })
  if (jErr) throw jErr

  // Se connecte comme ce judoka (passe par ANON + RLS, exactement comme PersonalLibrary)
  const client: SupabaseClient = createClient(URL, ANON)
  const { error: signErr } = await client.auth.signInWithPassword({ email, password: PASSWORD })
  if (signErr) throw signErr

  // Requete identique a PersonalLibrary parcours="kyu"
  const { data, error } = await client
    .from('catalogue_hazumi')
    .select('*')
    .eq('parcours', 'kyu')
    .order('created_at', { ascending: false })

  if (error) throw error
  const items = data ?? []
  const imported = items.filter((i) => i.grade === '1er dan')

  console.log(`Judoka connecte lit ${items.length} fiches parcours=kyu (dont ${imported.length} du referentiel 1er dan).`)

  const harai = items.find((i) => i.titre === 'Harai-goshi')
  const checks: [string, boolean][] = [
    ['35 fiches 1er dan visibles cote judoka', imported.length === 35],
    ['Harai-goshi lisible', Boolean(harai)],
    ['tags renvoye comme tableau', Array.isArray(harai?.tags)],
    ['tags non vides', (harai?.tags?.length ?? 0) > 0],
    ['accents preserves dans les tags', (harai?.tags ?? []).includes('déséquilibre avant')],
    ['accents/apostrophes preserves dans le contenu', Boolean(harai?.contenu?.includes('prolongée d’un'))],
    ['famille remontee', harai?.famille === 'Koshi-waza'],
  ]
  let ok = true
  for (const [label, pass] of checks) {
    console.log(`${pass ? 'PASS' : 'FAIL'} - ${label}`)
    if (!pass) ok = false
  }
  console.log('tags Harai-goshi:', JSON.stringify(harai?.tags))

  // Cleanup du judoka temporaire (aucune suppression de donnees du catalogue)
  await admin.from('judokas').delete().eq('user_id', userId)
  await admin.auth.admin.deleteUser(userId)

  if (!ok) process.exit(1)
  console.log('\nVERIFICATION OK')
}

main().catch(async (e) => {
  console.error('ERROR:', e)
  if (userId) {
    await admin.from('judokas').delete().eq('user_id', userId)
    await admin.auth.admin.deleteUser(userId)
  }
  process.exit(1)
})
