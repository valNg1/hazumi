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

async function check() {
  console.log('🔍 Vérification du compte démo...\n')

  try {
    // 1. Trouver l'utilisateur demo
    const { data: { users } } = await supabase.auth.admin.listUsers()
    const demoUser = users.find(u => u.email === 'demo@hazumi.org')

    if (!demoUser) {
      console.error('❌ Utilisateur demo@hazumi.org pas trouvé')
      return
    }

    console.log('✅ Utilisateur trouvé:', demoUser.id, demoUser.email)

    // 2. Vérifier le judoka
    const { data: judoka, error: judokaError } = await supabase
      .from('judokas')
      .select('*')
      .eq('user_id', demoUser.id)
      .single()

    if (judokaError) {
      console.error('❌ Erreur judoka:', judokaError.message)
      return
    }

    console.log('\n✅ Judoka trouvé:')
    console.log('   ID:', judoka.id)
    console.log('   Nom:', judoka.full_name)
    console.log('   Rôle:', judoka.role)
    console.log('   Club ID:', judoka.club_id)

    if (!judoka.club_id) {
      console.error('❌ PROBLÈME: Le judoka n\'a pas de club_id!')
      return
    }

    // 3. Vérifier le club
    const { data: club, error: clubError } = await supabase
      .from('clubs')
      .select('*')
      .eq('id', judoka.club_id)
      .single()

    if (clubError) {
      console.error('❌ Erreur club:', clubError.message)
      return
    }

    console.log('\n✅ Club trouvé:')
    console.log('   ID:', club.id)
    console.log('   Nom:', club.nom)
    console.log('   Plan:', club.plan)

    // 4. Vérifier les élèves du club
    const { data: judokas } = await supabase
      .from('judokas')
      .select('full_name, role')
      .eq('club_id', judoka.club_id)

    console.log('\n✅ Élèves du club:', judokas?.length ?? 0)
    judokas?.forEach(j => {
      console.log(`   - ${j.full_name} (${j.role})`)
    })

  } catch (error) {
    console.error('❌ Erreur:', error instanceof Error ? error.message : error)
  }
}

check()
