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

async function addDemoJudoka() {
  console.log('🎯 Ajout du profil judoka au compte démo...\n')

  try {
    // Trouver l'utilisateur démo
    const { data: { users } } = await supabase.auth.admin.listUsers()
    const demoUser = users.find(u => u.email === 'demo@hazumi.org')

    if (!demoUser) {
      console.error('❌ Utilisateur demo@hazumi.org pas trouvé')
      return
    }

    console.log('✅ Utilisateur trouvé:', demoUser.id)

    // Vérifier si un judoka existe déjà
    const { data: existing } = await supabase
      .from('judokas')
      .select('id, role')
      .eq('user_id', demoUser.id)

    console.log('\nJudokas existants:')
    existing?.forEach(j => console.log(`  - ${j.role}`))

    // Créer un profil judoka en plus du profil responsable
    console.log('\n👤 Création du profil judoka...')
    const { data, error } = await supabase
      .from('judokas')
      .insert({
        user_id: demoUser.id,
        full_name: 'Démo Judoka',
        role: 'judoka',
        belt: 'blanche',
        cotisation_paid: true,
        email: 'demo@hazumi.org',
        birth_date: null,
        license_number: null,
        license_expiry: null,
        emergency_contact: null,
        cert_medical_ok: false,
      })
      .select()
      .single()

    if (error) {
      if (error.message.includes('duplicate')) {
        console.log('⚠️ Un profil judoka existe déjà pour ce user')
      } else {
        console.error('❌ Erreur:', error.message)
      }
      return
    }

    console.log('✅ Profil judoka créé!')
    console.log('\n' + '='.repeat(50))
    console.log('✨ COMPTE DÉMO COMPLET ✨')
    console.log('='.repeat(50))
    console.log('✅ Profil responsable (espace club)')
    console.log('✅ Profil judoka (espace élève)')
    console.log('✅ Accès total aux 2 espaces\n')

  } catch (error) {
    console.error('❌ Erreur:', error instanceof Error ? error.message : error)
  }
}

addDemoJudoka()
