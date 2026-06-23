// One-off: create (or ensure) a temporary admin auth user for previewing
// Mission Control. Reads creds from .env.local. Delete the user after.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const env = Object.fromEntries(
  readFileSync(join(import.meta.dirname, '..', '.env.local'), 'utf8')
    .split('\n')
    .filter((l) => l.includes('='))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    }),
)

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
)

const email = process.argv[2] || 'admin@welshdog.test'
const password = process.argv[3] || 'BroskiPreview!2026'

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
})

if (error && !/already/i.test(error.message)) {
  console.error('ERROR:', error.message)
  process.exit(1)
}
console.log(JSON.stringify({ email, id: data?.user?.id ?? '(exists)', ok: true }))
