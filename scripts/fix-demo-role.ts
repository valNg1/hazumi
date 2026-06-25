import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Charger les variables d'environnement
const envPath = path.join(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const env: Record<string, string> = {}
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=')
  if (key && value) env[key.trim()] = value.trim()
})

const SUPABASE_URL = env.VITE_SUPABASE_URL!
const SUPABASE_KEY = env.VITE_SUPABASE_ANON_KEY!
const DEMO_EMAIL = 'demo@hazumi.org'
const USER_ID = 'f47e1527-eaa2-42ec-99c5-5d018bde2877'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function fixDemoRole() {
  console.log('🔧 Correction du rôle du judoka démo...\n')

  try {
    // S'authentifier d'abord
    console.log('🔐 Authentification...')
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: 'demo1234'
    })

    if (signInError) {
      console.error('❌ Impossible de s\'authentifier')
      process.exit(1)
    }

    console.log('✅ Authentification réussie\n')

    // Récupérer le judoka associé à l'utilisateur
    console.log('🔍 Recherche du judoka...')
    const { data: judoka, error: selectError } = await supabase
      .from('judokas')
      .select('id, full_name, role')
      .eq('user_id', USER_ID)
      .single()

    if (selectError || !judoka) {
      console.error('❌ Impossible de trouver le judoka')
      console.log('Créez d\'abord le compte avec: npx tsx scripts/setup-demo-account.ts')
      process.exit(1)
    }

    console.log(`✅ Judoka trouvé: "${judoka.full_name}" (rôle actuel: ${judoka.role})\n`)

    // Mettre à jour le rôle
    if (judoka.role === 'responsable') {
      console.log('ℹ️ Le rôle est déjà "responsable"\n')
    } else {
      console.log('🔄 Mise à jour du rôle à "responsable"...')
      const { error: updateError } = await supabase
        .from('judokas')
        .update({ role: 'responsable' })
        .eq('id', judoka.id)

      if (updateError) {
        throw new Error(`Erreur: ${updateError.message}`)
      }

      console.log('✅ Rôle mis à jour\n')
    }

    // Afficher le résumé
    console.log('=' .repeat(50))
    console.log('✨ COMPTE DE DÉMO CORRIGÉ ✨')
    console.log('=' .repeat(50))
    console.log(`📧 Email:     ${DEMO_EMAIL}`)
    console.log(`🔑 Mot passe: demo1234`)
    console.log(`👤 Judoka:    ${judoka.full_name}`)
    console.log(`👔 Rôle:      responsable`)
    console.log('=' .repeat(50))
    console.log('\n✅ Vous devriez maintenant voir les deux options "Espace Élève" et "Espace Club"\n')

  } catch (error) {
    console.error('❌ Erreur:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

fixDemoRole()
