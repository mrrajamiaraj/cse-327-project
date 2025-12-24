import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    strictPort: true, // Fail if port is already in use instead of trying another port
    open: false // Don't auto-open browser
  },
  preview: {
    port: 4173,
    strictPort: true
  }
})