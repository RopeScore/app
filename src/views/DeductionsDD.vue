<template>
  <div class="difficulty grid">
    <router-link to="/" tag="button" class="header">Back</router-link>
    <button class="spacer"></button>
    <button class="red header" @click="reset()">{{ resetNext ? 'Press Again' : 'Reset' }}</button>

    <button v-for="_ in [4,5,6]" class="spacer" :key="_"></button>

    <button @click="miss('tis')">
      Turner Involvement
      <br />
      {{ misses.tis.length }}
    </button>
    <button @click="miss('spa')" class="red">
      Space Violations
      <br />
      {{ misses.spa.length }}
    </button>
    <button @click="miss('ath')">
      Skills by Each Athlete
      <br />
      {{ misses.ath.length }}
    </button>

    <button @click="miss('pow')">
      Gymnastics Power
      <br />
      {{ misses.pow.length }}
    </button>
    <button @click="miss('tim')" class="red">
      Time Violations
      <br />
      {{ misses.tim.length }}
    </button>
    <button @click="miss('int')">
      Interactions
      <br />
      {{ misses.int.length }}
    </button>

    <button @click="miss('mis')" class="red">
      Misses
      <br />
      {{ misses.mis.length }}
    </button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

interface MissesDD {
  tis: boolean[];
  ath: boolean[];
  pow: boolean[];
  int: boolean[];

  spa: boolean[];
  tim: boolean[];
  mis: boolean[];
  [selector: string]: boolean[];
}

@Component
export default class DeductionsDD extends Vue {
  resetNext: boolean = false;

  misses: MissesDD = {
    tis: [],
    ath: [],
    pow: [],
    int: [],

    spa: [],
    tim: [],
    mis: []
  };

  miss(type: string): void {
    this.misses[type].push(true);
    navigator.vibrate(100);
  }

  reset(): void {
    if (!this.resetNext) {
      this.resetNext = true;
      navigator.vibrate(500);
      return;
    }
    this.resetNext = false;

    Object.keys(this.misses).forEach(key => {
      this.misses[key].splice(0, this.misses[key].length);
    });
    navigator.vibrate(1000);
  }
}
</script>
