import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          charts: ['chart.js', 'react-chartjs-2']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  define: {
    // Make environment variables available at build time
    __API_BASE_URL__: JSON.stringify(process.env.VITE_API_BASE_URL || 'http://localhost:3001'),
    __WS_URL__: JSON.stringify(process.env.VITE_WS_URL || 'http://localhost:3001')
  }
}) 