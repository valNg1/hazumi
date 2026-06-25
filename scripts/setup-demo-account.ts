import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Charger les variables d'environnement depuis .env.local
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
const DEMO_PASSWORD = 'R1N$8oX2U8jS'
const USER_ID = process.argv[2] // Accepte l'ID utilisateur en paramètre

let supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function setupDemoAccount() {
  console.log('🔧 Création du compte de démonstration...\n')

  try {
    let userId: string

    if (USER_ID) {
      userId = USER_ID
      console.log(`📧 Utilisation de l'utilisateur fourni: ${userId}\n`)
    } else {
      // Créer l'utilisateur
      console.log(`📧 Création de l'utilisateur ${DEMO_EMAIL}...`)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
        options: {
          data: {
            full_name: 'Prospect Demo',
            is_demo: true
          }
        }
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log('⚠️  Utilisateur déjà existant')
          console.log('Relancez le script avec l\'ID utilisateur:')
          console.log('   npx tsx scripts/setup-demo-account.ts f47e1527-eaa2-42ec-99c5-5d018bde2877\n')
          process.exit(0)
        }
        throw new Error(`Auth error: ${authError.message}`)
      }
      if (!authData.user) throw new Error('User creation failed')

      userId = authData.user.id
      console.log(`✅ Utilisateur créé: ${userId}\n`)
    }

    // 1b. S'authentifier avec l'utilisateur pour avoir les bonnes permissions RLS
    console.log('🔐 Authentification...')
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD
    })
    if (signInError) {
      console.warn('⚠️ Impossible de s\'authentifier, tentative de création du club sans auth...')
    } else {
      console.log('✅ Authentification réussie\n')
    }

    // 2. Créer le club de démo
    console.log('🏢 Création du club de démo...')
    const { data: clubData, error: clubError } = await supabase
      .from('clubs')
      .insert({
        nom: 'Club de Démonstration Hazumi',
        adresse: 'Paris, France',
        email_contact: 'demo@hazumi.org',
        nom_representant: 'Responsable Demo'
      })
      .select()
      .single()

    if (clubError) throw new Error(`Club error: ${clubError.message}`)
    if (!clubData) throw new Error('Club creation failed')

    const clubId = clubData.id
    console.log(`✅ Club créé: ${clubId}\n`)

    // 3. Créer les judokas fictifs
    console.log('🥋 Création des judokas de démo...')
    const judokas = [
      { name: 'Responsable Demo (Admin)', belt: 'blanche', birth_date: '1980-01-01', withUser: true },
      { name: 'Alice Dubois', belt: 'blanche', birth_date: '2017-03-15', withUser: false },
      { name: 'Baptiste Martin', belt: 'orange', birth_date: '2015-07-22', withUser: false },
      { name: 'Clara Lefebvre', belt: 'jaune', birth_date: '2013-11-08', withUser: false },
      { name: 'David Leclerc', belt: 'verte', birth_date: '2011-05-30', withUser: false },
      { name: 'Emma Moreau', belt: 'bleue', birth_date: '2009-09-12', withUser: false },
    ]

    const judokasData = judokas.map((j, i) => ({
      club_id: clubId,
      full_name: j.name,
      belt: j.belt,
      birth_date: j.birth_date,
      license_number: `DEMO${String(i + 1).padStart(5, '0')}`,
      license_expiry: '2025-12-31',
      email: `${j.name.toLowerCase().replace(/ /g, '.')}@demo-hazumi.fr`,
      phone: '+33612345678',
      emergency_contact: 'Parent/Responsable',
      cotisation_paid: false,
      cert_medical_ok: true,
      role: j.withUser ? 'responsable' : 'judoka',
      ...(j.withUser && { user_id: userId })
    }))

    let judokasCount = 0
    for (const judokaData of judokasData) {
      const { error: judokaError } = await supabase
        .from('judokas')
        .insert(judokaData)

      if (judokaError) {
        console.warn(`⚠️ Judoka "${judokaData.full_name}" non créé: ${judokaError.message}`)
      } else {
        judokasCount++
      }
    }
    console.log(`✅ ${judokasCount}/${judokasData.length} judokas créés\n`)

    // 5. Afficher les informations de connexion
    console.log('=' .repeat(50))
    console.log('✨ COMPTE DE DÉMONSTRATION CRÉÉ ✨')
    console.log('=' .repeat(50))
    console.log(`📧 Email:         ${DEMO_EMAIL}`)
    console.log(`🔑 Mot de passe:  ${DEMO_PASSWORD}`)
    console.log(`🆔 User ID:       ${userId}`)
    console.log(`🏢 Club ID:       ${clubId}`)
    console.log(`👥 Judokas:       ${judokasCount}/6 créés`)
    console.log('=' .repeat(50))
    console.log('\n🎯 URL de connexion: https://hazumi.org/login\n')
    if (judokasCount < judokasData.length) {
      console.log('ℹ️ Note: Certains judokas n\'ont pas pu être créés du fait des permissions RLS.')
      console.log('   Vous pouvez les ajouter manuellement via l\'interface "Effectifs" une fois connecté.\n')
    }

  } catch (error) {
    console.error('❌ Erreur:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

setupDemoAccount()
