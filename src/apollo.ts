import { ApolloClient, createHttpLink, InMemoryCache, split } from '@apollo/client/core'
import { getMainDefinition } from '@apollo/client/utilities'
import { setContext } from '@apollo/client/link/context'
import { useAuth } from './hooks/auth'
import { WebSocketLink } from './graphql-ws'
import { computed, watch } from 'vue'
import { useFetch, useIntervalFn } from '@vueuse/core'

const localResolve = useFetch('http://ropescore.local').get().text()
export const localDomain = computed(() =>
  typeof localResolve.data.value === 'string' && /\.local\.ropescore\.com(:\d+)?$/.test(localResolve.data.value)
    ? localResolve.data.value.trim()
    : 'api.ropescore.com'
)
useIntervalFn(() => {
  localResolve.execute()
}, 60_000)

const wsLink = new WebSocketLink({
  url: () => import.meta.env.VITE_GRAPHQL_WS_ENDPOINT ?? `wss://${localDomain.value}/graphql`,
  lazy: true,
  lazyCloseTimeout: 20 * 1000,
  connectionParams: () => {
    const auth = useAuth()
    watch(auth.token, () => {
      wsLink.client.restart()
    })

    return {
      Authorization: auth.token.value ? `Bearer ${auth.token.value}` : ''
    }
  }
})

const httpLink = createHttpLink({
  uri: () => import.meta.env.VITE_GRAPHQL_ENDPOINT ?? `https://${localDomain.value}/graphql`
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
  authLink.concat(httpLink)
)

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache
})
