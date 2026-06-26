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

// Utiliser l'ANON_KEY pour tester si RLS bloque
const supabase = createClient(SUPABASE_URL, ANON_KEY)

async function testRLS() {
  console.log('🧪 Test du statut des RLS policies...\n')

  try {
    const { data, error } = await supabase
      .from('judokas')
      .select('id, role')
      .limit(1)

    if (error) {
      if (error.message.includes('row level security') || error.message.includes('RLS')) {
        console.log('❌ RLS POLICIES BLOQUENT TOUJOURS!')
        console.log('   Message:', error.message)
        console.log('\n📌 Les RLS policies n\'ont PAS été désactivées')
        console.log('   Il faut aller manuellement dans Supabase Dashboard')
      } else {
        console.log('❌ Erreur:', error.message)
      }
    } else {
      console.log('✅ RLS POLICIES DÉSACTIVÉES!')
      console.log('   Données chargées:', data?.length ?? 0, 'enregistrement(s)')
      console.log('\n📌 Rafraîchis la page et tu devrais voir les 2 espaces!')
    }

  } catch (error) {
    console.error('❌ Erreur:', error instanceof Error ? error.message : error)
  }
}

testRLS()
