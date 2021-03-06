import { createApp } from 'vue'
import * as Sentry from "@sentry/browser"
import { Integrations } from "@sentry/tracing"
import 'windi.css'
import App from './App.vue'
import router from './router'
import store from './store'
import './battery'

Sentry.init({
  dsn: "https://91d516fcee2348da93854140a4a8cdcc@o127465.ingest.sentry.io/5654198",
  release: import.meta.env.VITE_COMMIT_REF?.toString(),
  environment: import.meta.env.VITE_CONTEXT?.toString(),
  integrations: [new Integrations.BrowserTracing({
    tracingOrigins: ['ropescore.app']
  })],
  tracesSampleRate: 1.0
});

createApp(App).use(router).use(store).mount('#app')
