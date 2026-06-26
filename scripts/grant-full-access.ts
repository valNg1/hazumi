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

async function grantAccess() {
  console.log('🔐 Octroi d\'accès complet (2 espaces)...\n')

  try {
    // 1. Récupérer le club du compte démo
    const { data: { users } } = await supabase.auth.admin.listUsers()
    const demoUser = users.find(u => u.email === 'demo@hazumi.org')

    if (!demoUser) {
      console.error('❌ demo@hazumi.org pas trouvé')
      return
    }

    const { data: demoJudoka } = await supabase
      .from('judokas')
      .select('club_id')
      .eq('user_id', demoUser.id)
      .single()

    if (!demoJudoka?.club_id) {
      console.error('❌ Club démo pas trouvé')
      return
    }

    const clubId = demoJudoka.club_id
    console.log('✅ Club démo trouvé:', clubId)

    // 2. Modifier le judoka de Valéry pour avoir le rôle "responsable" + club
    console.log('\n📝 Modification du profil Valéry...')
    const valéryUser = users.find(u => u.email === 'nguyen.valery1@gmail.com')

    if (!valéryUser) {
      console.error('❌ nguyen.valery1@gmail.com pas trouvé')
      return
    }

    const { error } = await supabase
      .from('judokas')
      .update({
        role: 'responsable',
        club_id: clubId
      })
      .eq('user_id', valéryUser.id)

    if (error) {
      console.error('❌ Erreur:', error.message)
      return
    }

    console.log('✅ Profil mis à jour!')
    console.log('\n' + '='.repeat(50))
    console.log('✨ ACCÈS COMPLET ACCORDÉ ✨')
    console.log('='.repeat(50))
    console.log('✅ Rôle: responsable')
    console.log('✅ Club: ' + clubId)
    console.log('✅ Accès aux 2 espaces')
    console.log('\n📌 Rafraîchis la page pour voir les changements!')

  } catch (error) {
    console.error('❌ Erreur:', error instanceof Error ? error.message : error)
  }
}

grantAccess()
