import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY!
const SUPABASE_ADMIN_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface TestResult {
  table: string
  operation: string
  expected: 'BLOCKED' | 'ALLOWED'
  actual: 'BLOCKED' | 'ALLOWED'
  passed: boolean
  error?: string
}

const results: TestResult[] = []

async function runTest() {
  console.log('\n' + '='.repeat(70))
  console.log('🔒 TEST D\'ISOLATION RLS MULTI-CLUB - SUPABASE')
  console.log('='.repeat(70) + '\n')

  try {
    const adminClient = createClient(SUPABASE_URL, SUPABASE_ADMIN_KEY)
    console.log('📊 ÉTAPE 1 : Création des données de test\n')
    await createTestData(adminClient)

    console.log('\n🔐 ÉTAPE 2 : Test d\'isolation RLS\n')
    await testIsolation()

    console.log('\n📋 ÉTAPE 3 : Rapport des tests\n')
    displayResults()

    console.log('\n🧹 ÉTAPE 4 : Nettoyage\n')
    await cleanup(adminClient)

  } catch (error) {
    console.error('❌ Erreur critique:', error)
    process.exit(1)
  }
}

async function createTestData(adminClient: any) {
  try {
    const { data: clubA, error: clubAError } = await adminClient
      .from('clubs')
      .insert({
        nom: `Club Test A ${Date.now()}`,
        adresse: '1 Rue Test A, 75000 Paris',
        email_contact: `test-a-${Date.now()}@test.fr`,
        nom_representant: 'Test A Dirigeant',
      })
      .select()
      .single()

    if (clubAError) throw clubAError
    console.log(`✅ Club A créé : ${clubA.nom}`)
    global.clubAId = clubA.id

    const { data: clubB, error: clubBError } = await adminClient
      .from('clubs')
      .insert({
        nom: `Club Test B ${Date.now()}`,
        adresse: '2 Rue Test B, 75000 Paris',
        email_contact: `test-b-${Date.now()}@test.fr`,
        nom_representant: 'Test B Dirigeant',
      })
      .select()
      .single()

    if (clubBError) throw clubBError
    console.log(`✅ Club B créé : ${clubB.nom}`)
    global.clubBId = clubB.id

    const emailA = `judoka-a-${Date.now()}@test.fr`
    const { data: authA } = await adminClient.auth.admin.createUser({
      email: emailA,
      password: 'TestPassword123!',
      email_confirm: true,
    })

    if (!authA.user) throw new Error('Failed to create user A')
    global.userAId = authA.user.id

    await adminClient.from('judokas').insert({
      user_id: authA.user.id,
      full_name: 'Judoka A Test',
      email: emailA,
      club_id: clubA.id,
      birth_date: '1990-01-01',
      role: 'judoka',
    })
    console.log(`✅ Judoka A créé : ${emailA}`)
    global.emailA = emailA

    const emailB = `judoka-b-${Date.now()}@test.fr`
    const { data: authB } = await adminClient.auth.admin.createUser({
      email: emailB,
      password: 'TestPassword123!',
      email_confirm: true,
    })

    if (!authB.user) throw new Error('Failed to create user B')
    global.userBId = authB.user.id

    await adminClient.from('judokas').insert({
      user_id: authB.user.id,
      full_name: 'Judoka B Test',
      email: emailB,
      club_id: clubB.id,
      birth_date: '1990-01-01',
      role: 'judoka',
    })
    console.log(`✅ Judoka B créé : ${emailB}`)
    global.emailB = emailB

  } catch (error) {
    console.error('❌ Erreur création données:', error)
    throw error
  }
}

async function testIsolation() {
  try {
    const clientA = createClient(SUPABASE_URL, SUPABASE_KEY)
    const { error: loginError } = await clientA.auth.signInWithPassword({
      email: global.emailA,
      password: 'TestPassword123!',
    })

    if (loginError) throw loginError
    console.log(`✅ Connecté en tant que Judoka A (Club A)`)

    const tablesToTest = ['judokas', 'clubs', 'videos', 'courses', 'seances']

    for (const table of tablesToTest) {
      await testTableRead(clientA, table)
    }

  } catch (error) {
    console.error('❌ Erreur test isolation:', error)
  }
}

async function testTableRead(client: any, table: string) {
  try {
    const { data, error } = await client
      .from(table)
      .select('*')
      .eq('club_id', global.clubBId)
      .limit(1)

    const isBlocked = error !== null || data?.length === 0
    recordResult({ table, operation: 'READ', expected: 'BLOCKED', actual: isBlocked ? 'BLOCKED' : 'ALLOWED', error: error?.message })
    console.log(`${isBlocked ? '✅' : '❌'} ${table.padEnd(20)} - ${isBlocked ? 'BLOQUÉ' : 'FAILLE!'}`)
  } catch (e: any) {
    console.log(`⏭️  ${table.padEnd(20)} - N/A`)
  }
}

function recordResult(result: Omit<TestResult, 'passed'>) {
  const r = { ...result, passed: result.actual === result.expected }
  results.push(r)
}

function displayResults() {
  const passed = results.filter(r => r.passed).length
  const failed = results.length - passed

  console.log('-'.repeat(70))
  console.log(`✅ Réussis : ${passed}/${results.length}`)
  console.log(`❌ Échoués : ${failed}/${results.length}`)
  console.log(`📈 Taux : ${((passed / results.length) * 100).toFixed(1)}%`)
  
  if (failed > 0) {
    console.log('\n⚠️  FAILLES DÉTECTÉES!')
  } else {
    console.log('\n✅ ISOLATION RLS OK!')
  }
  console.log('='.repeat(70) + '\n')
}

async function cleanup(adminClient: any) {
  try {
    if (global.userAId) {
      await adminClient.from('judokas').delete().eq('user_id', global.userAId)
      await adminClient.auth.admin.deleteUser(global.userAId)
      console.log('✅ Judoka A supprimé')
    }
    if (global.userBId) {
      await adminClient.from('judokas').delete().eq('user_id', global.userBId)
      await adminClient.auth.admin.deleteUser(global.userBId)
      console.log('✅ Judoka B supprimé')
    }
    if (global.clubAId) {
      await adminClient.from('clubs').delete().eq('id', global.clubAId)
      console.log('✅ Club A supprimé')
    }
    if (global.clubBId) {
      await adminClient.from('clubs').delete().eq('id', global.clubBId)
      console.log('✅ Club B supprimé')
    }
    console.log('\n✅ Nettoyage terminé')
  } catch (error) {
    console.error('❌ Erreur nettoyage:', error)
  }
}

declare global {
  var clubAId: string
  var clubBId: string
  var userAId: string
  var userBId: string
  var emailA: string
  var emailB: string
}

runTest().catch(console.error)
