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

async function check() {
  try {
    console.log('🔍 Recherche de tous les utilisateurs avec leurs rôles...\n')

    const { data: { users } } = await supabase.auth.admin.listUsers()

    for (const user of users) {
      const { data: judoka } = await supabase
        .from('judokas')
        .select('full_name, role, club_id')
        .eq('user_id', user.id)
        .single()

      console.log(`👤 ${user.email}`)
      console.log(`   Rôle: ${judoka?.role ?? '(aucun judoka)'}`)
      console.log(`   Club: ${judoka?.club_id ?? '(aucun)'}`)
      console.log('')
    }

  } catch (error) {
    console.error('❌ Erreur:', error instanceof Error ? error.message : error)
  }
}

check()
