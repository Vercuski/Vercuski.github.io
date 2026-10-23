// Plugins
import Components from 'unplugin-vue-components/vite'
import Vue from '@vitejs/plugin-vue'
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import ViteFonts from 'unplugin-fonts/vite'
import VueRouter from 'unplugin-vue-router/vite'

// Utilities
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import { readdirSync, writeFileSync } from 'node:fs'
import { canonicalUrl } from './src/site'
import { allTopics } from './src/data/topics'
import { docUrl, pickDefaultDocument } from './src/utils/docPaths'

/** Routes prerendered by vite-ssg, collected for the sitemap. */
const sitemapRoutes: string[] = []

/**
 * Lists the page URL of every document in every documentation set (see the
 * /topics/<slug>/:doc route in src/router/index.ts), for prerendering. Each
 * set's default document is left out: it is served at the set's own page,
 * which vite-ssg already prerenders.
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
    return paths
      .filter(path => path !== defaultPath)
      .map(path => docUrl(topic.slug, path, defaultPath).replace(/\/$/, ''))
  })
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
    // automatically. Pages marked noindex are left out.
    onPageRendered (route, renderedHTML) {
      if (!/<meta[^>]+name="robots"[^>]+noindex/i.test(renderedHTML)) {
        sitemapRoutes.push(route)
      }
      return renderedHTML
    },
    onFinished () {
      const urls = [...new Set(sitemapRoutes.map(canonicalUrl))].sort()
      const xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...urls.map(url => `  <url>\n    <loc>${url}</loc>\n  </url>`),
        '</urlset>',
        '',
      ].join('\n')
      writeFileSync(fileURLToPath(new URL('./dist/sitemap.xml', import.meta.url)), xml)
    },
  },
})
