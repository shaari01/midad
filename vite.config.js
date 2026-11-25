import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// base './' keeps every asset path relative, so the same build works at
// https://<user>.github.io/<repo>/ and from any sub-folder.
export default defineConfig({
  base: './',
  resolve: {
    alias: { paper: 'paper/dist/paper-core.js' },
  },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 3000,
    assetsInlineLimit: 0,
  },
  optimizeDeps: { exclude: ['harfbuzzjs'] },
  worker: { format: 'es' },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    alias: { paper: 'paper' },
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      includeAssets: ['fonts/*.ttf', 'icons/*.png', 'icons/*.svg'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,wasm,ttf,png,svg,webmanifest}'],
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        navigateFallback: 'index.html',
      },
      manifest: {
        name: 'مِداد — برنامج الخط',
        short_name: 'مِداد',
        description: 'كتابة الخط العربي، والحروف الحيّة، والتحويل إلى أشكال، والزخرفة والتصدير',
        lang: 'ar',
        dir: 'rtl',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'any',
        background_color: '#1c1a17',
        theme_color: '#1c1a17',
        categories: ['design', 'graphics', 'productivity'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        file_handlers: [
          { action: './', accept: { 'application/json': ['.midad'] } },
        ],
      },
    }),
  ],
});
