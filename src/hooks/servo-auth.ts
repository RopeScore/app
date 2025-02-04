import { StorageSerializers, isObject, useLocalStorage, useTimeoutPoll } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import { v4 as uuid } from 'uuid'
import useNotifications from './notifications'

interface TokenRequest {
  token_request_uri: string
  // Event name
  description: string
  // Show this to the user
  user_prompt: string
  // Or just this code
  code: string
  // Or let them open this URL and enter the code
  // or scan a QR and with the complete URI
  verification_uri: string | null
  verification_uri_complete: string | null
  available: boolean
  profile: 'judgeClientSimple'
  profile_version: '1.0'
}
function isTokenRequest (x: unknown): x is TokenRequest {
  return isObject(x) && 'profile' in x && x.profile === 'judgeClientSimple'
}

// interface KeepTryingResponse {
//   result: 'keep_trying'
// }
// function isKeepTryingResponse (x: unknown): x is KeepTryingResponse {
//   return isObject(x) && 'result' in x && x.result === 'keep_trying'
// }

interface TokenResponse {
  access_token: string
  token_type: 'bearer'
  // TODO handle by clearing auth near this time
  expires_in: number
  assignment_code: `${number}-${number}`
  // ex: "Judge 1"
  assignment_label: string
  scoring_base_url: string
  result: 'success'
}
function isTokenResponse (x: unknown): x is TokenResponse {
  return isObject(x) && 'result' in x && x.result === 'success' && 'access_token' in x
}

export function useServoAuth () {
  const { push: pushNotification } = useNotifications()
  const deviceId = useLocalStorage<string>('servo-device-id', uuid())
  const tokenInfo = useLocalStorage<TokenResponse | null>('servo-auth', null, { serializer: StorageSerializers.object })
  const token = computed(() => tokenInfo.value?.access_token)
  const baseUrl = computed(() => tokenInfo.value?.scoring_base_url)

  const assignment = computed(() => tokenInfo.value
    ? {
        assignmentCode: tokenInfo.value.assignment_code,
        assignmentLabel: tokenInfo.value.assignment_label
      }
    : undefined)
  const loading = computed(() => !!initFetching.value || pendingAuthFlow.value != null)

  const initFetching = ref(false)
  const error = ref<string>()

  const pendingAuthFlow = ref<TokenRequest>()
  const prompt = computed(() => pendingAuthFlow.value
    ? {
        text: pendingAuthFlow.value.user_prompt,
        code: pendingAuthFlow.value.code,
        uri: pendingAuthFlow.value.verification_uri,
        uriComplete: pendingAuthFlow.value.verification_uri_complete,
      }
    : undefined)
  const tokenRequestUri = computed(() => {
    if (pendingAuthFlow.value == null) return undefined
    try {
      return new URL(pendingAuthFlow.value.token_request_uri)
    } catch {
      return undefined
    }
  })

  async function initialize (accessCode: string, options?: { signal: AbortSignal }) {
    if (initFetching.value) return
    initFetching.value = true
    error.value = undefined

    try {
      const url = new URL(accessCode)
      url.searchParams.append('profile', 'judgeClientSimple')
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        body: new URLSearchParams({
          grant_type: 'password'
        }),
        signal: options?.signal
      })
      if (!response.ok) {
        const body = await response.text()
        pushNotification({ message: body, type: 'server' })
        throw new Error(`Request to ${url.href} failed with status code ${response.status} and body ${body}`)
      }
      const body = await response.json()
      if (!isTokenRequest(body)) throw new Error('Got invalid response from scoring', { cause: body })

      pendingAuthFlow.value = body
    } catch (err) {
      console.error(err)
      initFetching.value = false
      if (err instanceof Error) {
        error.value = err.message
      }
    }
  }

  const tokenPoll = useTimeoutPoll(async () => {
    if (!tokenRequestUri.value) return
    const response = await fetch(tokenRequestUri.value, {
      method: 'POST'
    })
    if (!response.ok) {
      const body = await response.text()
      pushNotification({ message: body, type: 'server' })
      throw new Error(`Request to ${tokenRequestUri.value.href} failed with status code ${response.status} and body ${body}`)
    }
    const body = await response.json()

    if (isTokenResponse(body)) {
      tokenInfo.value = body
      pendingAuthFlow.value = undefined
    }
  }, 1000, { immediate: false })
  watch(() => tokenRequestUri.value, newUri => {
    if (newUri != null) tokenPoll.resume()
    else tokenPoll.pause()
  }, { immediate: true })

  function logOut () {
    tokenInfo.value = null
    pendingAuthFlow.value = undefined
    initFetching.value = false
    error.value = undefined
  }

  if (token.value) {
    try {
      const claims = JSON.parse(atob(token.value.split('.')[1]))
      if (Number.isSafeInteger(claims.exp) && claims.exp < (Date.now() / 1000)) {
        logOut()
      }
    } catch (err) {
      console.error('Failed to determine token expiry', err)
    }
  }

  return {
    token,
    baseUrl,
    deviceId,
    assignment,
    prompt,

    error,
    loading,

    initialize,
    logOut
  }
}
