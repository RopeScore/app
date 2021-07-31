import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client/core'
import { setContext } from '@apollo/client/link/context'
import { persistCache, LocalStorageWrapper } from 'apollo3-cache-persist'
import { useAuth } from './hooks/auth'

const httpLink = createHttpLink({
  uri: 'https://api.ropescore.app'
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

const cache = new InMemoryCache()

await persistCache({
  cache,
  storage: new LocalStorageWrapper(window.localStorage) as any
})

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache
})
