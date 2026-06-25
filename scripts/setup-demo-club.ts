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

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function setupClub() {
  console.log('🏢 Configuration de l\'espace club...\n')

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

    // Récupérer le club
    console.log('🔍 Récupération du club démo...')
    const { data: judoka } = await supabase
      .from('judokas')
      .select('club_id')
      .eq('full_name', 'Responsable Demo (Admin)')
      .single()

    if (!judoka?.club_id) {
      console.error('❌ Club non trouvé')
      process.exit(1)
    }

    const clubId = judoka.club_id
    console.log(`✅ Club trouvé: ${clubId}\n`)

    // 1. Créer les élèves fictifs
    console.log('👥 Création des élèves fictifs...')
    const eleves = [
      { name: 'Alice Dubois', belt: 'blanche', birth_date: '2017-03-15' },
      { name: 'Baptiste Martin', belt: 'orange', birth_date: '2015-07-22' },
      { name: 'Clara Lefebvre', belt: 'jaune', birth_date: '2013-11-08' },
      { name: 'David Leclerc', belt: 'verte', birth_date: '2011-05-30' },
      { name: 'Emma Moreau', belt: 'bleue', birth_date: '2009-09-12' },
    ]

    let createdCount = 0
    for (const eleve of eleves) {
      const { error } = await supabase
        .from('judokas')
        .insert({
          club_id: clubId,
          full_name: eleve.name,
          belt: eleve.belt,
          birth_date: eleve.birth_date,
          role: 'judoka',
          email: `${eleve.name.toLowerCase().replace(/ /g, '.')}@demo.fr`,
          cotisation_paid: true, // Pro débloqué pour la démo
        })

      if (error) {
        console.warn(`⚠️ ${eleve.name}: ${error.message}`)
      } else {
        createdCount++
      }
    }
    console.log(`✅ ${createdCount}/${eleves.length} élèves créés\n`)

    // 2. Débloquer le plan pro du club
    console.log('💎 Déblocage du plan Pro du club...')
    const { error: planError } = await supabase
      .from('clubs')
      .update({ plan: 'pro' })
      .eq('id', clubId)

    if (planError) {
      console.warn(`⚠️ Avertissement plan: ${planError.message}`)
    } else {
      console.log('✅ Plan Pro du club débloqué\n')
    }

    // Afficher le résumé
    console.log('=' .repeat(50))
    console.log('✨ ESPACE CLUB CONFIGURÉ ✨')
    console.log('=' .repeat(50))
    console.log(`✅ ${createdCount} élèves fictifs créés`)
    console.log('✅ Plan Pro du club débloqué')
    console.log('✅ Effectifs visibles et modifiables')
    console.log('=' .repeat(50))
    console.log('\n🎯 L\'espace club devrait maintenant afficher les élèves!\n')

  } catch (error) {
    console.error('❌ Erreur:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

setupClub()
