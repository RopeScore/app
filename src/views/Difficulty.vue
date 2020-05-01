<template>
  <div class="difficulty grid">
    <router-link to="/" tag="button" class="header">Back</router-link>
    <button class="spacer">Score: {{ result }}</button>
    <button class="red header" @click="reset()">{{ resetNext ? 'Press Again' : 'Reset' }}</button>
    <button v-for="_ in [4,5,6]" class="spacer" :key="_"></button>

    <button
      v-for="level in [1,.5,4,2,7,5,3,8,6]"
      :key="level"
      @click="score(level)"
      :class="{purple: level === 7 || level === 8}"
    >
      Level {{ level }}
      <br/>
      {{ levels[level] || 0 }}
    </button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class Difficulty extends Vue {
  scores: number[] = [];
  resetNext: boolean = false;

  score(level: number): void {
    this.scores.push(level);
    navigator.vibrate(100);
  }

  L(level: number): number {
    if (level === 0) return 0;
    return Math.round(Math.pow(1.8, level) * 10) / 100;
  }

  get levels() {
    return this.scores.reduce((acc, lev) => {
      if (!acc[lev]) acc[lev] = 0
      acc[lev] += 1
      return acc
    }, {} as { [prop: string]: number })
  }

  reset(): void {
    if (!this.resetNext) {
      this.resetNext = true;
      navigator.vibrate(500);
      return;
    }
    this.resetNext = false;
    this.scores.splice(0, this.scores.length);
    navigator.vibrate(1000);
  }

  get result(): number | string {
    if (this.scores.length === 0) return "-";
    return (
      Math.round(
        this.scores.map(level => this.L(level)).reduce((a, b) => a + b) * 100
      ) / 100
    );
  }
}
</script>
