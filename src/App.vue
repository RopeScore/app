<template>
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
  grid-template-rows: 9vh repeat(3, calc(82vh / 3));
}

.touch-manipulation {
  touch-action: manipulation;
}

.tap-transparent {
  -webkit-tap-highlight-color: transparent;
}
</style>
