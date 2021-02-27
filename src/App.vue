<template>
<div class="container mx-auto box-border">
  <router-view />
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'App',
})
</script>

<style>
* {
  box-sizing: border-box;
  user-select: none;
}

.grid-rows-score {
  grid-template-rows: 6vh repeat(3, 28vh);
}
</style>
