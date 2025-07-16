import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import WindiCSS from 'vite-plugin-windicss'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    sourcemap: true
  },
  server: {
    port: 5001,
    allowedHosts: true,
  },
  plugins: [
    vue(),
    WindiCSS(),
    VitePWA({
      manifest: {
        name: 'RopeScore Judging',
        short_name: 'RSJudge',
        orientation: 'portrait',
        display: 'standalone',
        lang: 'en',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        categories: ['sports', 'productivity'],
        dir: 'ltr',
        shortcuts: [
          {
            name: 'Practice',
            short_name: 'Practice',
            description: 'Open the screen to select a judge type and rule set to practice with',
            url: '/practice',
            icons: [
              {
                src: '/icons/monochrome-icon-192x192.png',
                sizes: '192x192',
                type: 'image/png'
              }
            ]
          }
        ],
        description: `Practice and judge rope skipping / jump rope competitions
        with RopeScore's judging app, sporting support for multiple rulesets and
        rule versions such as those of the International Jump Rope Union.
        Thanks to RopeScore's flexibility this app can be used both for
        in-person competitions, and virtual competitions.

        RopeScore judge lets you be the best jump rope judge / rope skipping
        judge you can be since it runs anywhere with a web browser, any
        operating system, any device.

        If you use RopeScore as your scoring system RopeScore Judging can also
        push the scores directly to the system meaning you as a tournament
        director just have to sit back and relax as you watch the scores flow
        in from the judges, but other systems are supported as well with pen
        and paper. Printable templates for score collection is provided for free
        by RopeScore.`.split('\n').map(l => l.trim()).join('\n'),
        icons: [
          {
            src: '/icons/android-icon-36x36.png',
            sizes: '36x36',
            type: 'image/png'
          },
          {
            src: '/icons/android-icon-48x48.png',
            sizes: '48x48',
            type: 'image/png'
          },
          {
            src: '/icons/android-icon-72x72.png',
            sizes: '72x72',
            type: 'image/png'
          },
          {
            src: '/icons/android-icon-96x96.png',
            sizes: '96x96',
            type: 'image/png'
          },
          {
            src: '/icons/android-icon-144x144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: '/icons/android-icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/android-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/icons/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/icons/monochrome-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'monochrome'
          },
          {
            src: '/icons/monochrome-icon-256x256.png',
            sizes: '256x256',
            type: 'image/png',
            purpose: 'monochrome'
          },
          {
            src: '/icons/monochrome-icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'monochrome'
          }
        ],
        screenshots: [
          {
            src: '/screenshots/practice-phone.jpg',
            type: 'image/jpeg',
            sizes: '1080x2400',
            platform: 'narrow',
            label: 'The index of rulesets and judge types RopeScore judge supports, and the option to practice judging for any of them'
          },
          {
            src: '/screenshots/diff-phone.jpg',
            type: 'image/jpeg',
            sizes: '1080x2400',
            platform: 'narrow',
            label: 'The scoring screen for IJRU difficulty, at the top are buttons labeled "Exit", "Undo", and "Reset", below in the centre the calculated score is shown, and below that are 9 buttons, one for each level'
          },
          {
            src: '/screenshots/presath-phone.jpg',
            type: 'image/jpeg',
            sizes: '1080x2400',
            platform: 'narrow',
            label: 'The scoring screen for IJRU Athlete Presentation, at the top are buttons labeled "Exit", "Undo", and "Reset", below in the centre the calculated score is shown, and below that in the bottom left is a button to record misses, and to the right are buttons to record plus, check, and minus for form and execution'
          },
          {
            src: '/screenshots/presrout-phone.jpg',
            type: 'image/jpeg',
            sizes: '1080x2400',
            platform: 'narrow',
            label: 'The scoring screen for IJRU Routine Presentation, at the top are buttons labeled "Exit", "Undo", and "Reset", below in the centre the calculated score is shown, and below that to the left are buttons to record plus, check, and minus for entertainment, to the right are buttons to record plus, check, and minus for Musicality, and in the centre the two sub-scores are presented'
          },
          {
            src: '/screenshots/rq-srif-phone.jpg',
            type: 'image/jpeg',
            sizes: '1080x2400',
            platform: 'narrow',
            label: 'The scoring screen for IJRU Required Elements for Single Rope Individual Freestyle, at the top are buttons labeled "Exit", "Undo", and "Reset", below in the centre the calculated score is shown, below that are buttons right to left top to bottom for multiples, space violations, wraps/releases, gymnastics/power, time violations, misses, and repeated skills. The repeated skills button opens another view similar to the difficulty one but with fewer levels to chose from'
          },
          {
            src: '/screenshots/speedhj-phone.jpg',
            type: 'image/jpeg',
            sizes: '1080x2400',
            platform: 'narrow',
            label: 'The scoring screen for an IJRU Speed Head Judge, at the top are buttons labeled "Exit", "Undo", and "Reset", below are buttons for false starts and false switches, and below that is a large button to count steps'
          },
          {
            src: '/screenshots/group-win.png',
            type: 'image/png',
            sizes: '1759x1777',
            platform: 'wide',
            label: 'The screen showing the lineup of scoresheets for a RopeScore competition, the group name at the top, below are scoresheets that haven\'t yet been scored, and after an expansion section all completed/submitted scoresheets are shown'
          },
          {
            src: '/screenshots/presrout-win.png',
            type: 'image/png',
            sizes: '1759x1777',
            platform: 'wide',
            label: 'The scoring screen for IJRU Routine Presentation, at the top are buttons labeled "Exit", "Undo", and "Reset", below in the centre the calculated score is shown, and below that to the left are buttons to record plus, check, and minus for entertainment, to the right are buttons to record plus, check, and minus for Musicality, and in the centre the two sub-scores are presented'
          }
        ]
      }
    })
  ]
})
