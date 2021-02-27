<template>
  <button
    class="text-white rounded select-none m-2"
    :class="{
      'bg-green-500': color === 'green',
      'hover:bg-green-600': color === 'green',
      'bg-red-500': color === 'red',
      'hover:bg-red-600': color === 'red',
      'bg-indigo-500': color === 'indigo',
      'hover:bg-indigo-600': color === 'indigo',
    }"
    @click="handleClick()"
  >
    <template v-if="value === null || value === undefined">
      {{label}}
    </template>
    <template v-else-if="!singleRow">
      {{ label }}
      <br />
      {{ value }}
    </template>
    <template v-else>
      {{label}} ({{ value }})
    </template>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ScoreButton',
  props: {
    color: {
      validator (value: unknown) {
        return typeof value === 'string' &&
          ['green', 'red', 'indigo'].includes(value)
      },
      default: 'green'
    },
    label: {
      type: String,
      required: true
    },
    value: {
      type: [String, Number]
    },
    vibration: {
      type: Number,
      default: 100
    },
    singleRow: Boolean
  },
  methods: {
    handleClick () {
      navigator.vibrate?.(this.vibration)
    }
  }
})
</script>
