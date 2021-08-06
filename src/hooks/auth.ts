import { provideApolloClient, useResult } from '@vue/apollo-composable'
import { useLocalStorage } from '@vueuse/core'
import { ref, watch } from 'vue'
import { apolloClient } from '../apollo'
import { useMeQuery, useRegisterDeviceMutation } from '../graphql/generated'

const fired = ref(false)

export function useAuth () {
  provideApolloClient(apolloClient)
  const { onResult, loading, refetch, result } = useMeQuery({})
  const token = useLocalStorage<null | string>('rs-auth', null)
  const mutation = useRegisterDeviceMutation()

  watch(token, (nT, pT) => {
    console.log('token', nT)
    if (pT === null && nT !== null) return refetch()
  })

  onResult(qRes => {
    if (!qRes.data?.me && !fired.value) {
      fired.value = true
      apolloClient.clearStore()
        .then(async () => mutation.mutate())
        .then(async mRes => {
          token.value = mRes?.data?.registerDevice ?? null
          // return refetch()
        })
        .catch(err => {
          throw err
        })
    }
  })

  const user = useResult(result, null, res => res?.me)
  const isLoggedIn = useResult(result, false, res => !!res?.me)

  return {
    token,
    loading,
    user,
    isLoggedIn
  }
}
