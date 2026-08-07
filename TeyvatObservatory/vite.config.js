import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    target: 'es2015',
    modulePreload: false,
  },
  server: {
    host: true,
    port: 3000,
    open: true,
    proxy: {
      '/api/enka': {
        target: 'https://enka.network',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/enka/, '/api'),
        headers: { 'User-Agent': 'TeyvatObservatory/1.0' },
      },
      '/api/ui': {
        target: 'https://enka.network',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ui/, '/ui'),
        headers: { 'User-Agent': 'TeyvatObservatory/1.0' },
      },
    },
  },
})
