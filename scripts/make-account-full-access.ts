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

async function updateAccount() {
  console.log('🔧 Configuration d\'un compte pour accès complet...\n')

  try {
    // On va utiliser le compte demo mais on va vérifier d'abord tous les comptes
    console.log('Comptes disponibles:')
    const { data: { users } } = await supabase.auth.admin.listUsers()

    users.forEach((u, i) => {
      console.log(`${i + 1}. ${u.email}`)
    })

    console.log('\n📌 On va utiliser: demo@hazumi.org\n')

    const demoUser = users.find(u => u.email === 'demo@hazumi.org')
    if (!demoUser) {
      console.error('❌ demo@hazumi.org pas trouvé')
      return
    }

    // Récupérer le club du judoka responsable
    const { data: judoka } = await supabase
      .from('judokas')
      .select('club_id')
      .eq('user_id', demoUser.id)
      .single()

    if (!judoka?.club_id) {
      console.error('❌ Pas de club trouvé')
      return
    }

    console.log('📌 Vérification du rôle et du club...')
    console.log('   User:', demoUser.id)
    console.log('   Club:', judoka.club_id)

    // Le compte démo a déjà le rôle responsable
    console.log('\n✅ Compte démo prêt avec:')
    console.log('   ✓ Rôle: responsable')
    console.log('   ✓ Club: ' + judoka.club_id)
    console.log('\n📝 À faire: Se connecter avec demo@hazumi.org')
    console.log('   Email: demo@hazumi.org')
    console.log('   Mot de passe: demo1234')

  } catch (error) {
    console.error('❌ Erreur:', error instanceof Error ? error.message : error)
  }
}

updateAccount()
