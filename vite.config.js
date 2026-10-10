import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: './', // Մեկ հատը լիովին հերիք է
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    proxy: {
      '/local/app/pahest/api-bitrix': {
        target: 'https://crm.americanglobalgroup.com',
        changeOrigin: true
      }
    }
  }
})
