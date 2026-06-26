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

const students = [
  { name: 'Alice Dubois', ceinture: 'blanche' },
  { name: 'Baptiste Martin', ceinture: 'orange' },
  { name: 'Clara Lefebvre', ceinture: 'jaune' },
  { name: 'David Leclerc', ceinture: 'verte' },
  { name: 'Emma Moreau', ceinture: 'bleue' }
]

async function addStudents() {
  console.log('📚 Ajout des élèves de démo...\n')

  try {
    // 1. Get demo club
    const { data: { users } } = await supabase.auth.admin.listUsers()
    const demoUser = users.find(u => u.email === 'demo@hazumi.org')

    if (!demoUser) {
      console.error('❌ demo@hazumi.org pas trouvé')
      return
    }

    const { data: demoJudoka } = await supabase
      .from('judokas')
      .select('club_id')
      .eq('user_id', demoUser.id)
      .single()

    if (!demoJudoka?.club_id) {
      console.error('❌ Club démo pas trouvé')
      return
    }

    const clubId = demoJudoka.club_id
    console.log('✅ Club démo trouvé:', clubId)

    // 2. Add students
    for (const student of students) {
      const { data, error } = await supabase
        .from('judokas')
        .insert({
          full_name: student.name,
          club_id: clubId,
          role: 'judoka',
          belt: student.ceinture
        })
        .select()

      if (error) {
        console.error(`❌ ${student.name}: ${error.message}`)
      } else {
        console.log(`✅ ${student.name} (${student.ceinture}) ajouté`)
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log('✨ ÉLÈVES AJOUTÉS AVEC SUCCÈS ✨')
    console.log('='.repeat(50))

  } catch (error) {
    console.error('❌ Erreur:', error instanceof Error ? error.message : error)
  }
}

addStudents()
