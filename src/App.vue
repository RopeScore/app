<script setup lang="ts">
import NotificationCards from './components/NotificationCards.vue'
</script>

<template>
  <notification-cards />
  <div class="container mx-auto box-border">
    <router-view />
  </div>
</template>

<style>
* {
  box-sizing: border-box;
  user-select: none;
  touch-action: manipulation;
}

.grid-rows-score {
  grid-template-rows: 9vh repeat(3, calc((82vh - 2rem) / 3));
}

.touch-manipulation {
  touch-action: manipulation;
}

.tap-transparent {
  -webkit-tap-highlight-color: transparent;
}
</style>
