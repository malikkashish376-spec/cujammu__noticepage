import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Build stamp shown in the page footer, so a stale cached bundle is obvious.
const buildStamp = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __BUILD_STAMP__: JSON.stringify(buildStamp),
  },
  server: {
    port: 3000,
    open: false
  },
  preview: {
    port: 3000
  }
})
