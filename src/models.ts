import { type Component, defineAsyncComponent } from 'vue'

export interface Option {
  name: string
  prop: string
  type: 'boolean' // TODO implement others
}

export interface Model {
  rulesId: string | string[]
  judgeType: string | string[]
  name: string
  allowScroll?: boolean
  component: Component
  localAlternativeCompetitionEvents?: Array<[string, string]>
  localOptions?: Option[]
  hidden?: boolean
}

const models: Model[] = [
  {
    rulesId: ['ijru@1.1.0', 'ijru@2.0.0', 'ijru@3.0.0', 'svgf-rh@2020', 'svgf-par@2.0.0', 'svgf-vh@2023'],
    judgeType: 'S',
    name: 'Speed',
    component: defineAsyncComponent(async () => import('./views/scoring/ijru@1.1.0/Speed.vue'))
  },
  {
    rulesId: ['ijru@1.1.0', 'ijru@2.0.0', 'ijru@3.0.0', 'svgf-rh@2020', 'svgf-par@2.0.0'],
    judgeType: 'Shj',
    name: 'Speed Head Judge',
    component: defineAsyncComponent(async () => import('./views/scoring/ijru@1.1.0/Speed.vue')),
    localAlternativeCompetitionEvents: [
      ['False Switches', 'e.ijru.sp.sr.srsr.4.4x30'],
      ['No Switches', 'e.ijru.sp.sr.srss.1.30']
    ]
  },

  {
    rulesId: ['ijru@1.1.0', 'ijru@2.0.0', 'svgf-par@2.0.0'],
    judgeType: 'D',
    name: 'Difficulty',
    component: defineAsyncComponent(async () => import('./views/scoring/ijru@1.1.0/Difficulty.vue'))
  },
  {
    rulesId: 'ijru@3.0.0',
    judgeType: 'D',
    name: 'Difficulty',
    component: defineAsyncComponent(async () => import('./views/scoring/ijru@3.0.0/Difficulty.vue'))
  },

  {
    rulesId: ['ijru@2.0.0', 'svgf-par@2.0.0'],
    judgeType: 'Pa',
    name: 'Athlete Presentation',
    component: defineAsyncComponent(async () => import('./views/scoring/ijru@2.0.0/AthletePresentation.vue'))
  },
  {
    rulesId: 'ijru@3.0.0',
    judgeType: 'Pa',
    name: 'Athlete Presentation',
    component: defineAsyncComponent(async () => import('./views/scoring/ijru@3.0.0/AthletePresentation.vue'))
  },

  {
    rulesId: ['ijru@2.0.0', 'svgf-par@2.0.0'],
    judgeType: 'Pr',
    name: 'Routine Presentation',
    component: defineAsyncComponent(async () => import('./views/scoring/ijru@2.0.0/RoutinePresentation.vue'))
  },
  {
    rulesId: 'ijru@3.0.0',
    judgeType: 'Pr',
    name: 'Routine Presentation',
    component: defineAsyncComponent(async () => import('./views/scoring/ijru@3.0.0/RoutinePresentation.vue'))
  },

  {
    rulesId: ['ijru@2.0.0', 'svgf-par@2.0.0'],
    judgeType: 'R',
    name: 'Required Elements',
    component: defineAsyncComponent(async () => import('./views/scoring/ijru@2.0.0/RequiredElements.vue')),
    localAlternativeCompetitionEvents: [
      ['Individual Single Rope', 'e.ijru.fs.sr.srif.1.75'],
      ['Pair/Team Single Rope, and Wheel', 'e.ijru.fs.sr.srtf.4.75'],
      ['Double Dutch Single Freestyle', 'e.ijru.fs.dd.ddsf.3.75'],
      ['Double Dutch Other', 'e.ijru.fs.dd.ddpf.4.75']
    ]
  },
  {
    rulesId: 'ijru@3.0.0',
    judgeType: 'R',
    name: 'Required Elements',
    component: defineAsyncComponent(async () => import('./views/scoring/ijru@3.0.0/RequiredElements.vue')),
    localAlternativeCompetitionEvents: [
      ['Individual Single Rope', 'e.ijru.fs.sr.srif.1.75'],
      ['Pair/Team Single Rope, and Wheel', 'e.ijru.fs.sr.srtf.4.75'],
      ['Double Dutch Single Freestyle', 'e.ijru.fs.dd.ddsf.3.75'],
      ['Double Dutch Other', 'e.ijru.fs.dd.ddpf.4.75']
    ]
  },

  {
    rulesId: 'svgf-rh@2020',
    judgeType: 'D',
    name: 'Difficulty',
    component: defineAsyncComponent(async () => import('./views/scoring/svgf-rh@2020/Difficulty.vue'))
  },
  {
    rulesId: 'svgf-rh@2020',
    judgeType: 'P',
    name: 'Presentation',
    allowScroll: true,
    component: defineAsyncComponent(async () => import('./views/scoring/svgf-rh@2020/Presentation.vue')),
    localAlternativeCompetitionEvents: [
      ['Single Rope', 'e.ijru.fs.sr.srif.1.75'],
      ['Double Dutch', 'e.ijru.fs.dd.ddpf.4.75']
    ]
  },

  {
    rulesId: 'svgf-vh@2023',
    judgeType: 'D',
    name: 'Difficulty',
    component: defineAsyncComponent(async () => import('./views/scoring/svgf-vh@2023/Difficulty.vue'))
  },
  {
    rulesId: 'svgf-vh@2023',
    judgeType: 'O',
    name: 'Obligatoriska',
    component: defineAsyncComponent(async () => import('./views/scoring/svgf-vh@2023/Obligatoriska.vue'))
  },
  {
    rulesId: 'svgf-vh@2023',
    judgeType: 'P',
    name: 'Presentation',
    component: defineAsyncComponent(async () => import('./views/scoring/svgf-vh@2023/Presentation.vue')),
    localAlternativeCompetitionEvents: [
      ['Single Rope', 'e.ijru.fs.sr.srif.1.75'],
      ['Double Dutch', 'e.ijru.fs.dd.ddpf.4.75']
    ]
  },
  {
    rulesId: 'svgf-vh@2023',
    judgeType: 'T',
    name: 'Timing',
    component: defineAsyncComponent(async () => import('./views/scoring/svgf-vh@2023/Timing.vue'))
  },

  {
    rulesId: 'experiments',
    judgeType: 'P',
    name: 'Simplified Presentation',
    component: defineAsyncComponent(async () => import('./views/scoring/experiments/SimplifiedPresentation.vue')),
    hidden: true,
    localOptions: [
      { prop: 'scale5', name: '5-grade scale', type: 'boolean' }
    ]
  }
]

export default models
