<template>
  <div class="difficulty grid">
    <router-link to="/" tag="button" class="header">Back</router-link>
    <button class="spacer">Pres Score: {{ result }}</button>
    <button class="red header" @click="reset()">{{ resetNext ? 'Press Again' : 'Reset' }}</button>

    <button v-for="_ in [4,5]" class="spacer" :key="_"></button>
    <button class="spacer">Form/Execution</button>

    <button v-for="_ in [7,8]" :key="_" class="spacer"></button>
    <button @click="form(1)">+</button>

    <button v-for="_ in [10,11]" :key="_" class="spacer"></button>
    <button @click="form(0)">&#10004;</button>

    <button @click="miss()" class="red">
      Miss
      <br />
      {{ misses.length }}
    </button>
    <button class="spacer"></button>
    <button @click="form(-1)">-</button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class PresentationAthlete extends Vue {
  formMarks: number[] = [];
  misses: boolean[] = [];
  resetNext: boolean = false;

  form(mark: number): void {
    this.formMarks.push(mark);
    console.log(this.formMarks);
    navigator.vibrate(100);
  }

  miss(): void {
    this.misses.push(true);
    navigator.vibrate(100);
  }

  reset(): void {
    if (!this.resetNext) {
      this.resetNext = true;
      navigator.vibrate(500);
      return;
    }
    this.resetNext = false;
    this.formMarks.splice(0, this.formMarks.length);
    this.misses.splice(0, this.misses.length);
    navigator.vibrate(1000);
    console.log(this.formMarks, this.misses);
  }

  get formResult(): number | string {
    if (this.formMarks.length === 0) return "-";
    let sum = this.formMarks.reduce((a, b) => a + b);
    let avg = sum / this.formMarks.length;
    let percentage = avg * 0.35;
    return Math.round((1 + percentage) * 100) / 100;
  }

  get result(): number | string {
    let formResult = this.formResult;
    if (formResult === "-") {
      return "-";
    }
    if (formResult === "-") {
      formResult = 1;
    }
    return formResult;
  }
}
</script>
