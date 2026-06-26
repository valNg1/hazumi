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

async function upgradeClub() {
  console.log('🚀 Passage du Club Demo en plan Pro...\n')

  try {
    const { data, error } = await supabase
      .from('clubs')
      .update({ plan: 'pro' })
      .eq('nom', 'Club Demo')
      .select()

    if (error) {
      console.error('❌ Erreur:', error.message)
      return
    }

    if (!data || data.length === 0) {
      console.error('❌ Club Demo non trouvé')
      return
    }

    console.log('✅ Club Demo mise à jour avec succès!')
    console.log('   ID:', data[0].id)
    console.log('   Nom:', data[0].nom)
    console.log('   Plan:', data[0].plan)
    console.log('\n✨ Le compte demo@hazumi.org ne verra plus "Passer Pro"')

  } catch (error) {
    console.error('❌ Erreur:', error instanceof Error ? error.message : error)
  }
}

upgradeClub()
