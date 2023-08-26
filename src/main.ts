import { createApp } from 'vue'
import * as Sentry from '@sentry/vue'
import 'virtual:windi.css'
import '../node_modules/@ropescore/components/dist/style.css'
import App from './App.vue'
import router from './router'
import { DefaultApolloClient } from '@vue/apollo-composable'
import { apolloClient } from './apollo'

const app = createApp(App)

app.provide(DefaultApolloClient, apolloClient)
  .use(router)
  .mount('#app')

if (import.meta.env.PROD) {
  Sentry.init({
    app,
    dsn: 'https://91d516fcee2348da93854140a4a8cdcc@o127465.ingest.sentry.io/5654198',
    release: import.meta.env.VITE_COMMIT_REF?.toString(),
    environment: import.meta.env.VITE_CONTEXT?.toString(),
    logErrors: true,
    integrations: [new Sentry.BrowserTracing({
      tracingOrigins: ['ropescore.app'],
      routingInstrumentation: Sentry.vueRouterInstrumentation(router)
    })],
    tracesSampleRate: 1.0
  })
}
