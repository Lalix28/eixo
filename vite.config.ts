/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// VitePWA é excluído durante os testes (Vitest) para não interferir.
const isTest = process.env.VITEST === 'true'

const pwa = VitePWA({
  registerType: 'prompt', // atualização segura: pergunta antes de recarregar
  includeAssets: ['favicon.svg', 'icons/icon-192.png'],
  manifest: {
    name: 'Eixo',
    short_name: 'Eixo',
    description: 'Mini app pessoal de treino/mobilidade',
    lang: 'pt-BR',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    theme_color: '#059669',
    background_color: '#f8fafc',
    icons: [
      { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      {
        src: 'icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  },
  workbox: {
    // Precache do shell + assets. Dados do usuário NÃO são cacheados (ficam no IndexedDB).
    globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
    navigateFallback: '/index.html',
    cleanupOutdatedCaches: true,
    clientsClaim: true,
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), ...(isTest ? [] : [pwa])],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
})
