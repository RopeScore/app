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
  touch-action: manipulation;
}

.grid-rows-score {
  grid-template-rows: 6vh repeat(3, 28vh);
}

.touch-manipulation {
  touch-action: manipulation;
}

.tap-transparent {
  -webkit-tap-highlight-color: transparent;
}
</style>
