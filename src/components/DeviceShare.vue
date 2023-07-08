<template>
  <div
    class="rounded text-white overflow-hidden"
    :class="{
      'bg-green-500': color === 'green',
      'bg-indigo-500': color === 'indigo',
      'bg-gray-500': color === 'gray',
    }"
  >
    <div
      class="w-full relative grid grid-rows-2 p-2"
    >
      <div>
        {{ share.user.name }} <span class="font-sm">({{ share.user.id }})</span>
      </div>
      <div>
        <span class="font-semibold">Expires at:</span> {{ formatDate(share.expiresAt) }}
      </div>
    </div>

    <div v-if="share.status === DeviceStreamShareStatus.Pending" class="grid grid-cols-2 grid-rows-1">
      <button
        class="block flex justify-center align-middle border-t border-r p-2"
        :class="{
          'hover:bg-green-600': color === 'green',
          'hover:bg-indigo-600': color === 'indigo',
          'hover:bg-gray-600': color === 'gray',
        }"
        :disabled="deleteStreamShare.loading.value"
        @click="deleteStreamShare.mutate({ userId: share.user.id })"
      >
        <span v-if="deleteStreamShare.loading.value">Loading...</span>
        <span v-else>Reject</span>
      </button>
      <button
        class="block flex justify-center align-middle border-t border-r p-2"
        :class="{
          'hover:bg-green-600': color === 'green',
          'hover:bg-indigo-600': color === 'indigo',
          'hover:bg-gray-600': color === 'gray',
        }"
        :disabled="createStreamShare.loading.value"
        @click="createStreamShare.mutate({ userId: share.user.id })"
      >
        <span v-if="createStreamShare.loading.value">Loading...</span>
        <span v-else>Accept</span>
      </button>
    </div>

    <div v-else-if="share.status === DeviceStreamShareStatus.Accepted" class="grid grid-cols-1 grid-rows-1">
      <button
        class="block flex justify-center align-middle border-t border-r p-2"
        :class="{
          'hover:bg-green-600': color === 'green',
          'hover:bg-indigo-600': color === 'indigo',
          'hover:bg-gray-600': color === 'gray',
        }"
        :disabled="deleteStreamShare.loading.value"
        @click="deleteStreamShare.mutate({ userId: share.user.id })"
      >
        <span v-if="deleteStreamShare.loading.value">Loading...</span>
        <span v-else>Delete</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { type DeviceStreamShareFragment, DeviceStreamShareStatus, useCreateDeviceStreamShareMutation, useDeleteDeviceStreamShareMutation } from '../graphql/generated'
import { type PropType } from 'vue'
import { formatDate } from '../helpers'

defineProps({
  share: {
    type: Object as PropType<DeviceStreamShareFragment>,
    required: true
  },
  color: {
    validator (value: unknown) {
      return typeof value === 'string' &&
    ['green', 'indigo', 'gray'].includes(value)
    },
    default: 'green'
  }
})

const createStreamShare = useCreateDeviceStreamShareMutation({
  refetchQueries: ['DeviceStreamShares'],
  awaitRefetchQueries: true
})
const deleteStreamShare = useDeleteDeviceStreamShareMutation({
  refetchQueries: ['DeviceStreamShares'],
  awaitRefetchQueries: true
})
</script>
