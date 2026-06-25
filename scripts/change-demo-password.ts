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
const NEW_PASSWORD = 'demo1234'
const USER_ID = 'f47e1527-eaa2-42ec-99c5-5d018bde2877'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function changePassword() {
  console.log('🔑 Changement du mot de passe du compte démo...\n')

  try {
    // D'abord, s'authentifier avec l'ancien mot de passe
    console.log('🔐 Authentification...')
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: 'R1N$8oX2U8jS' // Ancien mot de passe
    })

    if (signInError) {
      console.error('❌ Impossible de s\'authentifier avec l\'ancien mot de passe')
      console.error('Essayez de relancer avec le bon mot de passe ancien.')
      process.exit(1)
    }

    console.log('✅ Authentification réussie\n')

    // Changer le mot de passe
    console.log('🔄 Changement du mot de passe...')
    const { error: updateError } = await supabase.auth.updateUser({
      password: NEW_PASSWORD
    })

    if (updateError) {
      throw new Error(`Erreur de changement: ${updateError.message}`)
    }

    console.log('✅ Mot de passe changé avec succès\n')

    // Afficher les nouvelles informations
    console.log('=' .repeat(50))
    console.log('✨ MOT DE PASSE MISE À JOUR ✨')
    console.log('=' .repeat(50))
    console.log(`📧 Email:        ${DEMO_EMAIL}`)
    console.log(`🔑 Nouveau mdp:   ${NEW_PASSWORD}`)
    console.log('=' .repeat(50))
    console.log('\n🎯 Vous pouvez vous connecter avec les nouvelles informations.\n')

  } catch (error) {
    console.error('❌ Erreur:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

changePassword()
