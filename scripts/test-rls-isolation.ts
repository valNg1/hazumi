/**
 * Test d'isolation RLS multi-club Hazumi
 *
 * Usage :
 *   SUPABASE_SERVICE_ROLE_KEY=xxx npx tsx scripts/test-rls-isolation.ts
 *
 * La SERVICE_ROLE_KEY est disponible dans Supabase → Settings → API → service_role.
 * Ne jamais la committer — elle bypass tout le RLS.
 *
 * Prérequis : npm install -D tsx (ou ts-node)
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? ''
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY ?? ''
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

if (!SUPABASE_URL || !ANON_KEY || !SERVICE_KEY) {
  console.error(`
Variables d'environnement manquantes.
Lancez :
  VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/test-rls-isolation.ts

Ou créez un fichier .env.test et sourcez-le avant.
`)
  process.exit(1)
}

// Client admin — bypass RLS, utilisé uniquement pour setup/teardown
const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ─── Types ────────────────────────────────────────────────────────────────────

type Result = { table: string; op: string; status: 'OK' | 'FAILLE'; detail: string }
const results: Result[] = []

function ok(table: string, op: string, detail: string) {
  results.push({ table, op, status: 'OK', detail })
}
function faille(table: string, op: string, detail: string) {
  results.push({ table, op, status: 'FAILLE', detail })
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function signInAs(email: string, password: string) {
  const client = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { error } = await client.auth.signInWithPassword({ email, password })
  if (error) throw new Error(`Impossible de se connecter en tant que ${email}: ${error.message}`)
  return client
}

// ─── Setup ───────────────────────────────────────────────────────────────────

async function setup() {
  console.log('\n🔧  Setup des données de test...')

  // Deux clubs
  const { data: clubA, error: errA } = await admin.from('clubs').insert({ nom: '__TEST_CLUB_A__' }).select('id').single()
  const { data: clubB, error: errB } = await admin.from('clubs').insert({ nom: '__TEST_CLUB_B__' }).select('id').single()
  if (errA || errB || !clubA || !clubB) throw new Error(`Impossible de créer les clubs test: ${errA?.message ?? errB?.message}`)

  // Deux utilisateurs auth
  const emailA = `test-rls-a-${Date.now()}@hazumi-test.internal`
  const emailB = `test-rls-b-${Date.now()}@hazumi-test.internal`
  const pwd = 'TestRLS2024!'

  const { data: userA, error: eA } = await admin.auth.admin.createUser({ email: emailA, password: pwd, email_confirm: true })
  const { data: userB, error: eB } = await admin.auth.admin.createUser({ email: emailB, password: pwd, email_confirm: true })
  if (eA || eB || !userA.user || !userB.user) throw new Error(`Impossible de créer les users: ${eA?.message ?? eB?.message}`)

  // Judokas liés aux clubs
  const { error: ejA } = await admin.from('judokas').insert({
    user_id: userA.user.id, full_name: 'Judoka Test A', belt: 'blanche', club_id: clubA.id,
    email: emailA, privacy_accepted_at: new Date().toISOString(),
  })
  const { error: ejB } = await admin.from('judokas').insert({
    user_id: userB.user.id, full_name: 'Judoka Test B', belt: 'blanche', club_id: clubB.id,
    email: emailB, privacy_accepted_at: new Date().toISOString(),
  })
  if (ejA || ejB) throw new Error(`Impossible de créer les judokas: ${ejA?.message ?? ejB?.message}`)

  // Une vidéo de test (pas de club_id actuellement)
  const { data: vid } = await admin.from('videos').insert({
    title: '__TEST_VIDEO__', description: 'rls test', belt: 'blanche',
    technique_key: 'test', video_url: 'https://example.com/test.mp4',
  }).select('id').single()

  // Une entrée de compétition
  const { data: comp } = await admin.from('competitions').insert({
    nom: '__TEST_COMP__', date: '2099-01-01', lieu: 'Test',
  }).select('id').single()

  console.log(`   Club A: ${clubA.id}`)
  console.log(`   Club B: ${clubB.id}`)
  console.log(`   User A: ${userA.user.id} (${emailA})`)
  console.log(`   User B: ${userB.user.id} (${emailB})`)

  return {
    clubA: clubA.id, clubB: clubB.id,
    userA: userA.user.id, userB: userB.user.id,
    emailA, emailB, pwd,
    videoId: vid?.id,
    compId: comp?.id,
  }
}

// ─── Teardown ────────────────────────────────────────────────────────────────

async function teardown(ctx: Awaited<ReturnType<typeof setup>>) {
  console.log('\n🗑   Nettoyage...')
  if (ctx.videoId) await admin.from('videos').delete().eq('id', ctx.videoId)
  if (ctx.compId) await admin.from('competitions').delete().eq('id', ctx.compId)
  await admin.from('judokas').delete().eq('user_id', ctx.userA)
  await admin.from('judokas').delete().eq('user_id', ctx.userB)
  await admin.auth.admin.deleteUser(ctx.userA)
  await admin.auth.admin.deleteUser(ctx.userB)
  await admin.from('clubs').delete().eq('id', ctx.clubA)
  await admin.from('clubs').delete().eq('id', ctx.clubB)
  console.log('   Terminé.')
}

// ─── Tests ───────────────────────────────────────────────────────────────────

async function runTests(ctx: Awaited<ReturnType<typeof setup>>) {
  console.log('\n🔍  Exécution des tests d\'isolation...\n')

  const clientA = await signInAs(ctx.emailA, ctx.pwd)

  // ── judokas ────────────────────────────────────────────────────────────────

  // Lecture : judoka A peut-il voir le judoka B ?
  {
    const { data } = await clientA.from('judokas').select('id, full_name, club_id').neq('user_id', ctx.userA)
    const seesB = (data ?? []).some(j => j.full_name === 'Judoka Test B')
    if (seesB) faille('judokas', 'SELECT cross-club', `Judoka A voit ${data!.length} enregistrement(s) d'autres clubs`)
    else ok('judokas', 'SELECT cross-club', 'Judoka A ne voit pas Judoka B')
  }

  // Lecture : judoka A voit-il son propre enregistrement ?
  {
    const { data } = await clientA.from('judokas').select('id').eq('user_id', ctx.userA)
    if ((data?.length ?? 0) === 1) ok('judokas', 'SELECT self', 'Judoka A voit son propre profil')
    else faille('judokas', 'SELECT self', `Judoka A ne voit pas son propre profil (count: ${data?.length})`)
  }

  // Écriture : judoka A peut-il modifier le judoka B ?
  {
    const { error } = await clientA.from('judokas').update({ belt: 'noire' }).eq('user_id', ctx.userB)
    // Vérifier si la modification a eu lieu
    const { data: after } = await admin.from('judokas').select('belt').eq('user_id', ctx.userB).single()
    if (after?.belt === 'noire') {
      faille('judokas', 'UPDATE cross-club', 'Judoka A a pu modifier la ceinture de Judoka B !')
      // Réparer
      await admin.from('judokas').update({ belt: 'blanche' }).eq('user_id', ctx.userB)
    } else {
      ok('judokas', 'UPDATE cross-club', `Bloqué (${error?.message ?? 'aucune ligne modifiée'})`)
    }
  }

  // INSERT : judoka A peut-il insérer un judoka dans le club B ?
  {
    const { error } = await clientA.from('judokas').insert({
      user_id: '00000000-0000-0000-0000-000000000001',
      full_name: 'Intrus', belt: 'blanche', club_id: ctx.clubB,
    })
    if (!error) {
      faille('judokas', 'INSERT cross-club', 'Judoka A a pu insérer un judoka dans le Club B !')
      await admin.from('judokas').delete().eq('full_name', 'Intrus')
    } else {
      ok('judokas', 'INSERT cross-club', `Bloqué: ${error.message}`)
    }
  }

  // ── clubs ──────────────────────────────────────────────────────────────────

  // Lecture : judoka A peut-il voir le Club B ?
  {
    const { data } = await clientA.from('clubs').select('id, nom').eq('id', ctx.clubB)
    if ((data?.length ?? 0) > 0) faille('clubs', 'SELECT cross-club', `Judoka A voit le Club B (${data![0].nom})`)
    else ok('clubs', 'SELECT cross-club', 'Judoka A ne voit pas le Club B')
  }

  // Lecture : judoka A voit son propre club ?
  {
    const { data } = await clientA.from('clubs').select('id').eq('id', ctx.clubA)
    if ((data?.length ?? 0) === 1) ok('clubs', 'SELECT own club', 'Judoka A voit son propre club')
    else faille('clubs', 'SELECT own club', 'Judoka A ne peut pas lire son propre club')
  }

  // Écriture : judoka A peut-il modifier le Club B ?
  {
    const { error } = await clientA.from('clubs').update({ nom: '__HACKED__' }).eq('id', ctx.clubB)
    const { data: after } = await admin.from('clubs').select('nom').eq('id', ctx.clubB).single()
    if (after?.nom === '__HACKED__') {
      faille('clubs', 'UPDATE cross-club', 'Judoka A a pu modifier le nom du Club B !')
      await admin.from('clubs').update({ nom: '__TEST_CLUB_B__' }).eq('id', ctx.clubB)
    } else {
      ok('clubs', 'UPDATE cross-club', `Bloqué (${error?.message ?? 'aucune ligne modifiée'})`)
    }
  }

  // ── videos ─────────────────────────────────────────────────────────────────

  // Lecture : la table videos a-t-elle un club_id ?
  {
    const { data } = await clientA.from('videos').select('id, title').eq('title', '__TEST_VIDEO__')
    // Si pas de club_id, tous les users voient toutes les vidéos → signalé comme info
    if ((data?.length ?? 0) > 0) {
      faille('videos', 'SELECT (pas de club_id)', `Judoka A voit toutes les vidéos du système (aucune isolation par club). La table videos n'a pas de colonne club_id.`)
    } else {
      ok('videos', 'SELECT', 'Aucune vidéo visible cross-club')
    }
  }

  // Écriture : judoka A peut-il insérer une vidéo ?
  {
    const { data: ins, error } = await clientA.from('videos').insert({
      title: '__INTRUS__', description: 'test', belt: 'blanche',
      technique_key: 'test', video_url: 'https://evil.com/vid.mp4',
    }).select('id').single()
    if (ins) {
      faille('videos', 'INSERT (pas de club_id)', 'Judoka A peut ajouter des vidéos dans la bibliothèque globale')
      await admin.from('videos').delete().eq('id', ins.id)
    } else {
      ok('videos', 'INSERT', `Bloqué: ${error?.message}`)
    }
  }

  // ── competitions ───────────────────────────────────────────────────────────

  {
    const { data } = await clientA.from('competitions').select('id').eq('id', ctx.compId)
    if ((data?.length ?? 0) > 0) faille('competitions', 'SELECT (global)', 'Toutes les compétitions visibles par tout utilisateur authentifié — pas de club_id')
    else ok('competitions', 'SELECT', 'Compétition non visible')
  }

  {
    const { error } = await clientA.from('competitions').update({ lieu: '__HACKED__' }).eq('id', ctx.compId)
    const { data: after } = await admin.from('competitions').select('lieu').eq('id', ctx.compId).single()
    if (after?.lieu === '__HACKED__') {
      faille('competitions', 'UPDATE (global)', 'Tout utilisateur auth peut modifier les compétitions')
      await admin.from('competitions').update({ lieu: 'Test' }).eq('id', ctx.compId)
    } else {
      ok('competitions', 'UPDATE', `Bloqué: ${error?.message}`)
    }
  }

  // ── entrainements ──────────────────────────────────────────────────────────
  // entrainements est lié à judokas.id — les judokas de l'user A sont hors scope B
  {
    const { data: judokaB } = await admin.from('judokas').select('id').eq('user_id', ctx.userB).single()
    if (judokaB) {
      // Insérer un entrainement pour judoka B (via admin)
      const { data: ent } = await admin.from('entrainements').insert({
        judoka_id: judokaB.id, date: '2099-06-01', duree_minutes: 90,
      }).select('id').single()

      if (ent) {
        const { data: seen } = await clientA.from('entrainements').select('id').eq('id', ent.id)
        if ((seen?.length ?? 0) > 0) faille('entrainements', 'SELECT cross-club', 'Judoka A voit les entrainements du Club B')
        else ok('entrainements', 'SELECT cross-club', 'Judoka A ne voit pas les entrainements du Club B')

        const { error } = await clientA.from('entrainements').update({ duree_minutes: 999 }).eq('id', ent.id)
        const { data: after } = await admin.from('entrainements').select('duree_minutes').eq('id', ent.id).single()
        if (after?.duree_minutes === 999) {
          faille('entrainements', 'UPDATE cross-club', 'Judoka A a pu modifier les entrainements du Club B')
          await admin.from('entrainements').update({ duree_minutes: 90 }).eq('id', ent.id)
        } else {
          ok('entrainements', 'UPDATE cross-club', `Bloqué: ${error?.message}`)
        }

        await admin.from('entrainements').delete().eq('id', ent.id)
      }
    }
  }

  // ── playlists ──────────────────────────────────────────────────────────────
  // playlists → liées à judokas.id → normalement isolées
  {
    const { data: judokaB } = await admin.from('judokas').select('id').eq('user_id', ctx.userB).single()
    if (judokaB) {
      const { data: pl } = await admin.from('playlists').insert({
        judoka_id: judokaB.id, name: '__PLAYLIST_B__',
      }).select('id').single()

      if (pl) {
        const { data: seen } = await clientA.from('playlists').select('id').eq('id', pl.id)
        if ((seen?.length ?? 0) > 0) faille('playlists', 'SELECT cross-club', 'Judoka A voit les playlists du Club B')
        else ok('playlists', 'SELECT cross-club', 'Judoka A ne voit pas les playlists du Club B')

        await admin.from('playlists').delete().eq('id', pl.id)
      }
    }
  }
}

// ─── Rapport ─────────────────────────────────────────────────────────────────

function printReport() {
  console.log('\n' + '═'.repeat(70))
  console.log('  RAPPORT D\'ISOLATION RLS — HAZUMI MULTI-CLUB')
  console.log('═'.repeat(70))

  const byTable = new Map<string, Result[]>()
  for (const r of results) {
    if (!byTable.has(r.table)) byTable.set(r.table, [])
    byTable.get(r.table)!.push(r)
  }

  for (const [table, rows] of byTable) {
    const hasFaille = rows.some(r => r.status === 'FAILLE')
    console.log(`\n  ${hasFaille ? '❌' : '✅'}  ${table}`)
    for (const r of rows) {
      const icon = r.status === 'OK' ? '    ✓' : '    ✗'
      console.log(`${icon}  [${r.op}] ${r.detail}`)
    }
  }

  const total = results.length
  const failles = results.filter(r => r.status === 'FAILLE').length
  const ok = total - failles

  console.log('\n' + '─'.repeat(70))
  console.log(`  ${ok}/${total} tests OK   |   ${failles} FAILLE(S) détectée(s)`)
  if (failles > 0) {
    console.log(`\n  ⚠  Consultez scripts/fix-rls-isolation.sql pour les corrections.`)
  } else {
    console.log(`\n  ✅  Isolation multi-club validée.`)
  }
  console.log('═'.repeat(70) + '\n')
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  let ctx: Awaited<ReturnType<typeof setup>> | undefined

  try {
    ctx = await setup()
    await runTests(ctx)
  } catch (err) {
    console.error('\n💥  Erreur fatale:', err)
  } finally {
    if (ctx) await teardown(ctx)
    printReport()
  }
}

main()
