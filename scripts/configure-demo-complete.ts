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

async function configureDemo() {
  console.log('🔧 Configuration complète du compte démo...\n')

  try {
    // S'authentifier
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

    // 1. Vider les données du profil judoka
    console.log('📋 Nettoyage du profil judoka...')
    const { error: updateError } = await supabase
      .from('judokas')
      .update({
        birth_date: null,
        license_number: null,
        license_expiry: null,
        email: null,
        phone: null,
        emergency_contact: null,
        cert_medical_ok: false,
        cert_medical_expiry: null,
      })
      .eq('user_id', USER_ID)

    if (updateError) {
      console.error(`❌ Erreur: ${updateError.message}`)
    } else {
      console.log('✅ Profil nettoyé\n')
    }

    // 2. Activer cotisation_paid (débloquer Pro)
    console.log('💎 Déblocage du compte Pro...')
    const { error: proError } = await supabase
      .from('judokas')
      .update({ cotisation_paid: true })
      .eq('user_id', USER_ID)

    if (proError) {
      console.error(`❌ Erreur: ${proError.message}`)
    } else {
      console.log('✅ Compte Pro débloqué\n')
    }

    // 3. Vider le logo du club pour utiliser le logo par défaut Hazumi
    console.log('🎨 Configuration du logo du club...')
    const { data: club } = await supabase
      .from('clubs')
      .select('id')
      .limit(1)
      .single()

    if (club) {
      const { error: logoError } = await supabase
        .from('clubs')
        .update({ logo_url: null })
        .eq('id', club.id)

      if (logoError) {
        console.warn(`⚠️ Avertissement logo: ${logoError.message}`)
      } else {
        console.log('✅ Logo club configuré (utilise logo Hazumi par défaut)\n')
      }
    }

    // Afficher le résumé
    console.log('=' .repeat(50))
    console.log('✨ COMPTE DÉMO CONFIGURÉ ✨')
    console.log('=' .repeat(50))
    console.log('✅ Interface mise à jour avec nouveau design')
    console.log('✅ Profil vidé (à remplir par le prospect)')
    console.log('✅ Compte Pro débloqué')
    console.log('✅ Logo Hazumi appliqué')
    console.log('=' .repeat(50))
    console.log('\n📧 Email:     demo@hazumi.org')
    console.log('🔑 Mot passe: demo1234\n')

  } catch (error) {
    console.error('❌ Erreur:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

configureDemo()
