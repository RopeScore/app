import { Component, defineAsyncComponent } from "vue"

export interface Model {
  rulesId: string | string[]
  judgeType: string | string[],
  name: string
  component: Component
  localAlternativeCompetitionEvents?: Array<[string, string]>
}

const models: Model[] = [
  {
    rulesId: ['ijru@1.1.0', 'ijru@2.0.0'],
    judgeType: 'S',
    name: 'Speed',
    component: defineAsyncComponent(() => import('./views/scoring/ijru@1.1.0/Speed.vue')),
  },
  {
    rulesId: ['ijru@1.1.0', 'ijru@2.0.0'],
    judgeType: 'Shj',
    name: 'Speed Head Judge',
    component: defineAsyncComponent(() => import('./views/scoring/ijru@1.1.0/Speed.vue'))
  },
  {
    rulesId: ['ijru@1.1.0', 'ijru@2.0.0'],
    judgeType: 'D',
    name: 'Difficulty',
    component: defineAsyncComponent(() => import('./views/scoring/ijru@1.1.0/Difficulty.vue'))
  },
  {
    rulesId: 'ijru@2.0.0',
    judgeType: 'Pa',
    name: 'Athlete Presentation',
    component: defineAsyncComponent(() => import('./views/scoring/ijru@2.0.0/AthletePresentation.vue'))
  },
  {
    rulesId: 'ijru@2.0.0',
    judgeType: 'Pr',
    name: 'Routine Presentation',
    component: defineAsyncComponent(() => import('./views/scoring/ijru@2.0.0/RoutinePresentation.vue'))
  },
  {
    rulesId: 'ijru@2.0.0',
    judgeType: 'R',
    name: 'Required Elements',
    component: defineAsyncComponent(() => import('./views/scoring/ijru@2.0.0/RequiredElements.vue')),
    localAlternativeCompetitionEvents: [
      ['Individual Single Rope', 'e.ijru.fs.sr.srif.1.75'],
      ['Pair/Team Single Rope, and Wheel', 'e.ijru.fs.sr.srtf.4.75'],
      ['Double Dutch Single Freestyle', 'e.ijru.fs.dd.ddsf.3.75'],
      ['Double Dutch Other', 'e.ijru.fs.dd.ddpf.4.75'],
    ]
  },
]

export default models
