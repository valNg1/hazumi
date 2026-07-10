import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const envContent = readFileSync('.env.local', 'utf-8')
const env: Record<string, string> = {}
envContent.split('\n').forEach((line) => {
  const idx = line.indexOf('=')
  if (idx > 0) env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
})

const supabase = createClient(env.VITE_SUPABASE_URL!, env.SUPABASE_SERVICE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false },
})

function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let field = ''
  let row: string[] = []
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
    } else {
      if (c === '"') {
        inQuotes = true
      } else if (c === ',') {
        row.push(field)
        field = ''
      } else if (c === '\r') {
        // ignore
      } else if (c === '\n') {
        row.push(field)
        rows.push(row)
        row = []
        field = ''
      } else {
        field += c
      }
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((r) => r.some((c) => c.trim().length > 0))
}

async function main() {
  const csvPath = '../Hazumi_Referentiel_Technique_1er_Dan.csv'
  const raw = readFileSync(csvPath, 'utf-8')
  const rows = parseCsv(raw)
  const header = rows[0]
  const dataRows = rows.slice(1)

  const idx = (name: string) => header.indexOf(name)
  const iTitre = idx('titre')
  const iType = idx('type')
  const iGrade = idx('grade')
  const iFamille = idx('famille')
  const iParcours = idx('parcours')
  const iDescription = idx('description')
  const iMotsCles = idx('mots_cles')
  const iVideoUrl = idx('video_url')

  const records = dataRows.map((r) => {
    const tags = r[iMotsCles]
      .split(';')
      .map((t) => t.trim())
      .filter(Boolean)
    const url = r[iVideoUrl]?.trim() || null
    return {
      titre: r[iTitre].trim(),
      type: r[iType].trim(),
      parcours: r[iParcours].trim().toLowerCase(),
      grade: r[iGrade].trim() || null,
      famille: r[iFamille].trim() || null,
      contenu: r[iDescription].trim(),
      tags,
      url,
    }
  })

  console.log(`Parsed ${records.length} records.`)
  console.log('Sample:', JSON.stringify(records[0], null, 2))

  const before = await supabase
    .from('catalogue_hazumi')
    .select('*', { count: 'exact', head: true })
  console.log(`catalogue_hazumi rows before: ${before.count}`)

  const { data, error } = await supabase
    .from('catalogue_hazumi')
    .insert(records)
    .select('id, titre, parcours, tags, grade, famille')

  if (error) {
    console.error('INSERT ERROR:', error)
    process.exit(1)
  }
  console.log(`Inserted ${data?.length} rows.`)

  const after = await supabase
    .from('catalogue_hazumi')
    .select('*', { count: 'exact', head: true })
  console.log(`catalogue_hazumi rows after: ${after.count}`)

  const check = await supabase
    .from('catalogue_hazumi')
    .select('titre, parcours, tags, grade, famille, contenu')
    .eq('titre', 'Harai-goshi')
    .single()
  console.log('Verify Harai-goshi:', JSON.stringify(check.data, null, 2))
}

main()
