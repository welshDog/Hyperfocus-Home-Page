// Set a known password on an existing admin auth user (so Bro can log in).
// Usage: node scripts/set-admin-password.mjs <email> <password>
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

const email = process.argv[2]
const password = process.argv[3]

const { data } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 })
const user = data?.users?.find((u) => u.email === email)
if (!user) {
  console.log(JSON.stringify({ email, ok: false, reason: 'not-found' }))
  process.exit(1)
}
const { error } = await supabase.auth.admin.updateUserById(user.id, {
  password,
  email_confirm: true,
})
console.log(
  JSON.stringify({ email, id: user.id, ok: !error, error: error?.message }),
)
