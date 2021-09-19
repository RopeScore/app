import { provideApolloClient, useResult } from '@vue/apollo-composable'
import { useLocalStorage } from '@vueuse/core'
import { watch } from 'vue'
import { apolloClient } from '../apollo'
import { RegisterDeviceMutationVariables, useMeQuery, useRegisterDeviceMutation } from '../graphql/generated'

export function useAuth () {
  provideApolloClient(apolloClient)
  const { loading, refetch, result } = useMeQuery({})
  const token = useLocalStorage<null | string>('rs-auth', null)
  const mutation = useRegisterDeviceMutation()

  watch(token, (nT, pT) => {
    console.log('token', nT)
    if (pT === null && nT !== null) return refetch()
  })

  async function register (vars: RegisterDeviceMutationVariables) {
    const res = await mutation.mutate(vars)
    if (res?.data?.registerDevice) {
      token.value = res.data.registerDevice
      await apolloClient.resetStore()
    }
  }

  async function logOut () {
    token.value = null
    await apolloClient.resetStore()
  }

  const user = useResult(result, null, res => res?.me)
  const isLoggedIn = useResult(result, false, res => !!res?.me)

  return {
    token,
    loading,
    user,
    isLoggedIn,

    register,
    logOut
  }
}
