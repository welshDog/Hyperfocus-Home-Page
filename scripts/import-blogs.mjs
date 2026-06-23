// One-off importer: re-fetch the 26 Teemill blog posts (JS-rendered),
// clean the article body, and write content/blog/<slug>.md with full
// frontmatter. The static backup only captured the JS loading wall, so
// we recover the real content from each stub's source_url before Teemill
// is shut down. Re-runnable.
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import matter from 'gray-matter'
import puppeteer from 'puppeteer-core'

const ROOT = resolve(import.meta.dirname, '..')
const SRC = join(ROOT, 'scripts', 'teemill-backup', 'blogs')
const OUT = join(ROOT, 'content', 'blog')
const CHROME =
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

// slug -> category. Categories match the /blog filter tabs.
const CATEGORY = {
  'vibe-code-from-intuition-to-ai-and-the-hyperfocus-future': 'Tech & AI',
  'inclusive-ai-coding-tools-for-neurodivergent-developers': 'Tech & AI',
  'the-best-free-ai-coding-tools-in-2025': 'Tech & AI',
  'open-a-is-new-stuff': 'Tech & AI',
  'nfts-the-next-tec-generation': 'Tech & AI',
  'https-cryptocurrencyfacts-com-how-does-cryptocurrency-work-for-beginners': 'Tech & AI',
  'lets-talk-about-crypto': 'Tech & AI',
  'the-power-of-hyperfocus': 'ADHD & Neurodiversity',
  'neurodiversity-a-celebration-of-different-minds': 'ADHD & Neurodiversity',
  'living-undiagnosed-my-journey-to-understanding-adhd-in-adulthood': 'ADHD & Neurodiversity',
  'raising-adhd-awareness-why-i-create-content-about-neurodiversity': 'ADHD & Neurodiversity',
  'welcome-to-hyperfocus-mode-unique-minds-creative-paths': 'ADHD & Neurodiversity',
  'breaking-the-myths-what-dyslexia-really-is': 'Dyslexia',
  'the-realities-of-living-with-dyslexia-and-adhd': 'Dyslexia',
  'the-importance-of-understanding-dyslexia-types': 'Dyslexia',
  'dyslexia-understanding-the-strengths-behind-the-struggles': 'Dyslexia',
  'navigating-the-minds-maze-dyslexia-unveiled-by-welsh-dog': 'Dyslexia',
  'creativity-and-the-world-of-game-design': 'Creativity',
  'finding-my-voice-through-creativity': 'Creativity',
  'family-friendship-and-mental-health': 'Personal',
  'overcoming-adversity-and-redefining-my-path': 'Personal',
  'reflections-on-life-and-society': 'Personal',
  'coping-mechanisms-and-self-discovery': 'Personal',
  'the-joy-of-learning-and-reinvention': 'Personal',
  'looking-to-the-future': 'Personal',
  'a-childhood-of-wonder-and-exploration': 'Personal',
}

const TAGS = {
  'Tech & AI': ['AI', 'tech'],
  'ADHD & Neurodiversity': ['ADHD', 'neurodiversity'],
  Dyslexia: ['dyslexia', 'neurodiversity'],
  Creativity: ['creativity'],
  Personal: ['personal', 'journey'],
}

function cleanBody(raw, title) {
  const lines = raw.split('\n').map((l) => l.trim())
  // Drop breadcrumb/nav: skip up to the last line matching the title in the head.
  let start = 0
  for (let i = 0; i < Math.min(lines.length, 8); i++) {
    if (lines[i].toLowerCase() === title.toLowerCase()) start = i + 1
  }
  let body = lines.slice(start)
  while (body.length && !body[0]) body.shift()
  // Cut Teemill site chrome / footer.
  const footer = [
    'Sharing is caring',
    'Similar Reads',
    'Share this',
    'This website uses cookies',
    'Planting Trees',
    'Your Cart',
    'Powered by Teemill',
    'Climate Positive',
    'Made from natural',
    'All rights reserved',
    'Sign up to',
    'Subscribe',
    '© ',
  ]
  let end = body.length
  for (let i = 0; i < body.length; i++) {
    if (footer.some((m) => body[i].startsWith(m))) {
      end = i
      break
    }
  }
  return body
    .slice(0, end)
    .filter(Boolean)
    .join('\n\n')
}

function makeExcerpt(body) {
  const text = body.replace(/\s+/g, ' ').trim()
  if (text.length <= 160) return text
  const cut = text.slice(0, 160)
  return cut.slice(0, cut.lastIndexOf(' ')).trim() + '…'
}

const stubs = readdirSync(SRC).filter((f) => f.endsWith('.md'))
mkdirSync(OUT, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})
const page = await browser.newPage()

const summary = []
let i = 0
for (const file of stubs) {
  i++
  const slug = file.replace(/\.md$/, '')
  const { data } = matter(readFileSync(join(SRC, file), 'utf8'))
  const title = data.title || slug
  const url = data.source_url

  let body = ''
  let published = null
  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 })
    await new Promise((r) => setTimeout(r, 2000))
    const res = await page.evaluate(() => {
      const main = document.querySelector('main') || document.body
      const meta = document.querySelector(
        'meta[property="article:published_time"]',
      )
      const time = document.querySelector('time[datetime]')
      return {
        text: main.innerText || '',
        published:
          (meta && meta.getAttribute('content')) ||
          (time && time.getAttribute('datetime')) ||
          null,
      }
    })
    body = cleanBody(res.text, title)
    published = res.published
  } catch (err) {
    summary.push({ slug, ok: false, err: String(err).slice(0, 80) })
    continue
  }

  const category = CATEGORY[slug] || 'Personal'
  // Inferred date fallback (no real publish date in source): spread one per
  // week back from a base so ordering is stable. Marked inferred for Bro.
  const dateInferred = !published
  const base = new Date('2025-01-01T00:00:00Z')
  base.setDate(base.getDate() - i * 7)
  const date = published ? published.slice(0, 10) : base.toISOString().slice(0, 10)

  const fm = {
    title,
    slug,
    date,
    category,
    tags: TAGS[category] || ['personal'],
    excerpt: makeExcerpt(body),
    author: 'WelshDog (Lyndon Williams)',
    source_url: url,
    ...(dateInferred ? { date_inferred: true } : {}),
  }

  const out = matter.stringify('\n' + body + '\n', fm)
  writeFileSync(join(OUT, file), out, 'utf8')
  summary.push({ slug, ok: true, chars: body.length, category, dateInferred })
}

await browser.close()
console.log(JSON.stringify(summary, null, 2))
const ok = summary.filter((s) => s.ok).length
console.log(`\nDONE: ${ok}/${summary.length} imported`)
