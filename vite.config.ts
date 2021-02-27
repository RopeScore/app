import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import WindiCSS from 'vite-plugin-windicss'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    WindiCSS(),
    VitePWA({
      manifest: {
        name: 'RopeScore Judging',
        short_name: 'RSJudge',
        orientation: 'portrait',
        // background_color: '',
        // theme_color: ''
      },
      workbox: {

      }
    })
  ]
})
