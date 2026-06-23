// Dev-only QA: screenshot + horizontal-overflow audit at a given viewport.
// Usage: node scripts/shoot.mjs <url> <width> <out.png> [--audit]
import puppeteer from 'puppeteer-core'

const CHROME =
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

const [, , url = 'http://localhost:3000', widthArg = '375', out = '.shots/out.png'] =
  process.argv
const width = parseInt(widthArg, 10)
const audit = process.argv.includes('--audit')

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})
const page = await browser.newPage()
await page.setViewport({ width, height: 900, deviceScaleFactor: 1, isMobile: width < 640 })
// next-themes reads localStorage; seed it before any app script runs.
if (process.argv.includes('--dark')) {
  await page.evaluateOnNewDocument(() => localStorage.setItem('theme', 'dark'))
}
await page.goto(url, { waitUntil: 'networkidle0', timeout: 45000 })

if (audit) {
  const report = await page.evaluate((vw) => {
    const docW = document.documentElement.scrollWidth
    const offenders = []
    for (const el of document.querySelectorAll('*')) {
      const r = el.getBoundingClientRect()
      if (r.right > vw + 0.5 && r.width > 0) {
        offenders.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className || '').toString().slice(0, 60),
          right: Math.round(r.right),
          width: Math.round(r.width),
        })
      }
    }
    // Narrow to the most-specific (deepest/widest) few.
    offenders.sort((a, b) => b.right - a.right)
    return { viewport: vw, scrollWidth: docW, overflow: docW > vw, top: offenders.slice(0, 12) }
  }, width)
  console.log(JSON.stringify(report, null, 2))
}

await page.screenshot({ path: out, fullPage: true })
await browser.close()
console.log('shot:', out)
