import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const envContent = readFileSync('.env.local', 'utf-8')
const env: Record<string, string> = {}
envContent.split('\n').forEach((l) => { const i = l.indexOf('='); if (i > 0) env[l.slice(0, i).trim()] = l.slice(i + 1).trim() })
const URL = env.VITE_SUPABASE_URL!, ANON = env.VITE_SUPABASE_ANON_KEY!, SERVICE = env.SUPABASE_SERVICE_KEY!
const admin = createClient(URL, SERVICE, { auth: { autoRefreshToken: false, persistSession: false } })

const PASS = 'RlsTest123!'
const stamp = Date.now()
const results: [string, boolean][] = []
const check = (label: string, ok: boolean) => results.push([label, ok])

async function mkJudoka(tag: string) {
  const email = `lesson-rls-${tag}-${stamp}@test.fr`
  const { data, error } = await admin.auth.admin.createUser({ email, password: PASS, email_confirm: true })
  if (error || !data.user) throw error ?? new Error('createUser')
  const { data: j, error: je } = await admin.from('judokas').insert({ user_id: data.user.id, full_name: `RLS ${tag}`, email, birth_date: '1990-01-01', role: 'judoka' }).select('id').single()
  if (je) throw je
  return { userId: data.user.id, judokaId: j.id, email }
}
async function signIn(email: string): Promise<SupabaseClient> {
  const c = createClient(URL, ANON)
  const { error } = await c.auth.signInWithPassword({ email, password: PASS })
  if (error) throw error
  return c
}

async function main() {
  const A = await mkJudoka('a')
  const B = await mkJudoka('b')

  const { data: harai } = await admin.from('catalogue_hazumi').select('id').eq('titre', 'Harai-goshi').single()
  const { data: lesson } = await admin.from('lesson').select('id').eq('ressource_id', harai!.id).single()
  const lessonId = lesson!.id

  // Lecon non publiee sur une autre ressource
  const { data: other } = await admin.from('catalogue_hazumi').select('id').eq('titre', 'O-soto-gari').single()
  const { data: unpub } = await admin.from('lesson').insert({ ressource_id: other!.id, published: false, objectif: 'secret' }).select('id').single()
  const unpubId = unpub!.id

  const ca = await signIn(A.email)

  // 1. Judoka lit une lecon publiee + chapitres + quiz
  const rl = await ca.from('lesson').select('*').eq('id', lessonId)
  check('judoka lit la lecon publiee', (rl.data?.length ?? 0) === 1)
  const rc = await ca.from('lesson_chapters').select('*').eq('lesson_id', lessonId)
  check('judoka lit les chapitres publies', (rc.data?.length ?? 0) > 0)
  const rq = await ca.from('lesson_quiz').select('*').eq('lesson_id', lessonId)
  check('judoka lit le quiz publie', (rq.data?.length ?? 0) > 0)

  // 2. Judoka NE lit PAS une lecon non publiee
  const runp = await ca.from('lesson').select('*').eq('id', unpubId)
  check('lecon non publiee invisible au judoka', (runp.data?.length ?? 0) === 0)

  // 3. Judoka NE peut PAS creer de lecon (ecriture admin only)
  const ins = await ca.from('lesson').insert({ ressource_id: harai!.id, objectif: 'pirate' }).select()
  check('judoka ne peut pas creer de lecon', ins.error !== null || (ins.data?.length ?? 0) === 0)

  // 4. Judoka A ecrit ses notes privees
  const wn = await ca.from('lesson_notes').upsert({ judoka_id: A.judokaId, lesson_id: lessonId, contenu: 'note privee de A' }, { onConflict: 'judoka_id,lesson_id' }).select()
  check('judoka ecrit ses propres notes', wn.error === null)
  const ownNotes = await ca.from('lesson_notes').select('contenu').eq('judoka_id', A.judokaId)
  check('judoka relit ses propres notes', ownNotes.data?.[0]?.contenu === 'note privee de A')

  // 5. Judoka B NE lit PAS les notes de A
  const cb = await signIn(B.email)
  const spy = await cb.from('lesson_notes').select('*').eq('judoka_id', A.judokaId)
  check('notes de A invisibles pour B', (spy.data?.length ?? 0) === 0)
  const spyAll = await cb.from('lesson_notes').select('*')
  check('B ne voit aucune note d’autrui', (spyAll.data ?? []).every((n: any) => n.judoka_id === B.judokaId))

  // Cleanup
  await admin.from('lesson_notes').delete().eq('judoka_id', A.judokaId)
  await admin.from('lesson').delete().eq('id', unpubId)
  for (const u of [A, B]) { await admin.from('judokas').delete().eq('user_id', u.userId); await admin.auth.admin.deleteUser(u.userId) }

  let ok = true
  for (const [label, pass] of results) { console.log(`${pass ? 'PASS' : 'FAIL'} - ${label}`); if (!pass) ok = false }
  console.log(ok ? '\nRLS OK' : '\nRLS FAILED')
  if (!ok) process.exit(1)
}
main().catch((e) => { console.error(e); process.exit(1) })
