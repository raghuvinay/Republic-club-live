import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Republic-club-live/', // <--- Fixed: 'club' instead of 'cup'
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})