import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3004,
    host: '0.0.0.0',
    hmr: {
      host: 'localhost',
      port: 3004,
      protocol: 'ws'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})

