import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Academic Scriptures',
        short_name: 'Scriptures',
        description:
          'Sacred texts, original sources, and comparative evidence.',
        theme_color: '#132a26',
        background_color: '#f5f1e8',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
      },
    }),
  ],
  define: {
    __BUILD_COMMIT__: JSON.stringify(
      process.env.CF_PAGES_COMMIT_SHA ??
        process.env.GITHUB_SHA ??
        process.env.COMMIT_SHA ??
        'development',
    ),
  },
  build: {
    sourcemap: true,
  },
});
