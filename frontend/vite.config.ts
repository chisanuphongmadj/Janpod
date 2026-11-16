import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // ตอน dev: ส่งต่อ /api ไปที่ Backend (backend/ รันที่พอร์ต 3000)
    proxy: { '/api': 'http://localhost:3000' },
  },
})
