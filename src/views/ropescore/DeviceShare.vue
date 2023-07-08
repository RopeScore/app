<template>
  <nav class="grid grid-cols-3 h-header">
    <score-button
      label="Back"
      single-row
      @click="router.go(-1)"
    />
    <div
      v-if="auth.loading.value"
      class="flex justify-center items-center text-2xl"
    >
      Connecting
    </div>
    <div
      v-else
      class="flex justify-center items-center text-3xl font-bold"
    >
      {{ auth.user.value?.id }}
    </div>
    <battery-status />
  </nav>

  <template v-if="auth.token.value">
    <div class="grid grid-cols-1 grid-rows-[5rem]">
      <score-button
        :label="loading ? 'Loading...' : 'Refresh'"
        :disabled="loading"
        @click="refetch()"
      />
    </div>
    <h2 class="font-semibold text-2xl mt-4 px-2">
      Pending Requests
    </h2>
    <div class="flex flex-col gap-4 px-2">
      <device-share
        v-for="share of pendingShares"
        :key="share.id"
        :share="share"
        color="indigo"
      />

      <div v-if="pendingShares.length === 0">
        No pending requests
      </div>
    </div>

    <h2 class="font-semibold text-2xl mt-4 px-2">
      Current Shares
    </h2>
    <div class="flex flex-col gap-4 px-2">
      <device-share
        v-for="share of acceptedShares"
        :key="share.id"
        :share="share"
      />
      <div v-if="acceptedShares.length === 0">
        No active shares
      </div>
    </div>
  </template>

  <form v-else class="px-2">
    <h1 class="font-semibold text-2xl mt-4 px-2">
      Register
    </h1>
    <text-field v-model="newName" label="Device name" />

    <note-card>
      Note that app scoring will send and store data in the cloud,
      Swantzter is the data controller for this and can be reached on
      <a
        class="text-blue-700 hover:text-blue-900 underline"
        href="mailto:privacy@swantzter.se"
        target="_blank"
      >privacy@swantzter.se</a>.
      Please make sure you have read the (short and simple!) privacy policy
      available on
      <a
        class="text-blue-700 hover:text-blue-900 underline"
        href="https://ropescore.com/privacy"
        target="_blank"
      >https://ropescore.com/privacy</a>
    </note-card>

    <score-button label="Register" single-row class="w-full mx-0 h-20" @click="auth.register({ name: newName })" />
  </form>

  <div
    v-if="loading"
    class="p-2"
  >
    Loading...
  </div>

  <div
    v-if="error"
    class="p-2"
  >
    {{ error }}
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../hooks/auth'
import { DeviceStreamShareStatus, useDeviceStreamSharesQuery } from '../../graphql/generated'

import ScoreButton from '../../components/ScoreButton.vue'
import BatteryStatus from '../../components/BatteryStatus.vue'
import DeviceShare from '../../components/DeviceShare.vue'
import { TextField, NoteCard } from '@ropescore/components'

const auth = useAuth()
const router = useRouter()

const newName = ref('')

const { result, loading, error, refetch } = useDeviceStreamSharesQuery({
  fetchPolicy: 'cache-and-network',
  pollInterval: 30_000,
  enabled: auth.isLoggedIn as unknown as boolean
})

const shares = computed(() => result.value?.me?.__typename === 'Device' ? result.value.me.streamShares : [])
const pendingShares = computed(() => shares.value.filter(sh => sh.status === DeviceStreamShareStatus.Pending))
const acceptedShares = computed(() => shares.value.filter(sh => sh.status === DeviceStreamShareStatus.Accepted))
</script>
