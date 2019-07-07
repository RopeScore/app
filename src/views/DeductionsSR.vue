<template>
  <div class="difficulty grid">
    <router-link to="/" tag="button" class="header">Back</router-link>
    <button class="spacer"></button>
    <button class="red header" @click="reset()">{{ resetNext ? 'Press Again' : 'Reset' }}</button>

    <button v-for="_ in [4,5,6]" class="spacer" :key="_"></button>

    <button @click="mul.push(true)">
      Multiples
      <br />
      {{ mul.length }}
    </button>
    <button @click="spa.push(true)" class="red">
      Space Violations
      <br />
      {{ spa.length }}
    </button>
    <button @click="rel.push(true)">
      Wraps Releases
      <br />
      {{ rel.length }}
    </button>

    <button @click="pow.push(true)">
      Gymnastics Power
      <br />
      {{ pow.length }}
    </button>
    <button @click="tim.push(true)" class="red">
      Time Violations
      <br />
      {{ tim.length }}
    </button>
    <button @click="int.push(true)">
      Interactions
      <br />
      {{ int.length }}
    </button>

    <button @click="mis.push(true)" class="red">
      Misses
      <br />
      {{ mis.length }}
    </button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class presentationAthlete extends Vue {
  resetNext: boolean = false;

  mul: boolean[] = [];
  rel: boolean[] = [];
  pow: boolean[] = [];
  int: boolean[] = [];

  spa: boolean[] = [];
  tim: boolean[] = [];
  mis: boolean[] = [];

  reset(): void {
    if (!this.resetNext) {
      this.resetNext = true;
      return;
    }
    this.resetNext = false;

    for (let type of ["mul", "spa", "pow", "int", "rel", "tim", "mis"]) {
      console.log(type);
      this[type].splice(0, this[type].length);
    }
  }
}
</script>
