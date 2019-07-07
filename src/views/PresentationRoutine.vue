<template>
  <div class="difficulty grid">
    <router-link to="/" tag="button" class="header">Back</router-link>
    <button class="spacer">Pres Score: {{ result }}</button>
    <button class="red header" @click="reset()">{{ resetNext ? 'Press Again' : 'Reset' }}</button>

    <button class="spacer">Entertainment</button>
    <button class="spacer"></button>
    <button class="spacer">Musicality</button>

    <button @click="ent(1)">+</button>
    <button class="spacer">Ent Score: {{ entResult }}</button>
    <button @click="music(1)">+</button>

    <button @click="ent(0)">&#10004;</button>
    <button class="spacer">Musicality Score: {{ musicResult }}</button>
    <button @click="music(0)">&#10004;</button>

    <button @click="ent(-1)">-</button>
    <button class="spacer"></button>
    <button @click="music(-1)">-</button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class PresentationRoutine extends Vue {
  musicMarks: number[] = [];
  entMarks: number[] = [];
  resetNext: boolean = false;

  music(mark: number): void {
    this.musicMarks.push(mark);
    navigator.vibrate(100);
    console.log(this.musicMarks);
  }

  ent(mark: number): void {
    this.entMarks.push(mark);
    navigator.vibrate(100);
    console.log(this.entMarks);
  }

  reset(): void {
    if (!this.resetNext) {
      this.resetNext = true;
      navigator.vibrate(500);
      return;
    }
    this.resetNext = false;
    this.musicMarks.splice(0, this.musicMarks.length);
    this.entMarks.splice(0, this.entMarks.length);
    navigator.vibrate(1000);
    console.log(this.musicMarks, this.entMarks);
  }

  get musicResult(): number | string {
    if (this.musicMarks.length === 0) return "-";
    let sum = this.musicMarks.reduce((a, b) => a + b);
    let avg = sum / this.musicMarks.length;
    let percentage = avg * 0.35;
    return Math.round((1 + percentage) * 100) / 100;
  }

  get entResult(): number | string {
    if (this.entMarks.length === 0) return "-";
    let sum = this.entMarks.reduce((a, b) => a + b);
    let avg = sum / this.entMarks.length;
    let percentage = avg * 0.35;
    return Math.round((1 + percentage) * 100) / 100;
  }

  get result(): number | string {
    let musicResult = this.musicResult;
    let entResult = this.entResult;

    if (musicResult === "-" && entResult === "-") {
      return "-";
    }

    if (musicResult === "-") {
      musicResult = 1;
    }

    if (entResult === "-") {
      entResult = 1;
    }

    return (
      Math.round(
        (((musicResult as number) + (entResult as number)) / 2) * 100
      ) / 100
    );
  }
}
</script>
