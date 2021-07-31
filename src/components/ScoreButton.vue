<template>
  <button
    class="rounded select-none p-1 touch-manipulation hover:outline-none focus:outline-none outline-none tap-transparent"
    :class="{
      'bg-green-500': color === 'green',
      'hover:bg-green-600': color === 'green' && focus,

      'bg-orange-500': color === 'orange',
      'hover:bg-orange-600': color === 'orange' && focus,

      'bg-red-500': color === 'red',
      'hover:bg-red-600': color === 'red' && focus,

      'bg-indigo-500': color === 'indigo',
      'hover:bg-indigo-600': color === 'indigo' && focus,

      'bg-white': color === 'none',

      'cursor-pointer': color !== 'none',
      'm-2': color !== 'none',
      'text-white': color !== 'none',

      'cursor-default': color === 'none',
      'text-black': color === 'none'
    }"
    @mousedown="focus = true"
    @mouseup="focus = false"
    @touchstart="handleClick()"
    @touchend="focus = false"
  >
    <template v-if="value === null || value === undefined">
      {{ label }}
    </template>
    <template v-else-if="!singleRow">
      {{ label }}
      <br>
      {{ value }}
    </template>
    <template v-else>
      {{ label }} ({{ value }})
    </template>
  </button>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const props = defineProps({
  color: {
    validator (value: unknown) {
      return typeof value === 'string' &&
        ['green', 'red', 'indigo', 'orange', 'none'].includes(value)
    },
    default: 'green'
  },
  label: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    default: undefined
  },
  vibration: {
    type: Number,
    default: 75
  },
  disabled: Boolean,
  singleRow: Boolean
})

const focus = ref(false)
function handleClick () {
  if (props.color === 'none') return
  navigator.vibrate?.(props.vibration)
}
</script>
