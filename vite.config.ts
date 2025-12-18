import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 生产环境移除 console
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          'vendor-ui': ['naive-ui'],
          'vendor-3d': ['three', '@tresjs/core', '@tresjs/cientos'],
          'vendor-icons': ['@vicons/ionicons5', '@vicons/material'],
          'vendor-utils': ['axios', 'bcryptjs', 'dompurify']
        }
      }
    },
    chunkSizeWarningLimit: 1000 // 块大小警告限制
  },
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'naive-ui']
  }
})


