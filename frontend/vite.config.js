import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  appType: 'spa',
  server: {
    host: '127.0.0.1',
    port: 5175,
    proxy: {
      '/api': 'http://localhost:4000',
      '/uploads': 'http://localhost:4000',
      '/admin/login': {
        target: 'http://localhost:4000',
        // Only proxy POST requests (the API call), let GET fall through to SPA
        bypass(req) {
          if (req.method === 'GET' && req.headers.accept?.includes('text/html')) {
            return '/index.html'
          }
        },
      },
      '/admin/logout': 'http://localhost:4000',
      '/admin/me': 'http://localhost:4000',
    },
  },
})
