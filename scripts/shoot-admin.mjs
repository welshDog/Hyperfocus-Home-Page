// Logs into Mission Control and screenshots gated admin pages.
// Usage: node scripts/shoot-admin.mjs <email> <password>
import puppeteer from 'puppeteer-core'

const CHROME =
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const email = process.argv[2]
const password = process.argv[3]
const BASE = process.argv[4] || 'http://localhost:3000'

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 })

await page.goto(`${BASE}/admin/login`, { waitUntil: 'networkidle0' })
await page.type('input[name="email"]', email)
await page.type('input[name="password"]', password)
await Promise.all([
  page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 45000 }),
  page.click('button[type="submit"]'),
])

const shots = [
  ['/admin', '.shots/admin-dashboard-dark.png'],
  ['/admin/agents', '.shots/admin-agents-dark.png'],
  ['/admin/products', '.shots/admin-products-dark.png'],
]

for (const [path, out] of shots) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 800))
  await page.screenshot({ path: out, fullPage: true })
  console.log('shot:', out)
}

// Confirm we actually reached the dashboard (not bounced to login).
const finalUrl = page.url()
console.log('final url:', finalUrl)
await browser.close()
