<template>
  <div class="home">
    <nav class="grid">
      <button class="spacer"></button>
      <button class="spacer">IJRU Judge Trainer</button>
      <button class="spacer"></button>
      <button v-for="_ in [4,5,6]" class="spacer" :key="_"></button>
      <router-link to="/difficulty" tag="button" class="button">Difficulty</router-link>
      <router-link to="/presentation/athlete" tag="button" class="button">Athlete Presentation</router-link>
      <router-link to="/presentation/routine" tag="button" class="button">Routine Presentation</router-link>
      <router-link to="/deductions/sr" tag="button" class="button">Deductions SR</router-link>
      <router-link to="/deductions/dd" tag="button" class="button">Deductions DD</router-link>
    </nav>
  </div>
</template>