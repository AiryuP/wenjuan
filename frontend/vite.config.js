import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve('./src'), // @代替src
    }
  },
  server: {
    port: 4123,
    proxy: {
      "/api": "http://localhost:4124", 
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        // additionalData: '@import "@/styles/index.scss";',
        javascriptEnabled: true
      }
    }
  }
})
