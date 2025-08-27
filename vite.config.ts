import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  // server: {
  //   proxy: {
  //     '/uploads': {
  //       target: 'http://194.163.151.112:9015',
  //       changeOrigin: true,
  //       rewrite: (path) => path.replace(/^\/uploads/, '')
  //     }
  //   }
  // }

})

