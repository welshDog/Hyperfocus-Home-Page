// Playlist path audit — compares playlist_tracks.audio_path against the
// real objects in the `music` Storage bucket, so DB/Storage drift is caught
// before it breaks playback again. Report-only: never writes to the DB.
//
//   node scripts/audit-playlist-paths.mjs          # grouped report
//   node scripts/audit-playlist-paths.mjs --sql    # + suggested UPDATEs (not applied)
//
// Exits 1 when any track references a missing file, so it can gate deploys.
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

const BUCKET = 'music'
const wantSql = process.argv.includes('--sql')

async function listAllObjectPaths(prefix = '') {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list(prefix, { limit: 1000 })
  if (error) {
    console.error(`ERROR listing bucket "${BUCKET}" at "${prefix}":`, error.message)
    process.exit(1)
  }
  const paths = []
  for (const entry of data ?? []) {
    if (entry.name === '.emptyFolderPlaceholder') continue
    const full = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.id === null) {
      paths.push(...(await listAllObjectPaths(full)))
    } else {
      paths.push(full)
    }
  }
  return paths
}

const [{ data: tracks, error: dbError }, objectPaths] = await Promise.all([
  supabase
    .from('playlist_tracks')
    .select('id,title,artist,audio_path,is_published')
    .order('sort_order', { ascending: true }),
  listAllObjectPaths(),
])

if (dbError) {
  console.error('ERROR reading playlist_tracks:', dbError.message)
  process.exit(1)
}

const existing = new Set(objectPaths)
const referenced = new Set((tracks ?? []).map((t) => t.audio_path))

const matched = (tracks ?? []).filter((t) => existing.has(t.audio_path))
const missing = (tracks ?? []).filter((t) => !existing.has(t.audio_path))
const unused = objectPaths.filter((p) => !referenced.has(p))

const label = (t) =>
  `"${t.title}" — ${t.artist}${t.is_published ? '' : ' (draft)'}`

console.log(`\nPlaylist path audit — bucket "${BUCKET}"`)
console.log(`${tracks?.length ?? 0} tracks in DB, ${objectPaths.length} files in storage\n`)

console.log(`Matched (${matched.length})`)
for (const t of matched) console.log(`  OK       ${t.audio_path}  <- ${label(t)}`)

console.log(`\nMissing in storage (${missing.length})`)
if (missing.length === 0) console.log('  none — every track points at a real file')
for (const t of missing) console.log(`  MISSING  ${t.audio_path}  <- ${label(t)}`)

console.log(`\nUnused in storage (${unused.length})`)
if (unused.length === 0) console.log('  none — every file is referenced by a track')
for (const p of unused) console.log(`  UNUSED   ${p}`)

if (wantSql && missing.length > 0) {
  console.log('\nSuggested SQL (NOT applied — review, then run yourself):')
  const basename = (p) => p.split('/').pop()
  for (const t of missing) {
    // Only suggest when exactly one unused file shares the same file name —
    // anything fuzzier risks pointing a track at the wrong audio.
    const candidates = unused.filter((p) => basename(p) === basename(t.audio_path))
    if (candidates.length === 1) {
      console.log(
        `  UPDATE playlist_tracks SET audio_path = '${candidates[0]}' WHERE id = '${t.id}'; -- ${label(t)}`,
      )
    } else {
      console.log(
        `  -- no safe suggestion for ${label(t)} (${candidates.length} candidates share the file name)`,
      )
    }
  }
}

if (missing.length > 0) {
  console.log(
    `\nResult: ${missing.length} track(s) point at files that don't exist — playback for those will fail.`,
  )
  process.exit(1)
}
console.log('\nResult: all track paths resolve to real files. Lovely.')
