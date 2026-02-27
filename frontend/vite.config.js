import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'   

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globIgnores: ['**/InterviewCallRoom-*.js'],
      },
      manifest: {
        name: 'campus connect',
        short_name: 'campusnet',
        icons: [
          {
            src: 'data:image/svg+xml;base64,...',
            sizes: '192x192',
            type: 'image/png'
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),  
    },
  },
  server: {
    host: true,
  },
})