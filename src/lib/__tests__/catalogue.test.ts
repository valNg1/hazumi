import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { readFileSync } from 'node:fs'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

function readEnv(key: string): string | null {
  try {
    const env = readFileSync('.env.local', 'utf8')
    const m = env.match(new RegExp('^' + key + '=(.*)$', 'm'))
    return m ? m[1].trim().replace(/[\r"']/g, '') : null
  } catch {
    return null
  }
}

const SUPABASE_URL = readEnv('VITE_SUPABASE_URL')
const ANON_KEY = readEnv('VITE_SUPABASE_ANON_KEY')
const SERVICE_KEY = readEnv('SUPABASE_SERVICE_KEY')

const hasCreds = Boolean(SUPABASE_URL && ANON_KEY && SERVICE_KEY)

const PASSWORD = 'TestPassword123!'
const stamp = Date.now()

const users = {
  admin: { email: `cat-admin-${stamp}@test.fr`, userId: '', judokaId: '' },
  judoka: { email: `cat-judoka-${stamp}@test.fr`, userId: '', judokaId: '' },
}

let admin: SupabaseClient
const createdIds: string[] = []

async function createUser(
  role: 'admin' | 'judoka',
  slot: { email: string; userId: string; judokaId: string }
) {
  const { data, error } = await admin.auth.admin.createUser({
    email: slot.email,
    password: PASSWORD,
    email_confirm: true,
  })
  if (error || !data.user) throw error ?? new Error('createUser failed')
  slot.userId = data.user.id

  const { data: j, error: jErr } = await admin
    .from('judokas')
    .insert({
      user_id: data.user.id,
      full_name: `Cat ${role} ${stamp}`,
      email: slot.email,
      birth_date: '1990-01-01',
      role,
    })
    .select()
    .single()
  if (jErr) throw jErr
  slot.judokaId = j.id
}

function anonClient(): SupabaseClient {
  return createClient(SUPABASE_URL!, ANON_KEY!)
}

async function signIn(email: string): Promise<SupabaseClient> {
  const client = anonClient()
  const { error } = await client.auth.signInWithPassword({ email, password: PASSWORD })
  if (error) throw error
  return client
}

describe.skipIf(!hasCreds)('RLS table catalogue_hazumi', () => {
  beforeAll(async () => {
    admin = createClient(SUPABASE_URL!, SERVICE_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    await createUser('admin', users.admin)
    await createUser('judoka', users.judoka)
  }, 60000)

  afterAll(async () => {
    if (!admin) return
    if (createdIds.length) await admin.from('catalogue_hazumi').delete().in('id', createdIds)
    for (const slot of [users.admin, users.judoka]) {
      if (slot.userId) {
        await admin.from('judokas').delete().eq('user_id', slot.userId)
        await admin.auth.admin.deleteUser(slot.userId)
      }
    }
  }, 60000)

  it("l'admin peut ajouter un contenu vidéo", async () => {
    const client = await signIn(users.admin.email)
    const { data, error } = await client
      .from('catalogue_hazumi')
      .insert({
        titre: 'Ippon-seoi-nage expliqué',
        type: 'video',
        parcours: 'shiai',
        url: 'https://youtube.com/watch?v=abc12345678',
        created_by: users.admin.judokaId,
      })
      .select()
      .single()
    expect(error).toBeNull()
    expect(data?.type).toBe('video')
    if (data) createdIds.push(data.id)
  }, 30000)

  it("l'admin peut ajouter un article texte", async () => {
    const client = await signIn(users.admin.email)
    const { data, error } = await client
      .from('catalogue_hazumi')
      .insert({
        titre: 'Histoire du judo-ka',
        type: 'article',
        parcours: 'judo-ka',
        contenu: 'Le judo-ka incarne les valeurs du judo...',
        created_by: users.admin.judokaId,
      })
      .select()
      .single()
    expect(error).toBeNull()
    expect(data?.type).toBe('article')
    if (data) createdIds.push(data.id)
  }, 30000)

  it("l'admin peut ajouter un PDF", async () => {
    const client = await signIn(users.admin.email)
    const { data, error } = await client
      .from('catalogue_hazumi')
      .insert({
        titre: 'Fiche technique Kyu jaune',
        type: 'pdf',
        parcours: 'kyu',
        url: 'https://example.com/fiche.pdf',
        created_by: users.admin.judokaId,
      })
      .select()
      .single()
    expect(error).toBeNull()
    expect(data?.type).toBe('pdf')
    if (data) createdIds.push(data.id)
  }, 30000)

  it('un contenu sans titre est rejeté', async () => {
    const client = await signIn(users.admin.email)
    const { error } = await client
      .from('catalogue_hazumi')
      .insert({ titre: '', type: 'article', parcours: 'kyu', contenu: 'x', created_by: users.admin.judokaId })
      .select()
      .single()
    expect(error).not.toBeNull()
  }, 30000)

  it('les contenus sont filtrables par parcours', async () => {
    const client = await signIn(users.admin.email)
    const { data, error } = await client
      .from('catalogue_hazumi')
      .select('*')
      .eq('parcours', 'shiai')
    expect(error).toBeNull()
    expect((data ?? []).every((c) => c.parcours === 'shiai')).toBe(true)
    expect((data ?? []).length).toBeGreaterThan(0)
  }, 30000)

  it('un judoka peut lire le catalogue', async () => {
    const client = await signIn(users.judoka.email)
    const { data, error } = await client.from('catalogue_hazumi').select('*')
    expect(error).toBeNull()
    expect((data ?? []).length).toBeGreaterThan(0)
  }, 30000)

  it('un judoka ne peut pas modifier le catalogue', async () => {
    const client = await signIn(users.judoka.email)
    const { error: insertError } = await client
      .from('catalogue_hazumi')
      .insert({ titre: 'Tentative judoka', type: 'article', parcours: 'kyu', contenu: 'x' })
      .select()
      .single()
    expect(insertError).not.toBeNull()

    const { data: updated, error: updateError } = await client
      .from('catalogue_hazumi')
      .update({ titre: 'Piraté' })
      .eq('id', createdIds[0])
      .select()
    expect(updateError).toBeNull()
    expect(updated ?? []).toHaveLength(0)
  }, 30000)
})
