import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,  // Frontend runs on port 5174
    proxy: {
      '/api': {
        target: 'http://localhost:5173',  // Backend runs on port 5173
        changeOrigin: true,
      }
    }
  }
})