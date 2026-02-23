import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/doe': {
        target: 'https://www.diariooficial.rs.gov.br',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/doe/, ''),
        secure: false,
      }
    }
  }
})
