import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'campus connect',
        short_name: 'campusnet',
        icons: [
          { src: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM2Y2VhZDUiIHN0cm9rZS13aWR0aD0iMi41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWhhbmRzaGFrZS1pY29uIGx1Y2lkZS1oYW5kc2hha2UiPjxwYXRoIGQ9Im0xMSAxNyAyIDJhMSAxIDAgMSAwIDMtMyIvPjxwYXRoIGQ9Im0xNCAxNCAyLjUgMi41YTEgMSAwIDEgMCAzLTNsLTMuODgtMy44OGEzIDMgMCAwIDAtNC4yNCAwbC0uODguODhhMSAxIDAgMSAxLTMtM2wyLjgxLTIuODFhNS43OSA1Ljc5IDAgMCAxIDcuMDYtLjg3bC40Ny4yOGEyIDIgMCAwIDAgMS40Mi4yNUwyMSA0Ii8+PHBhdGggZD0ibTIxIDMgMSAxMWgtMiIvPjxwYXRoIGQ9Ik0zIDMgMiAxNGw2LjUgNi41YTEgMSAwIDEgMCAzLTMiLz48cGF0aCBkPSJNMyA0aDgiLz48L3N2Zz4=', sizes: '192x192', type: 'image/png' },
        ],
      },
    })
  ],
  server: {
    host: true,
  },
  build: {
    // Enable minification and code splitting
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true
      }
    },
    // Optimize chunks for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', 'tailwindcss']
        }
      }
    },
    // Increase chunk size warning threshold
    chunkSizeWarningLimit: 1000
  }
})
