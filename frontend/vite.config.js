import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2015'
  },
  server: {
    proxy: {
      '/api': 'http://localhost:4000',
      '/uploads': 'http://localhost:4000',
      '/admin/login': 'http://localhost:4000',
      '/admin/logout': 'http://localhost:4000',
      '/admin/me': 'http://localhost:4000',
    },
  },
})
