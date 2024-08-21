import { provideApolloClient } from '@vue/apollo-composable'
import { useLocalStorage } from '@vueuse/core'
import { watch, computed } from 'vue'
import { apolloClient } from '../apollo'
import { type RegisterDeviceMutationVariables, useMeQuery, useRegisterDeviceMutation } from '../graphql/generated'

export function useAuth () {
  provideApolloClient(apolloClient)
  const { loading, refetch, result } = useMeQuery({})
  const token = useLocalStorage<null | string>('rs-auth', null)
  const mutation = useRegisterDeviceMutation()

  watch(token, (nT, pT) => {
    console.log('token', nT)
    if (pT === null && nT !== null) {
      void refetch()
    }
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

  const user = computed(() => result.value?.me)
  const isLoggedIn = computed(() => !!result.value?.me)

  return {
    token,
    loading,
    user,
    isLoggedIn,

    register,
    logOut
  }
}
