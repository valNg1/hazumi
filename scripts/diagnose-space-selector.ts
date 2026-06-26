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
const ANON_KEY = env.VITE_SUPABASE_ANON_KEY!

// Use ANON_KEY like the frontend does
const supabase = createClient(SUPABASE_URL, ANON_KEY)

async function diagnose() {
  console.log('🔍 Diagnostic SpaceSelector pour demo@hazumi.org\n')

  try {
    // 1. Sign in as demo
    console.log('📝 Tentative de connexion en tant que demo@hazumi.org...')
    const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
      email: 'demo@hazumi.org',
      password: 'demo1234'
    })

    if (authError || !user) {
      console.error('❌ Erreur de connexion:', authError?.message)
      return
    }

    console.log('✅ Connecté en tant que:', user.email)
    console.log('   User ID:', user.id)

    // 2. Try to fetch judoka data like SpaceSelector does
    const { data, error } = await supabase
      .from('judokas')
      .select('full_name, photo_url, role, club_id')
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('❌ Erreur lors du fetch judoka:', error.message)
      console.log('   Code:', error.code)
      console.log('   Status:', error.status)
      console.log('\n⚠️  SpaceSelector would show: Only Espace Élève (role stays null)')
      return
    }

    if (!data) {
      console.error('❌ Pas de judoka trouvé pour cet utilisateur')
      console.log('   Data:', data)
      return
    }

    console.log('✅ Judoka data loaded:')
    console.log('   Role:', data.role)
    console.log('   Club ID:', data.club_id)
    console.log('   Name:', data.full_name)

    // 3. Check the SpaceSelector logic
    const showClubSpace = data.role !== 'judoka' || false // isBen is false for regular demo

    console.log('\n📋 SpaceSelector Logic:')
    console.log('   role !== "judoka":', data.role !== 'judoka')
    console.log('   isBen:', false)
    console.log('   Should show Club space:', showClubSpace)

    if (showClubSpace) {
      console.log('\n✅ ESPACE CLUB DEVRAIT S\'AFFICHER!')
    } else {
      console.log('\n❌ ESPACE CLUB NE S\'AFFICHERA PAS!')
    }

  } catch (error) {
    console.error('❌ Erreur:', error instanceof Error ? error.message : error)
  }
}

diagnose()
