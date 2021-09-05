import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client/core'
import { setContext } from '@apollo/client/link/context'
import { useAuth } from './hooks/auth'

const httpLink = createHttpLink({
  uri: 'https://api.ropescore.com'
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

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache
})
