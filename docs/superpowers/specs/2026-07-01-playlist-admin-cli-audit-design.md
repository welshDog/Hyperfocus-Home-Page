# Playlist Admin + CLI Audit Design

Date: 2026-07-01
Repo: `Hyperfocus-Home-Page`
Status: Proposed for review
Owner flow: Admin-first metadata editing with CLI audit guardrail

## Purpose

Add a small admin surface for managing homepage playlist tracks without changing the existing public footer player contract, then add a CLI audit tool that catches Storage/DB drift before it breaks playback again.

This follows the current repo guardrails:

- polish, not rewrite
- reuse existing admin dashboard patterns
- keep scope tight
- keep human editing simple
- use automation as a guardrail, not as silent authority

## Problem

The footer playlist player is now live and working, but the first real bug showed a fragile seam:

- `playlist_tracks.audio_path` is editorially managed in the database
- the real file truth lives in Supabase Storage bucket `music`
- when those drift apart, playback fails even if the UI still renders

The repo now needs a safe way to:

1. edit playlist metadata from Mission Control
2. see whether a track's referenced file really exists
3. audit mismatch risk from the command line before deploys or content changes

## Goals

- Add `/admin/tracks` to Mission Control
- Make `playlist_tracks` the source of truth for metadata
- Make Supabase Storage bucket `music` the source of truth for actual files
- Expose a `storage_exists` status in admin without changing the public player
- Add a CLI audit command that reports mismatches and can print safe SQL suggestions

## Non-Goals

- No upload UI in V1
- No cover art management in V1
- No drag-and-drop reordering in V1
- No automatic DB writes from the CLI in V1
- No footer player redesign
- No Storage-first inference model

## Source Of Truth

- `public.playlist_tracks`: metadata truth
  - `title`
  - `artist`
  - `audio_path`
  - `sort_order`
  - `is_published`
- `storage.objects` for bucket `music`: file existence truth
- CLI audit script: validation and optional repair suggestion layer only
- Footer player: keeps reading published rows from `playlist_tracks`

This keeps editorial choices in app data and keeps file integrity tied to the actual bucket contents.

## Existing Patterns To Reuse

The repo already has a clear admin pattern:

- dashboard pages under `app/(admin)/admin/(dashboard)/...`
- server actions in `app/(admin)/admin/(dashboard)/actions.ts`
- admin tables rendered in page components
- Mission Control navigation in `components/admin/Sidebar.tsx`

The new playlist admin flow should fit into that structure rather than creating a parallel mini-system.

## V1 Scope

### Admin Page

Add a new route:

- `/admin/tracks`

Page responsibilities:

- read all playlist rows from `playlist_tracks`
- compute `storage_exists` for each row by comparing `audio_path` against `storage.objects.name` in bucket `music`
- render a compact admin table
- support editing the following fields:
  - `title`
  - `artist`
  - `audio_path`
  - `sort_order`
  - `is_published`

### CLI Audit

Add one CLI script:

- `node scripts/audit-playlist-paths.mjs`

Script responsibilities:

- load playlist rows from `playlist_tracks`
- load object names from bucket `music`
- report:
  - matched tracks
  - missing file references
  - unused files in Storage
- optionally print safe SQL suggestions

The CLI does not auto-write by default.

## Admin UX

### Table Columns

- Title
- Artist
- Audio path
- Sort order
- Published
- Storage status
- Actions

### Storage Status Badge

- `OK` when `audio_path` exists in bucket `music`
- `Missing` when no object matches the row's `audio_path`

This badge is informational and should be visually secondary but easy to scan.

### Editing Mode

V1 should stay simple:

- row edit or small inline form
- save/cancel controls
- publish toggle
- no uploader
- no auto-fix button in the UI

### Empty State

If no playlist rows exist yet, use a kind, practical message, for example:

`No tracks added yet. Add a few here, then publish the ones you want in the footer player.`

Avoid cold system copy like `No rows found.`

## Data Flow

### Public Player

The public footer player remains unchanged:

1. read published rows from `playlist_tracks`
2. build track URLs from bucket `music`
3. fail gracefully if no tracks are published

### Admin Page

1. admin page reads all tracks from `playlist_tracks`
2. admin page reads object names from bucket `music`
3. admin page computes `storage_exists`
4. admin saves metadata through server actions
5. save action revalidates `/admin/tracks`
6. save action revalidates the public homepage/footer path as needed

### CLI Audit

1. fetch tracks from `playlist_tracks`
2. fetch object names from bucket `music`
3. compare exact path matches
4. print grouped report
5. optionally print ready-to-paste SQL suggestions

## Files

### New Files

- `app/(admin)/admin/(dashboard)/tracks/page.tsx`
- `components/admin/TrackTable.tsx`
- `components/admin/TrackForm.tsx`
- `lib/tracks.ts`
- `scripts/audit-playlist-paths.mjs`

### Existing Files To Extend

- `app/(admin)/admin/(dashboard)/actions.ts`
- `components/admin/Sidebar.tsx`
- `types/index.ts`

## Server Actions

Extend `app/(admin)/admin/(dashboard)/actions.ts` with track-focused actions:

- `saveTrack`
- `toggleTrackPublished`

Validation rules:

- `title` required
- `artist` required
- `audio_path` required
- `sort_order` must be a non-negative number
- no Storage mutation in V1

On success:

- revalidate `/admin/tracks`
- revalidate the public page(s) where the footer player appears

On failure:

- return short, human, ND-friendly errors

## Types

Add a shared type for admin and helper code, likely in `types/index.ts`:

- `PlaylistTrack`

Recommended shape:

- `id`
- `title`
- `artist`
- `audio_path`
- `duration_seconds`
- `sort_order`
- `is_published`
- `created_at`

Admin read helpers can extend this with:

- `storage_exists: boolean`

## CLI Command Shape

### Base Command

```bash
node scripts/audit-playlist-paths.mjs
```

### Output Sections

- `Matched`
- `Missing in storage`
- `Unused in storage`

### Optional Flag

```bash
node scripts/audit-playlist-paths.mjs --sql
```

When `--sql` is passed, print suggested `UPDATE` statements only. Do not apply them.

## Testing

### Admin Page

- loads rows correctly
- shows `OK` badge for matching file
- shows `Missing` badge for mismatching file
- saves edited metadata correctly
- publish toggle updates row correctly

### CLI Audit

- reports all matched rows
- reports missing rows
- reports unused bucket files
- prints safe SQL suggestions without executing them

### Player Safety

- published valid rows still play in the footer
- invalid paths do not crash the UI
- empty state remains friendly

## Accessibility And UX Guardrails

- keep admin controls keyboard reachable
- keep action buttons readable and large enough to use comfortably
- keep labels plain and direct
- avoid noisy warnings or aggressive red UI unless data is actually broken
- show file mismatch clearly, but do not block editing

## Rollout Order

1. add typed playlist helpers
2. add `/admin/tracks` read-only list with `storage_exists`
3. add edit and publish actions
4. add CLI audit script
5. add optional SQL suggestion output

## Done Means Done

- admin can view and edit playlist track metadata from `/admin/tracks`
- admin can see whether a referenced file exists in bucket `music`
- public footer player still works with published rows
- CLI audit reports mismatches clearly
- CLI does not auto-write unless a future explicitly approved scope adds that behavior

## Future Nice-To-Haves

These are intentionally out of scope for V1:

- uploader inside `/admin/tracks`
- cover art support
- import-from-storage helper
- keyboard shortcut for play/pause on the public player
- pre-deploy audit hook that runs automatically in CI

## Recommendation

Ship V1 as:

- admin-first metadata editing
- Storage-backed file truth
- CLI audit guardrail

That gives the repo a simple day-to-day workflow, keeps humans in control of editorial choices, and prevents the exact drift bug that already surfaced once.
