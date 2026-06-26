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
  console.log('🔍 Vérification de TOUS les profils du compte démo...\n')

  try {
    const { data: { users } } = await supabase.auth.admin.listUsers()
    const demoUser = users.find(u => u.email === 'demo@hazumi.org')

    if (!demoUser) {
      console.error('❌ Utilisateur pas trouvé')
      return
    }

    console.log('User ID:', demoUser.id, '\n')

    // Récupérer TOUS les judokas pour ce user
    const { data: allJudokas } = await supabase
      .from('judokas')
      .select('*')
      .eq('user_id', demoUser.id)

    console.log(`Trouvé ${allJudokas?.length ?? 0} profils:\n`)
    allJudokas?.forEach((j, i) => {
      console.log(`${i + 1}. ${j.full_name}`)
      console.log(`   Rôle: ${j.role}`)
      console.log(`   Club: ${j.club_id ?? 'aucun'}`)
      console.log('')
    })

  } catch (error) {
    console.error('❌ Erreur:', error instanceof Error ? error.message : error)
  }
}

check()
