import { ApolloClient, createHttpLink, InMemoryCache, split, from } from '@apollo/client/core'
import { getMainDefinition } from '@apollo/client/utilities'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { useAuth } from './hooks/auth'
import { WebSocketLink } from './graphql-ws'
import { computed, watch } from 'vue'
import { useFetch, useIntervalFn, useLocalStorage } from '@vueuse/core'
import useNotifications from './hooks/notifications'

const localDiscover = useFetch('http://ropescore.local').get().text()
const resolvedReachable = useFetch(
  computed(() => `https://${localDiscover.data.value}/.well-known/apollo/server-health`),
  {
    refetch: computed(() => typeof localDiscover.data.value === 'string' && /\.local\.ropescore\.com(:\d+)?$/.test(localDiscover.data.value)),
    immediate: false
  }
).get().json()
useIntervalFn(() => {
  localDiscover.execute()
}, 60_000)

export const localApis = ['', 'local-001', 'local-002', 'dev']
export const localManual = useLocalStorage<string>('rs-local-api', null)
const manualReachable = useFetch(
  computed(() => localManual.value === 'dev'
    ? 'http://localhost:5000/.well-known/apollo/server-health'
    : `https://${localManual.value}.local.ropescore.com/.well-known/apollo/server-health`),
  {
    refetch: computed(() => !!localManual.value),
    immediate: !!localManual.value
  }
).get().json()
useIntervalFn(() => {
  manualReachable.execute()
}, 60_000)

export const apiDomain = computed(() => {
  if (localManual.value === 'dev' && manualReachable.data.value?.status === 'pass') return 'localhost:5000'
  if (localManual.value && manualReachable.data.value?.status === 'pass') return `${localManual.value}.local.ropescore.com`
  else if (
    typeof localDiscover.data.value === 'string' &&
    /\.local\.ropescore\.com(:\d+)?$/.test(localDiscover.data.value) &&
    resolvedReachable.data.value?.status === 'pass'
  ) {
    return localDiscover.data.value.trim()
  } else return 'api.ropescore.com'
})

const wsLink = new WebSocketLink({
  url: () => { return import.meta.env.VITE_GRAPHQL_WS_ENDPOINT ?? `${apiDomain.value.startsWith('localhost') ? 'ws' : 'wss'}://${apiDomain.value}/graphql` },
  lazy: true,
  lazyCloseTimeout: 20 * 1000,
  numConnections: 3,
  connectionParams: () => {
    const auth = useAuth()
    watch(auth.token, () => {
      for (const client of wsLink.clients) client.restart()
    })

    return {
      Authorization: auth.token.value ? `Bearer ${auth.token.value}` : ''
    }
  }
})

const httpLink = createHttpLink({
  uri: () => { return import.meta.env.VITE_GRAPHQL_ENDPOINT ?? `${apiDomain.value.startsWith('localhost') ? 'http' : 'https'}://${apiDomain.value}/graphql` }
})

const authLink = setContext(async (_, { headers }) => {
  const auth = useAuth()
  return {
    headers: {
      ...headers,
      authorization: auth.token.value ? `Bearer ${auth.token.value}` : ''
    }
  }
})

const { push: pushError } = useNotifications()
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    console.log('gqlErr', graphQLErrors)
    for (const err of graphQLErrors) {
      console.log({ ...err })
      pushError({
        message: err.message,
        type: 'server',
        code: typeof err.extensions.code === 'string' ? err.extensions.code : undefined
      })
    }
  }
  if (networkError) {
    console.log('netERror', networkError)
    pushError({
      message: networkError.message,
      type: 'network'
    })
  }
})

const cache = new InMemoryCache({
  typePolicies: {
    Device: {
      fields: {
        streamShares: {
          merge: false
        }
      }
    }
  },
  possibleTypes: {
    Scoresheet: ['TallyScoresheet', 'MarkScoresheet']
  }
})

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    ) ||
    (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'mutation' &&
      definition.name?.kind === 'Name' &&
      (
        definition.name?.value === 'AddStreamMark' ||
        definition.name?.value === 'AddDeviceStreamMark'
      )
    )
  },
  wsLink,
  from([errorLink, authLink, httpLink])
)

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache
})
