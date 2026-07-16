import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // required for docker
    port: 5173,
    watch: {
      usePolling: true, // 🔥 critical fix
      interval: 100,
    },
  },
})
