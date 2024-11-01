<template>
  <div
    v-if="!hidden && !inline"
    class="relative m-2 rounded border border-green-500"
    :class="{ 'border-red-500': lowBattery, 'animate-pulse': !battery.isSupported && needUpdate }"
  >
    <div
      class="absolute left-0 bottom-0 top-0 bg-green-500 text-white battery-width rounded"
      :class="{
        'bg-red-500': lowBattery
      }"
    />
    <div
      v-if="battery.isSupported"
      class="absolute top-4 bottom-4 left-4 right-4 flex justify-center items-center text-white text-stroke-sm text-stroke-black font-bold"
    >
      {{ percentage }} {{ battery.charging.value ? '(c)' : '' }} {{ loading ? '(up)' : '' }}
    </div>
    <div
      v-else
      class="absolute top-4 bottom-4 left-4 right-4 flex justify-center items-center"
    >
      <label>
        <span class="text-white text-stroke-sm text-stroke-black font-bold">Battery Level (%)</span>
        <input
          v-model="manualLevel"
          :disabled="loading"
          type="number"
          min="0"
          max="100"
          step="1"
          class="border border-black rounded w-full"
        >
      </label>
    </div>
  </div>
  <span
    v-else-if="!hidden && inline"
    class="font-mono w-[8ch] inline-block"
    :class="{
      'text-red-500 font-bold animate-ping': lowBattery
    }"
  >
    <template v-if="battery.isSupported">
      {{ percentage }} {{ battery.charging.value ? '(c)' : '' }}
    </template>
    <template v-else>
      {{ manualLevel }} (m)
    </template>
  </span>
</template>

<script lang="ts" setup>
import { watch, computed, ref } from 'vue'
import { useBattery, watchWithFilter, debounceFilter, pausableFilter, useIntervalFn } from '@vueuse/core'
import { useUpdateBatteryMutation } from '../graphql/generated'
import { useAuth } from '../hooks/auth'

const props = defineProps({
  hidden: {
    type: Boolean,
    default: false
  },
  inline: {
    type: Boolean,
    default: false
  },
  noPush: {
    type: Boolean,
    default: false
  }
})

const auth = useAuth()
const battery = useBattery()
const { mutate, loading } = useUpdateBatteryMutation({})

const minWait = 15 * 60 * 1000 // 15 min
const manualLevel = ref<string | null>()
const filter = pausableFilter(debounceFilter(1000))

watch(auth.user, user => {
  if (user?.__typename === 'Device' && typeof user.battery?.batteryLevel === 'number') {
    filter.pause()
    manualLevel.value = user.battery.batteryLevel.toFixed(0)
    setTimeout(() => {
      filter.resume()
    })
  }
})

watch(battery.level, () => {
  if (props.noPush) return
  if (!auth.isLoggedIn.value || !battery.isSupported) return
  void mutate({
    batteryStatus: {
      automatic: true,
      charging: battery.charging.value,
      batteryLevel: Math.round(battery.level.value * 100)
    }
  }).then(() => {
    needUpdate.value = false
  })
})

watchWithFilter(manualLevel, level => {
  if (props.noPush) return
  if (!auth.isLoggedIn.value || !level) return
  void mutate({
    batteryStatus: {
      automatic: false,
      batteryLevel: parseInt(level, 10)
    }
  }).then(() => {
    needUpdate.value = false
  })
}, {
  eventFilter: filter.eventFilter
})

const percentage = computed(() => {
  return `${(battery.isSupported ? Math.round(battery.level.value * 100) : manualLevel.value ?? '0')}%`
})

const lowBattery = computed(() => battery.isSupported ? battery.level.value < 0.2 : parseInt(manualLevel.value ?? '0', 10) < 20)

const needUpdate = ref(false)

useIntervalFn(() => {
  if (props.noPush) return
  if (auth.user.value?.__typename !== 'Device') return
  if (!auth.user.value.battery?.updatedAt || auth.user.value.battery?.updatedAt < Date.now() - minWait) {
    needUpdate.value = true
    if (auth.isLoggedIn.value && !battery.isSupported) {
      void mutate({
        batteryStatus: {
          automatic: true,
          charging: battery.charging.value,
          batteryLevel: Math.round(battery.level.value * 100)
        }
      }).then(() => {
        needUpdate.value = false
      })
    }
  } else needUpdate.value = false
}, 5000)
</script>

<style scoped>
.battery-width {
  width: v-bind(percentage)
}
</style>
