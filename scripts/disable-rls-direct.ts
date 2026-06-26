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

async function disableRLS() {
  console.log('🔓 Désactivation des RLS policies via SQL...\n')

  try {
    // Exécuter le SQL pour vérifier et désactiver les RLS policies
    const { data, error } = await supabase.rpc('exec_sql_sync', {
      sql: `
        -- Vérifier le statut
        SELECT schemaname, tablename, rowsecurity
        FROM pg_tables
        WHERE tablename IN ('judokas', 'clubs');
      `
    }).catch(() => null)

    if (data) {
      console.log('Statut des RLS policies:')
      console.log(data)
    }

    // Désactiver RLS
    console.log('\n📝 Désactivation des RLS policies...')

    const disableResult = await supabase.rpc('exec_sql_sync', {
      sql: `
        ALTER TABLE public.judokas DISABLE ROW LEVEL SECURITY;
        ALTER TABLE public.clubs DISABLE ROW LEVEL SECURITY;
      `
    }).catch((err) => {
      console.log('RPC exec_sql_sync non disponible, essai d\'une autre approche...')
      return null
    })

    if (disableResult) {
      console.log('✅ RLS policies désactivées via RPC')
      return
    }

    // Alternative: vérifier directement via une requête
    console.log('\n🔍 Vérification via requête directe...')
    const testResult = await supabase
      .from('judokas')
      .select('count', { count: 'exact', head: true })

    if (testResult.error?.message?.includes('row level security')) {
      console.log('❌ RLS policies sont TOUJOURS ACTIVES')
      console.log('   Le SQL dans Supabase n\'a pas été exécuté')
      console.log('\n📌 Tu DOIS aller dans Supabase Dashboard et désactiver manuellement')
    } else {
      console.log('✅ RLS policies semblent désactivées!')
    }

  } catch (error) {
    console.error('❌ Erreur:', error instanceof Error ? error.message : error)
  }
}

disableRLS()
