import { ApolloClient, createHttpLink, InMemoryCache, split, from } from '@apollo/client/core'
import { getMainDefinition } from '@apollo/client/utilities'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { useAuth } from './hooks/auth'
import { WebSocketLink } from './graphql-ws'
import { computed, watch } from 'vue'
import { useFetch, useIntervalFn, useLocalStorage } from '@vueuse/core'
import useNotifications from './hooks/notifications'
import { Kind, OperationTypeNode } from 'graphql'
import { useServoAuth } from './hooks/servo-auth'

const localDiscover = useFetch('http://ropescore.local').get().text()
const resolvedReachable = useFetch(
  computed(() => `https://${localDiscover.data.value}/.well-known/apollo/server-health`),
  {
    refetch: computed(() => typeof localDiscover.data.value === 'string' && /\.local\.ropescore\.com(:\d+)?$/.test(localDiscover.data.value)),
    timeout: 5_000,
    immediate: false
  }
).get().json()
useIntervalFn(() => {
  void localDiscover.execute()
}, 60_000)

export const localApis = ['', 'local-001', 'local-002', 'local-003', 'local-004', 'local-005', 'dev']
export const localManual = useLocalStorage<string>('rs-local-api', null)
const manualReachable = useFetch(
  computed(() => localManual.value === 'dev'
    ? 'http://localhost:5000/.well-known/apollo/server-health'
    : `https://${localManual.value}.local.ropescore.com/.well-known/apollo/server-health`),
  {
    refetch: computed(() => !!localManual.value),
    timeout: 5_000,
    immediate: !!localManual.value
  }
).get().json()
useIntervalFn(() => {
  void manualReachable.execute()
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
    const servoAuth = useServoAuth()
    const auth = useAuth()
    watch(() => [auth.token.value, servoAuth.token.value], () => {
      for (const client of wsLink.clients) client.restart()
    })

    return {
      Authorization: auth.token.value ? `Bearer ${auth.token.value}` : '',
      'Servo-Authorization': servoAuth.token.value ? `Bearer ${servoAuth.token.value}` : '',
    }
  }
})

const httpLink = createHttpLink({
  uri: () => { return import.meta.env.VITE_GRAPHQL_ENDPOINT ?? `${apiDomain.value.startsWith('localhost') ? 'http' : 'https'}://${apiDomain.value}/graphql` }
})

const authLink = setContext(async (_, { headers }) => {
  const auth = useAuth()
  const servoAuth = useServoAuth()
  return {
    headers: {
      ...headers,
      authorization: auth.token.value ? `Bearer ${auth.token.value}` : '',
      'servo-authorization': servoAuth.token.value ? `Bearer ${servoAuth.token.value}` : '',
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
        code: typeof err.extensions?.code === 'string' ? err.extensions.code : undefined
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
      definition.kind === Kind.OPERATION_DEFINITION &&
      definition.operation === OperationTypeNode.SUBSCRIPTION
    ) ||
    (
      definition.kind === Kind.OPERATION_DEFINITION &&
      definition.operation === OperationTypeNode.MUTATION &&
      definition.name?.kind === Kind.NAME &&
      (
        definition.name.value === 'AddStreamMark' ||
        definition.name.value === 'AddDeviceStreamMark' ||
        definition.name.value === 'AddServoStreamMark'
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
