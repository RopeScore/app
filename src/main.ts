import { createApp, type Component } from 'vue'
import * as Sentry from '@sentry/vue'
import 'virtual:windi.css'
import '@ropescore/components/style.css'
import App from './App.vue'
import router from './router'
import { DefaultApolloClient } from '@vue/apollo-composable'
import { apolloClient } from './apollo'

const app = createApp(App as Component)

app.provide(DefaultApolloClient, apolloClient)
  .use(router)
  .mount('#app')

if (import.meta.env.PROD) {
  Sentry.init({
    app,
    dsn: 'https://91d516fcee2348da93854140a4a8cdcc@o127465.ingest.sentry.io/5654198',
    release: import.meta.env.VITE_COMMIT_REF?.toString(),
    environment: import.meta.env.VITE_CONTEXT?.toString(),
    tracePropagationTargets: ['ropescore.app', 'api.ropescore.com'],
    integrations: [Sentry.browserTracingIntegration({
      router
    })],
    tracesSampleRate: 1.0
  })
}
