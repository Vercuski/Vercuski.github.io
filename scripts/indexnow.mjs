/**
 * scripts/indexnow.mjs
 *
 * Tells IndexNow search engines (Bing, Yandex, Seznam, Naver, Yep) which
 * pages a deploy added, changed or removed, so they recrawl them without
 * waiting to rediscover the sitemap. Google doesn't use IndexNow.
 *
 *   node scripts/indexnow.mjs <new-sitemap> [previous-sitemap] [--dry-run]
 *
 * Compares the two sitemaps by <loc> and <lastmod>; with no previous
 * sitemap (or a missing file) it submits every URL. --dry-run lists the
 * URLs without waiting or submitting. Before submitting it
 * waits until the live site serves the new sitemap, so crawlers that
 * respond straight away see the new pages rather than the old ones.
 *
 * The key is the 32-hex-character file in public/ (served at the site
 * root), which is how IndexNow checks the submission is from the site's
 * owner. To change it, replace that file; the old one stops working.
 *
 * Run by the indexnow job in .github/workflows/deploy.yml.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const SITE_URL = 'https://scott.vercuski.com'
const ENDPOINT = 'https://api.indexnow.org/indexnow'
/** How long to wait for the live site to serve the new sitemap. */
const WAIT_MS = 10 * 60 * 1000
const POLL_MS = 15 * 1000

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const [newPath, previousPath] = args.filter(arg => arg !== '--dry-run')
if (!newPath) {
  console.error('Usage: node scripts/indexnow.mjs <new-sitemap> [previous-sitemap]')
  process.exit(2)
}

const key = findKey()
const newXml = readFileSync(newPath, 'utf8')
const previousXml = previousPath && existsSync(previousPath) ? readFileSync(previousPath, 'utf8') : ''

const urls = changedUrls(entries(previousXml), entries(newXml), !previousXml)
if (urls.length === 0) {
  console.log('No pages added, changed or removed; nothing to submit.')
  process.exit(0)
}
console.log(`${urls.length} URL(s) to submit:\n  ${urls.join('\n  ')}`)

if (!dryRun) {
  await waitForLiveSitemap(newXml)
  await submit(urls)
}

/** @returns The IndexNow key, from public/<key>.txt. */
function findKey () {
  const dir = fileURLToPath(new URL('../public/', import.meta.url))
  const file = readdirSync(dir).find(name => /^[0-9a-f]{32}\.txt$/.test(name))
  if (!file) throw new Error('No IndexNow key file (public/<32 hex characters>.txt) found.')
  return file.slice(0, -'.txt'.length)
}

/**
 * @param xml - A sitemap.
 * @returns Each <loc> mapped to its <lastmod> ('' if it has none).
 */
function entries (xml) {
  const map = new Map()
  for (const [, body] of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = body.match(/<loc>(.*?)<\/loc>/)?.[1]
    if (loc) map.set(loc, body.match(/<lastmod>(.*?)<\/lastmod>/)?.[1] ?? '')
  }
  return map
}

/**
 * @param before - The deployed sitemap's entries.
 * @param after - The new sitemap's entries.
 * @param all - Submit every URL in `after` (no previous sitemap).
 * @returns URLs that are new, have a new <lastmod>, or were removed
 *   (IndexNow takes removals too: the crawler finds the 404 and drops it).
 */
function changedUrls (before, after, all) {
  if (all) return [...after.keys()]
  const changed = [...after].filter(([loc, lastmod]) => before.get(loc) !== lastmod).map(([loc]) => loc)
  const removed = [...before.keys()].filter(loc => !after.has(loc))
  return [...changed, ...removed].sort()
}

/**
 * Polls the live sitemap until it matches the one just built, so the
 * deploy (gh-pages push, then Netlify's build) has finished.
 *
 * @param expected - The new sitemap's text.
 */
async function waitForLiveSitemap (expected) {
  const deadline = Date.now() + WAIT_MS
  for (;;) {
    try {
      const response = await fetch(`${SITE_URL}/sitemap.xml?indexnow=${Date.now()}`, { cache: 'no-store' })
      if (response.ok && (await response.text()) === expected) {
        console.log('The live site is serving the new sitemap.')
        return
      }
    } catch (error) {
      console.log(`Fetching the live sitemap failed (${error.message}); retrying.`)
    }
    if (Date.now() > deadline) {
      throw new Error(`The live sitemap still doesn't match the build after ${WAIT_MS / 60000} minutes.`)
    }
    console.log('Waiting for the deploy to go live...')
    await new Promise(resolve => setTimeout(resolve, POLL_MS))
  }
}

/**
 * Submits the URLs to IndexNow, which shares them with every participating
 * search engine.
 *
 * @param urlList - Absolute URLs on SITE_URL (at most 10,000).
 */
async function submit (urlList) {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: new URL(SITE_URL).host,
      key,
      keyLocation: `${SITE_URL}/${key}.txt`,
      urlList,
    }),
  })
  // 200 OK and 202 Accepted (key not yet verified) both mean it was taken.
  if (response.status !== 200 && response.status !== 202) {
    throw new Error(`IndexNow rejected the submission: ${response.status} ${response.statusText} ${await response.text()}`)
  }
  console.log(`IndexNow accepted ${urlList.length} URL(s) (HTTP ${response.status}).`)
}
