<template>
  <nav class="grid grid-cols-3 h-header">
    <score-button
      label="Back"
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

  <div class="flex flex-col gap-4 px-2">
    <router-link
      v-for="group of groups"
      :key="group.id"
      :to="`/groups/${group.id}`"
      class="bg-green-500 hover:bg-green-600 rounded text-white px-4 py-6 cursor-pointer"
    >
      {{ group.name }}
    </router-link>
  </div>

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
import { useRouter } from 'vue-router'
import { useAuth } from '../hooks/auth'
import ScoreButton from '../components/ScoreButton.vue'
import BatteryStatus from '../components/BatteryStatus.vue'
import { useGroupsQuery } from '../graphql/generated'
import { useResult } from '@vue/apollo-composable'

const auth = useAuth()
const router = useRouter()

const { result, loading, error } = useGroupsQuery(() => ({ fetchPolicy: 'cache-and-network', pollInterval: 30_000, enabled: auth.isLoggedIn.value }))

const groups = useResult(result, [], res => res?.groups)
</script>
