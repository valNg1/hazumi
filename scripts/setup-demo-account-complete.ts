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
const SERVICE_KEY = env.SUPABASE_SERVICE_KEY || env.VITE_SUPABASE_SERVICE_KEY

if (!SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_KEY not found in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

async function setupDemoAccount() {
  console.log('🎯 Configuration complète du compte démo...\n')

  try {
    // 1. Chercher ou créer l'utilisateur
    console.log('👤 Récupération de l\'utilisateur demo@hazumi.org...')
    const { data: { users } } = await supabase.auth.admin.listUsers()
    let userId = users.find(u => u.email === 'demo@hazumi.org')?.id

    if (!userId) {
      console.log('  → Utilisateur n\'existe pas, création...')
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: 'demo@hazumi.org',
        password: 'demo1234',
        email_confirm: true,
      })

      if (authError) {
        console.error('❌ Erreur création user:', authError.message)
        process.exit(1)
      }

      userId = authUser?.user?.id
      if (!userId) {
        console.error('❌ User créé sans ID')
        process.exit(1)
      }
    }

    console.log(`✅ User trouvé/créé: ${userId}\n`)
    await setupWithUserId(userId)

  } catch (error) {
    console.error('❌ Erreur:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

async function setupWithUserId(userId: string) {
  try {
    // 2. Créer le club
    console.log('🏢 Création du club démo...')
    const { data: club, error: clubError } = await supabase
      .from('clubs')
      .insert({
        nom: 'Club Demo',
        plan: 'pro',
        logo_url: null,
      })
      .select()
      .single()

    if (clubError) {
      console.error('❌ Erreur création club:', clubError.message)
      process.exit(1)
    }

    const clubId = club.id
    console.log(`✅ Club créé: ${clubId}\n`)

    // 3. Créer ou mettre à jour l'entrée judoka pour l'utilisateur (dirigeant)
    console.log('👤 Configuration du profil judoka (dirigeant)...')

    // D'abord, chercher si un judoka existe déjà
    const { data: existingJudoka } = await supabase
      .from('judokas')
      .select('id')
      .eq('user_id', userId)
      .single()

    let judoka
    if (existingJudoka?.id) {
      // Mettre à jour le judoka existant
      const { data, error: judokaError } = await supabase
        .from('judokas')
        .update({
          full_name: 'Dirigeant Demo',
          role: 'responsable',
          club_id: clubId,
          belt: 'noire',
          cotisation_paid: true,
          email: null,
          phone: null,
          birth_date: null,
          license_number: null,
          license_expiry: null,
          emergency_contact: null,
          cert_medical_ok: false,
        })
        .eq('id', existingJudoka.id)
        .select()
        .single()

      if (judokaError) {
        console.error('❌ Erreur mise à jour judoka:', judokaError.message)
        process.exit(1)
      }
      judoka = data
      console.log('  → Profil mis à jour')
    } else {
      // Créer un nouveau judoka
      const { data, error: judokaError } = await supabase
        .from('judokas')
        .insert({
          user_id: userId,
          full_name: 'Dirigeant Demo',
          role: 'responsable',
          club_id: clubId,
          belt: 'noire',
          cotisation_paid: true,
          email: null,
          phone: null,
          birth_date: null,
          license_number: null,
          license_expiry: null,
          emergency_contact: null,
          cert_medical_ok: false,
        })
        .select()
        .single()

      if (judokaError) {
        console.error('❌ Erreur création judoka:', judokaError.message)
        process.exit(1)
      }
      judoka = data
      console.log('  → Profil créé')
    }

    console.log(`✅ Profil judoka créé\n`)

    // 4. Afficher le résumé
    console.log('=' .repeat(50))
    console.log('✨ COMPTE DÉMO CONFIGURÉ ✨')
    console.log('=' .repeat(50))
    console.log(`📧 Email:        demo@hazumi.org`)
    console.log(`🔑 Mot de passe: demo1234`)
    console.log(`🏢 Club:         ${club.name} (ID: ${clubId})`)
    console.log(`👤 Rôle:         responsable (dirigeant)`)
    console.log(`💎 Plan:         PRO (débloqué)`)
    console.log('=' .repeat(50))
    console.log('✅ Prêt pour ajouter les élèves!\n')

  } catch (error) {
    console.error('❌ Erreur:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

setupDemoAccount()
