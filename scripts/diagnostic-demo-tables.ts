import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const envPath = path.join(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const env: Record<string, string> = {}
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=')
  if (key && value) env[key.trim()] = value.trim()
})

const SUPABASE_URL = env.VITE_SUPABASE_URL!
const SERVICE_KEY = env.SUPABASE_SERVICE_KEY!

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

async function diagnose() {
  console.log('🔍 DIAGNOSTIC DEMO ACCOUNT\n')

  try {
    // 1. Vérifier si demo@hazumi.org existe dans auth.users
    console.log('1️⃣  Chercher demo@hazumi.org dans auth.users...')
    const { data: { users } } = await supabase.auth.admin.listUsers()
    const demoUser = users.find(u => u.email === 'demo@hazumi.org')

    if (!demoUser) {
      console.log('❌ demo@hazumi.org NOT FOUND in auth.users')
      return
    }
    console.log('✅ demo@hazumi.org FOUND')
    console.log('   User ID:', demoUser.id)
    console.log('   Email:', demoUser.email)

    // 2. Vérifier les tables disponibles et leur contenu
    console.log('\n2️⃣  Vérifier les tables contenant le profil du user...')

    // Essayer profiles
    let profiles = null
    let profilesError = null
    try {
      const result = await supabase
        .from('profiles')
        .select('*')
        .eq('email', 'demo@hazumi.org')
        .single()
      profiles = result.data
      profilesError = result.error
    } catch (e) {
      profilesError = { message: 'profiles table error' }
    }

    if (!profilesError && profiles) {
      console.log('✅ Found in "profiles" table:')
      console.log(JSON.stringify(profiles, null, 2))
    } else {
      console.log('⚠️  "profiles" table: ' + (profilesError?.message || 'no data'))
    }

    // Essayer judokas
    let judokas = null
    let judokasError = null
    try {
      const result = await supabase
        .from('judokas')
        .select('*')
        .eq('user_id', demoUser.id)
        .single()
      judokas = result.data
      judokasError = result.error
    } catch (e) {
      judokasError = { message: 'judokas table error' }
    }

    if (!judokasError && judokas) {
      console.log('\n✅ Found in "judokas" table:')
      console.log('   ID:', judokas.id)
      console.log('   Full Name:', judokas.full_name)
      console.log('   Role:', judokas.role)
      console.log('   Club ID:', judokas.club_id)
    } else {
      console.log('\n⚠️  "judokas" table: ' + (judokasError?.message || 'no data'))
    }

    // 3. Vérifier si le club existe
    console.log('\n3️⃣  Vérifier le club associé...')

    const clubId = judokas?.club_id
    if (!clubId) {
      console.log('❌ No club_id found for demo user')
      return
    }

    const { data: club, error: clubError } = await supabase
      .from('clubs')
      .select('*')
      .eq('id', clubId)
      .single()

    if (!clubError && club) {
      console.log('✅ Club FOUND:')
      console.log('   ID:', club.id)
      console.log('   Nom:', club.nom)
    } else {
      console.log('❌ Club NOT found:', clubError?.message)
    }

    // 4. Vérifier les RLS policies
    console.log('\n4️⃣  Vérifier l\'accès aux données du club...')

    const { data: clubMembers, error: membersError } = await supabase
      .from('judokas')
      .select('*')
      .eq('club_id', clubId)

    if (!membersError) {
      console.log('✅ Accès aux judokas du club OK')
      console.log('   Nombre d\'élèves:', clubMembers?.length ?? 0)
    } else {
      console.log('❌ Erreur d\'accès aux judokas:', membersError.message)
      console.log('   Code:', membersError.code)
    }

  } catch (error) {
    console.error('❌ Erreur:', error instanceof Error ? error.message : error)
  }
}

diagnose()
