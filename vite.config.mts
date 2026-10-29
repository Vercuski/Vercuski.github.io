// Plugins
import Components from 'unplugin-vue-components/vite'
import Vue from '@vitejs/plugin-vue'
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import ViteFonts from 'unplugin-fonts/vite'
import VueRouter from 'unplugin-vue-router/vite'

// Utilities
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import { execFileSync } from 'node:child_process'
import { readdirSync, statSync, writeFileSync } from 'node:fs'
import { canonicalUrl } from './src/site'
import { allTopics } from './src/data/topics'
import { docUrl, pickDefaultDocument } from './src/utils/docPaths'

/** Routes prerendered by vite-ssg, collected for the sitemap. */
const sitemapRoutes: string[] = []

/**
 * The file each page's content comes from, keyed by canonical URL, for the
 * sitemap's <lastmod>. Paths are relative to the repository root.
 */
const pageSources = new Map<string, string>([
  ['/', 'src/pages/index.vue'],
  ['/about', 'src/pages/About.vue'],
  ['/projects', 'src/pages/Projects.vue'],
  ['/skills', 'src/pages/Skills.vue'],
  ['/contact', 'src/pages/Contact.vue'],
  ['/privacy', 'src/pages/Privacy.vue'],
  ['/topics', 'src/pages/TopicsIndex.vue'],
  ...allTopics.map(topic => [`/topics/${topic.slug}`, 'src/data/topics.ts'] as [string, string]),
].map(([route, file]) => [canonicalUrl(route), file]))

/**
 * Lists the page URL of every document in every documentation set (see the
 * /topics/<slug>/:doc route in src/router/index.ts), for prerendering. Each
 * set's default document is left out: it is served at the set's own page,
 * which vite-ssg already prerenders. Also records each document as its
 * page's source in {@link pageSources}.
 *
 * @returns Route paths without a trailing slash.
 */
function documentRoutes (): string[] {
  const root = fileURLToPath(new URL('./src/assets/documentation/', import.meta.url))
  return allTopics.flatMap(topic => {
    if (!topic.documentation) return []
    const paths = (readdirSync(`${root}${topic.documentation}`, { recursive: true }) as string[])
      .map(path => path.replace(/\\/g, '/'))
      .filter(path => path.toLowerCase().endsWith('.md'))
    const defaultPath = pickDefaultDocument(paths)
    return paths.flatMap(path => {
      const route = docUrl(topic.slug, path, defaultPath).replace(/\/$/, '')
      pageSources.set(canonicalUrl(route), `src/assets/documentation/${topic.documentation}/${path}`)
      return path === defaultPath ? [] : [route]
    })
  })
}

/**
 * Finds when each file last changed: its last commit date, or for a file
 * with uncommitted changes (or never committed), its modified time.
 *
 * @param files - Paths relative to the repository root.
 * @returns 'YYYY-MM-DD' dates keyed by path; files git can't date and that
 *   don't exist are left out.
 */
function lastModified (files: string[]): Map<string, string> {
  const git = (...args: string[]) =>
    execFileSync('git', ['-c', 'core.quotePath=false', ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })

  // Newest commit first, so the first date seen for a file is its latest.
  const committed = new Map<string, string>()
  let date = ''
  for (const line of git('log', '--format=@%cs', '--name-only').split('\n')) {
    if (line.startsWith('@')) date = line.slice(1)
    else if (line && !committed.has(line)) committed.set(line, date)
  }

  // 'XY path' entries; NUL-separated so paths need no unquoting.
  const dirty = new Set(git('status', '--porcelain', '-z', '--untracked-files=all')
    .split('\0').filter(Boolean).map(entry => entry.slice(3)))

  const dates = new Map<string, string>()
  for (const file of files) {
    if (!dirty.has(file) && committed.has(file)) {
      dates.set(file, committed.get(file)!)
      continue
    }
    try {
      dates.set(file, statSync(file).mtime.toISOString().slice(0, 10))
    } catch {
      // Missing file: the page gets no <lastmod>.
    }
  }
  return dates
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    VueRouter(),
    Vue({
      template: { transformAssetUrls },
    }),
    // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
    Vuetify({
      autoImport: true,
      styles: {
        configFile: 'src/styles/settings.scss',
      },
    }),
    Components(),
    ViteFonts({
      google: {
        families: [ {
          name: 'Roboto',
          styles: 'wght@100;300;400;500;700;900',
        }],
      },
    }),
  ],
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ],
  },
  server: {
    port: 3000,
  },
  // Vuetify's components import their own .css files as a side effect;
  // without this, vite-ssg's Node-run SSR bundle tries to import those
  // .css files directly and fails with ERR_UNKNOWN_FILE_EXTENSION.
  ssr: {
    noExternal: ['vuetify'],
  },
  // '/about' -> 'about/index.html' rather than 'about.html', so every page
  // is served at its directory URL ('/about/') without relying on
  // extensionless-.html resolution.
  ssgOptions: {
    dirStyle: 'nested',
    // vite-ssg skips dynamic routes, so add each document page.
    includedRoutes (paths) {
      return [...paths.filter(path => !path.includes(':')), ...documentRoutes()]
    },
    // Build sitemap.xml from the pages vite-ssg actually prerendered, so
    // new pages (e.g. topics added in src/data/topics.ts) are included
    // automatically. Pages marked noindex are left out. Each page's
    // <lastmod> is when its source file last changed (see pageSources).
    onPageRendered (route, renderedHTML) {
      if (!/<meta[^>]+name="robots"[^>]+noindex/i.test(renderedHTML)) {
        sitemapRoutes.push(route)
      }
      return renderedHTML
    },
    onFinished () {
      const urls = [...new Set(sitemapRoutes.map(canonicalUrl))].sort()
      const dates = lastModified([...new Set(pageSources.values())])
      const entry = (url: string) => {
        const date = dates.get(pageSources.get(url) ?? '')
        return date
          ? `  <url>\n    <loc>${url}</loc>\n    <lastmod>${date}</lastmod>\n  </url>`
          : `  <url>\n    <loc>${url}</loc>\n  </url>`
      }
      const xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...urls.map(entry),
        '</urlset>',
        '',
      ].join('\n')
      writeFileSync(fileURLToPath(new URL('./dist/sitemap.xml', import.meta.url)), xml)
    },
  },
})
