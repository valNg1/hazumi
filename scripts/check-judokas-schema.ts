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

async function checkSchema() {
  console.log('🔍 Colonnes de la table judokas:\n')

  try {
    // Get one judoka to see what columns exist
    const { data, error } = await supabase
      .from('judokas')
      .select('*')
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Erreur:', error.message)
      return
    }

    if (data) {
      const columns = Object.keys(data)
      console.log('Colonnes trouvées:')
      columns.forEach(col => {
        const value = data[col as keyof typeof data]
        console.log(`  - ${col}: ${typeof value} (${value === null ? 'null' : 'present'})`)
      })
    } else {
      console.log('Pas d\'enregistrement trouvé, essai d\'une requête vide...')
      const { data: emptyData } = await supabase
        .from('judokas')
        .select('*')
        .limit(0)

      if (emptyData) {
        console.log('Table vide mais colonnes disponibles')
      }
    }

  } catch (error) {
    console.error('Erreur:', error instanceof Error ? error.message : error)
  }
}

checkSchema()
