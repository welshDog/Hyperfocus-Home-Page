import puppeteer from 'puppeteer-core'

const CHROME =
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

const url = process.argv[2]
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})
const page = await browser.newPage()
await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 })
// Give client JS a beat to hydrate the article.
await new Promise((r) => setTimeout(r, 2500))

const result = await page.evaluate(() => {
  const candidates = [
    'article',
    'main',
    '[class*="blog-post"]',
    '[class*="article"]',
    '[class*="content"]',
  ]
  let best = { sel: 'body', len: 0, text: document.body.innerText }
  for (const sel of candidates) {
    for (const el of document.querySelectorAll(sel)) {
      const t = el.innerText || ''
      if (t.length > best.len) best = { sel, len: t.length, text: t }
    }
  }
  return { title: document.title, sel: best.sel, len: best.text.length, preview: best.text.slice(0, 1200) }
})

console.log(JSON.stringify(result, null, 2))
await browser.close()
