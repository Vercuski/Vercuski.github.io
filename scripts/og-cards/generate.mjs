/**
 * scripts/og-cards/generate.mjs
 *
 * Renders the social card images (og:image) into public/images/og/ by
 * screenshotting card.html in headless Chrome. Not part of the build: run
 * it after changing a card's text or the template, and commit the PNGs.
 *
 *   node scripts/og-cards/generate.mjs
 *
 * Set CHROME_PATH if Chrome isn't installed in its default location. Each
 * card's file name must match a key of OG_CARDS in src/site.ts.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'

/** Card text, keyed by output file name (without .png). */
const cards = {
  default: {
    eyebrow: 'Software & Solution Architect',
    title: 'Scott Vercuski',
    tagline: '30+ years turning ambiguous requirements into systems that scale. Architecture guides, documentation templates, and design patterns.',
  },
  'solution-architecture': {
    eyebrow: 'Solution Architecture',
    title: 'Design, document, and decide',
    tagline: 'A solution design checklist, 50 architecture documentation templates, and a fully worked example.',
  },
  'software-design-patterns': {
    eyebrow: 'Software Design Patterns',
    title: 'Patterns & Anti-Patterns',
    tagline: 'A catalog of creational, structural, behavioral and concurrency patterns, plus the anti-patterns to avoid.',
  },
}

const chrome = process.env.CHROME_PATH ?? {
  win32: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  darwin: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
}[process.platform] ?? 'google-chrome'

if (chrome.includes('/') && !existsSync(chrome)) {
  console.error(`Chrome not found at ${chrome}; set CHROME_PATH.`)
  process.exit(1)
}

const template = pathToFileURL(fileURLToPath(new URL('./card.html', import.meta.url)))
const outDir = fileURLToPath(new URL('../../public/images/og/', import.meta.url))
mkdirSync(outDir, { recursive: true })

for (const [name, text] of Object.entries(cards)) {
  const url = new URL(template)
  for (const [key, value] of Object.entries(text)) url.searchParams.set(key, value)
  const out = `${outDir}${name}.png`
  execFileSync(chrome, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--window-size=1200,630',
    // Give the web font time to load before the screenshot.
    '--virtual-time-budget=5000',
    `--screenshot=${out}`,
    url.href,
  ], { stdio: 'ignore' })
  console.log(`wrote ${out}`)
}
