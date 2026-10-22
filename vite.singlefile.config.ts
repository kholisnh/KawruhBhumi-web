import { readFileSync } from 'node:fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

/** Replace public/ favicon references with a single inline PNG data URI. */
function inlineFavicon(): Plugin {
  return {
    name: 'inline-favicon',
    transformIndexHtml(html) {
      const png = readFileSync(new URL('./public/brand/favicon-32.png', import.meta.url))
      const dataUri = `data:image/png;base64,${png.toString('base64')}`
      return html
        .replace(/href="[^"]*favicon(?:-\d+)?\.(?:ico|png)"/g, `href="${dataUri}"`)
        .replace(/href="[^"]*apple-touch-icon\.png"/g, `href="${dataUri}"`)
    },
  }
}

/**
 * Offline single-file build: inlines every JS/CSS asset (and base64 fonts)
 * into one self-contained dist-single/index.html that runs from file://.
 * The regular `vite build` (dist/) used by the live server is unaffected.
 */
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), viteSingleFile(), inlineFavicon()],
  build: {
    outDir: 'dist-single',
    emptyOutDir: true,
    cssCodeSplit: false,
    assetsInlineLimit: Number.MAX_SAFE_INTEGER,
    chunkSizeWarningLimit: 20000,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
})
