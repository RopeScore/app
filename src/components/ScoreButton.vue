<template>
  <button
    class="rounded select-none p-1 touch-manipulation hover:outline-none focus:outline-none outline-none tap-transparent disabled:cursor-default disabled:filter disabled:saturate-50"
    :class="{
      'bg-green-500': color === 'green' && !(selected || focus),
      'bg-green-600': color === 'green' && (selected || focus),

      'bg-orange-500': color === 'orange' && !(selected || focus),
      'bg-orange-600': color === 'orange' && (selected || focus),

      'bg-red-500': color === 'red' && !(selected || focus),
      'bg-red-600': color === 'red' && (selected || focus),

      'bg-indigo-500': color === 'indigo' && !(selected || focus),
      'bg-indigo-600': color === 'indigo' && (selected || focus),

      'bg-white': color === 'none',

      'cursor-pointer': color !== 'none',
      'm-2': color !== 'none',
      'text-white': color !== 'none',

      'cursor-default': color === 'none',
      'text-black': color === 'none'
    }"
    :disabled="disabled"
    @click.prevent.stop
    @pointerdown.prevent="handleClick()"
    @pointerup="focus = false"
    @pointercancel="focus = false"
    @touchmove.prevent
  >
    <template v-if="value === null || value === undefined">
      {{ label }}
    </template>
    <template v-else-if="!singleRow">
      <span class="text-base sm:text-2xl text-nowrap overflow-hidden">{{ label }}</span>
      <br>
      <span>{{ typeof value === 'number' ? numFmt(value) : value }}</span>
    </template>
    <template v-else>
      {{ label }} ({{ typeof value === 'number' ? numFmt(value) : value }})
    </template>
  </button>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { numFmt } from '../helpers'

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
  selected: Boolean,
  disabled: Boolean,
  singleRow: Boolean
})

const emit = defineEmits<{
  // eslint-disable-next-line @typescript-eslint/prefer-function-type
  (event: 'click'): void
}>()

const focus = ref(false)
function handleClick () {
  if (props.disabled) return

  emit('click')
  focus.value = true
  if (props.color === 'none') return
  navigator.vibrate?.(props.vibration)
}
</script>
