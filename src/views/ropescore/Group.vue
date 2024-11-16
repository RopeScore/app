<template>
  <nav class="grid grid-cols-3 h-header sticky top-0 bg-white z-2">
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

  <div class="p-2 pt-0 sticky top-[9vh] bg-white z-2">
    <h1 class="text-2xl">
      {{ group?.name }}
    </h1>
    <p class="text-gray-600">
      {{ apiDomain ?? '' }}
    </p>

    <div class="grid grid-cols-2 gap-4">
      <score-button
        :label="loading ? 'Loading...' : 'Refresh'"
        single-row
        class="mx-0 py-4"
        color="orange"
        :disabled="loading"
        @click="refetch()"
      />
      <score-button
        label="Scroll to current"
        single-row
        class="mx-0 py-4"
        color="indigo"
        :disabled="enRes.length === 0"
        @click="scrollToHeat(currentHeat)"
      />
    </div>
  </div>

  <div v-if="group" class="flex flex-col gap-4 px-2 my-2">
    <entry-link
      v-for="entry in entries"
      :key="entry.id"
      :entry="entry"
      :scoresheets="(entry.scoresheets as Array<MarkScoresheetFragment & ScoresheetBaseFragment>)"
      :judge="judge!"
      :assignments="judge?.assignments!"
      :group-id="group.id"
      :current-heat="entry.heat === currentHeat"
      @loaded-local="correctScroll()"
    />
  </div>

  <div
    v-if="error"
    class="p-2"
  >
    {{ error }}
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiDomain } from '../../apollo'
import { useAuth } from '../../hooks/auth'
import ScoreButton from '../../components/ScoreButton.vue'
import BatteryStatus from '../../components/BatteryStatus.vue'
import EntryLink from '../../components/EntryLink.vue'
import { type MarkScoresheetFragment, type ScoresheetBaseFragment, useGroupScoresheetsQuery } from '../../graphql/generated'
import { useDebounceFn } from '@vueuse/core'

const auth = useAuth()
const router = useRouter()
const route = useRoute()

const { result, loading, error, refetch } = useGroupScoresheetsQuery({ groupId: route.params.id as string }, () => ({ fetchPolicy: 'cache-and-network', pollInterval: 30_000, enabled: auth.isLoggedIn.value }))

const group = computed(() => result.value?.group)
const judge = computed(() => group.value?.deviceJudge)
const enRes = computed(() => result.value?.group?.entries ?? [])
const currentHeat = computed(() => group.value?.currentHeat ?? 1)

const entries = computed(() =>
  enRes.value
    ? [...enRes.value]
        .filter(en => typeof en.heat === 'number')
        .sort((a, b) => {
          if (a.heat !== b.heat) return (a.heat ?? Infinity) - (b.heat ?? Infinity)
          else if (a.pool !== b.pool) return (a.pool ?? Infinity) - (b.pool ?? Infinity)
          else return a.participant.id.localeCompare(b.participant.id)
        })
    : []
)

watch(result, (newData, oldData) => {
  if (oldData == null && newData?.group?.currentHeat != null) {
    scrollToHeat(currentHeat.value)
  }
}, {
  flush: 'post'
})

function scrollToHeat (heatNumber: number) {
  document.getElementById(`heat-${heatNumber}`)?.scrollIntoView({
    behavior: 'instant',
    block: 'center',
  })
}

const corrected = ref(false)
const correctScroll = useDebounceFn(() => {
  if (corrected.value) return
  corrected.value = true
  void nextTick(() => {
    scrollToHeat(currentHeat.value)
  })
}, 100)
</script>
