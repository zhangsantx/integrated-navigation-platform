import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        // additionalData: `@use "@/theme/element/var.scss" as *; @use "@/assets/style/index.scss" as *;`,
        additionalData: `@use "@/style/element/var.scss" as *;`,
      },
    },
  },
})
