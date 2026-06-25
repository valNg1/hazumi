import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'

const envPath = path.join(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const env: Record<string, string> = {}
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=')
  if (key && value) env[key.trim()] = value.trim()
})

const SUPABASE_URL = env.VITE_SUPABASE_URL!
const SERVICE_KEY = env.SUPABASE_SERVICE_KEY!

if (!SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_KEY not found')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
})

async function disableRLS() {
  console.log('🔓 Désactivation des RLS policies...\n')

  try {
    // La meilleure approche: utiliser une fonction SQL personnalisée
    console.log('📌 Note: Les RLS policies doivent être désactivées via Supabase Dashboard')
    console.log('   Allez à: SQL Editor → Execute')
    console.log('   Exécutez:\n')

    const sqlCommands = `
-- Désactiver RLS sur judokas
ALTER TABLE public.judokas DISABLE ROW LEVEL SECURITY;

-- Désactiver RLS sur clubs
ALTER TABLE public.clubs DISABLE ROW LEVEL SECURITY;

-- Vérifier le statut
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname='public' AND tablename IN ('judokas', 'clubs');
    `.trim()

    console.log(sqlCommands)
    console.log('\n')
    console.log('Après avoir exécuté ces commandes, la démo fonctionnera!')

  } catch (error) {
    console.error('❌ Erreur:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

disableRLS()
