<template>
  <div class="difficulty grid">
    <router-link to="/" tag="button" class="header">Back</router-link>
    <button class="spacer"></button>
    <button class="red header" @click="reset()">{{ resetNext ? 'Press Again' : 'Reset' }}</button>

    <button v-for="_ in [4,5,6]" class="spacer" :key="_"></button>


    <template v-if="!diffOpen">
    <button class="spacer"></button>
    <button @click="miss('spa')" class="red">
      Space Violations
      <br />
      {{ misses.spa.length }}
    </button>
    <button class="spacer"></button>

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
    <button @click="openDiff" class="red">
      Repeated Skills
      <br/>
      {{ misses.rep.length }}
    </button>
    <button @click="miss('tis')">
      Turner Involvement
      <br />
      {{ misses.tis.length }}
    </button>

    </template>

    <template v-else>
      <button
        v-for="level in [1,.5,4,2,7,5,3,8,6]"
        :key="level"
        @click="rep(level)"
        :class="{purple: level === 7 || level === 8}"
      >
        Level {{ level }}
        <br/>
        {{ levels[level] || 0 }}
      </button>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

interface MissesDD {
  tis: boolean[];
  pow: boolean[];
  int: boolean[];

  spa: boolean[];
  tim: boolean[];
  mis: boolean[];

  rep: number[];
}

@Component
export default class DeductionsDD extends Vue {
  resetNext: boolean = false;
  diffOpen: boolean = false;

  misses: MissesDD = {
    tis: [],
    pow: [],
    int: [],

    spa: [],
    tim: [],
    mis: [],

    rep: []
  };

 miss(type: keyof Omit<MissesDD, 'rep'>): void {
    this.misses[type].push(true);
    navigator.vibrate(100);
  }

  rep(level: number): void {
    this.diffOpen = false;
    this.misses.rep.push(level)
    navigator.vibrate(150)
  }

  openDiff(): void {
    this.diffOpen = true;
    navigator.vibrate(150);
  }

  get levels() {
    return this.misses.rep.reduce((acc, lev) => {
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

    (Object.keys(this.misses) as Array<keyof MissesDD>).forEach(key => {
      this.misses[key].splice(0, this.misses[key].length);
    });
    navigator.vibrate(1000);
  }
}
</script>
