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
  admin: { email: `msg-admin-${stamp}@test.fr`, userId: '', judokaId: '' },
  a: { email: `msg-a-${stamp}@test.fr`, userId: '', judokaId: '' },
  b: { email: `msg-b-${stamp}@test.fr`, userId: '', judokaId: '' },
}

let admin: SupabaseClient

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
      full_name: `Msg ${role} ${stamp}`,
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

describe.skipIf(!hasCreds)('RLS table messages (judoka ↔ admin)', () => {
  beforeAll(async () => {
    admin = createClient(SUPABASE_URL!, SERVICE_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    await createUser('admin', users.admin)
    await createUser('judoka', users.a)
    await createUser('judoka', users.b)

    // Un message initial pour chaque judoka (inséré via service key)
    await admin.from('messages').insert([
      { judoka_id: users.a.judokaId, sender: 'judoka', content: 'Bonjour de A' },
      { judoka_id: users.b.judokaId, sender: 'judoka', content: 'Bonjour de B' },
    ])
  }, 60000)

  afterAll(async () => {
    if (!admin) return
    for (const slot of [users.a, users.b, users.admin]) {
      if (slot.judokaId) await admin.from('messages').delete().eq('judoka_id', slot.judokaId)
      if (slot.userId) {
        await admin.from('judokas').delete().eq('user_id', slot.userId)
        await admin.auth.admin.deleteUser(slot.userId)
      }
    }
  }, 60000)

  it('un judoka peut insérer un message avec son judoka_id', async () => {
    const client = await signIn(users.a.email)
    const { data, error } = await client
      .from('messages')
      .insert({ judoka_id: users.a.judokaId, sender: 'judoka', content: 'Message de test A' })
      .select()
      .single()
    expect(error).toBeNull()
    expect(data?.judoka_id).toBe(users.a.judokaId)
  }, 30000)

  it("un judoka ne peut pas lire les messages d'un autre judoka", async () => {
    const client = await signIn(users.a.email)
    const { data, error } = await client
      .from('messages')
      .select('*')
      .eq('judoka_id', users.b.judokaId)
    expect(error).toBeNull()
    expect(data ?? []).toHaveLength(0)
  }, 30000)

  it('l\'admin peut lire tous les messages (A et B)', async () => {
    const client = await signIn(users.admin.email)
    const { data, error } = await client
      .from('messages')
      .select('judoka_id')
      .in('judoka_id', [users.a.judokaId, users.b.judokaId])
    expect(error).toBeNull()
    const seen = new Set((data ?? []).map((m) => m.judoka_id))
    expect(seen.has(users.a.judokaId)).toBe(true)
    expect(seen.has(users.b.judokaId)).toBe(true)
  }, 30000)

  it('un message sans contenu (content null) est rejeté', async () => {
    const client = await signIn(users.a.email)
    const { error } = await client
      .from('messages')
      // @ts-expect-error content null volontaire pour tester la contrainte NOT NULL
      .insert({ judoka_id: users.a.judokaId, sender: 'judoka', content: null })
      .select()
      .single()
    expect(error).not.toBeNull()
  }, 30000)
})
