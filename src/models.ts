/* eslint-disable @typescript-eslint/consistent-type-imports */
import { type Component, defineAsyncComponent } from 'vue'
import { calculateTally, convertMarksToServoIntermediate, type ServoIntermediateScoresheet } from './hooks/scoresheet'

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

  // I would kind alike this broken out somehow, but this will do for now
  converters?: {
    servo?: (scoresheet: ServoIntermediateScoresheet<any>) => Record<string, unknown>
  }
}

function servoDdc2023Converter (scoresheet: ServoIntermediateScoresheet<import('./views/scoring/ddc@2023/Judge.vue').Schema>) {
  const tally = calculateTally(scoresheet.marks)
  const scores = {
    Score: tally.score ?? 0,
    Bonus: tally.bonus ?? 0,
    Misses: tally.miss ?? 0
  }
  return scores
}

function servoSpeedConverter (scoresheet: ServoIntermediateScoresheet<import('./views/scoring/ijru@1.1.0/Speed.vue').Schema>) {
  const scores = {
    Clicks: 0,
    ClickTimes: [] as number[]
  }
  const marks = convertMarksToServoIntermediate(scoresheet.marks, scoresheet)
  for (const mark of marks) {
    switch (mark.schema) {
      case 'step': {
        scores.Clicks += mark.value ?? 1
        scores.ClickTimes.push(mark.timestamp)
        break
      }
    }
  }
  return scores
}

const models: Model[] = [
  {
    rulesId: ['ijru@1.1.0', 'ijru@2.0.0', 'ijru@3.0.0', 'svgf-rh@2020', 'svgf-par@2.0.0', 'svgf-vh@2023', 'ijru.speed.2020'],
    judgeType: 'S',
    name: 'Speed',
    component: defineAsyncComponent(async () => import('./views/scoring/ijru@1.1.0/Speed.vue')),
    converters: {
      servo: servoSpeedConverter
    }
  },
  {
    rulesId: ['ijru@1.1.0', 'ijru@2.0.0', 'ijru@3.0.0', 'svgf-rh@2020', 'svgf-par@2.0.0', 'ijru.speed.2020'],
    judgeType: 'Shj',
    name: 'Speed Head Judge',
    component: defineAsyncComponent(async () => import('./views/scoring/ijru@1.1.0/Speed.vue')),
    localAlternativeCompetitionEvents: [
      ['False Switches', 'e.ijru.sp.sr.srsr.4.4x30'],
      ['No Switches', 'e.ijru.sp.sr.srss.1.30']
    ],
    converters: {
      servo: servoSpeedConverter
    }
  },

  {
    rulesId: ['ijru@1.1.0', 'ijru@2.0.0', 'svgf-par@2.0.0'],
    judgeType: 'D',
    name: 'Difficulty',
    component: defineAsyncComponent(async () => import('./views/scoring/ijru@1.1.0/Difficulty.vue'))
  },
  {
    rulesId: ['ijru@3.0.0', 'ijru.freestyle.2023', 'ijru.teamshow.2023'],
    judgeType: 'D',
    name: 'Difficulty',
    component: defineAsyncComponent(async () => import('./views/scoring/ijru@3.0.0/Difficulty.vue')),
    localAlternativeCompetitionEvents: [
      ['Freestyle', 'e.ijru.fs.sr.srif.1.75'],
      ['Show Freestyle', 'e.ijru.fs.ts.sctf.8.300']
    ],
    converters: {
      servo (scoresheet: ServoIntermediateScoresheet<import('./views/scoring/ijru@3.0.0/Difficulty.vue').Schema>) {
        const isShow = scoresheet.competitionEventId.split('.')[3] === 'ts'
        const scores = {
          Level05: 0,
          Level1: 0,
          Level2: 0,
          Level3: 0,
          Level4: 0,
          Level5: 0,
          Level6: 0,
          Level7: 0,
          Level8: 0,
          SkillLevels: [] as number[],
          SkillTimes: [] as number[],

          ...(isShow
            ? {}
            : {
                NumRepeated: 0,
                RepeatedSkillTimes: [] as number[]
              }
          )
        }
        const marks = convertMarksToServoIntermediate(scoresheet.marks, scoresheet)
        for (const mark of marks) {
          if (mark.schema.startsWith('diffL')) {
            const level = mark.schema === 'diffL0.5' ? 0.5 : parseInt(mark.schema.substring(5), 10)
            const levelName = mark.schema.substring(5).replaceAll('.', '') as unknown as '05' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8'

            scores[`Level${levelName}`] += mark.value ?? 1
            scores.SkillLevels.push(level)
            scores.SkillTimes.push(mark.timestamp)
          } else if (mark.schema === 'rep' && !isShow) {
            scores.NumRepeated += mark.value ?? 1
            scores.RepeatedSkillTimes.push(mark.timestamp)
          }
        }
        return scores
      }
    }
  },

  {
    rulesId: ['ijru@2.0.0', 'svgf-par@2.0.0'],
    judgeType: 'Pa',
    name: 'Athlete Presentation',
    component: defineAsyncComponent(async () => import('./views/scoring/ijru@2.0.0/AthletePresentation.vue'))
  },
  {
    rulesId: ['ijru@3.0.0', 'ijru.freestyle.2023', 'ijru.teamshow.2023'],
    judgeType: 'Pa',
    name: 'Athlete Presentation',
    localAlternativeCompetitionEvents: [
      ['Freestyle', 'e.ijru.fs.sr.srif.1.75'],
      ['Show Freestyle', 'e.ijru.fs.ts.sctf.8.300']
    ],
    component: defineAsyncComponent(async () => import('./views/scoring/ijru@3.0.0/AthletePresentation.vue')),
    converters: {
      servo (scoresheet: ServoIntermediateScoresheet<import('./views/scoring/ijru@3.0.0/AthletePresentation.vue').Schema>) {
        const isShow = scoresheet.competitionEventId.split('.')[3] === 'ts'
        const scores = {
          FormMinus: 0,
          FormCheck: 0,
          FormPlus: 0,
          Misses: 0,
          FormScores: [] as number[],
          FormTimes: [] as number[],
          MissTimes: [] as number[],

          ...(isShow
            ? {
                StyleMinus: 0,
                StyleCheck: 0,
                StylePlus: 0,
                StyleScores: [] as number[],
                StyleTimes: [] as number[]
              }
            : {})
        }
        const marks = convertMarksToServoIntermediate(scoresheet.marks, scoresheet)
        for (const mark of marks) {
          switch (mark.schema) {
            case 'formExecutionMinus': {
              scores.FormMinus += mark.value ?? 1
              scores.FormScores.push(-1)
              scores.FormTimes.push(mark.timestamp)
              break
            }
            case 'formExecutionCheck': {
              scores.FormCheck += mark.value ?? 1
              scores.FormScores.push(0)
              scores.FormTimes.push(mark.timestamp)
              break
            }
            case 'formExecutionPlus': {
              scores.FormPlus += mark.value ?? 1
              scores.FormScores.push(1)
              scores.FormTimes.push(mark.timestamp)
              break
            }
            case 'miss': {
              scores.Misses += mark.value ?? 1
              scores.MissTimes.push(mark.timestamp)
            }
          }

          if (isShow) {
            switch (mark.schema) {
              case 'styleMinus': {
                scores.StyleMinus += mark.value ?? 1
                scores.StyleScores.push(-1)
                scores.StyleTimes.push(mark.timestamp)
                break
              }
              case 'styleCheck': {
                scores.StyleCheck += mark.value ?? 1
                scores.StyleScores.push(0)
                scores.StyleTimes.push(mark.timestamp)
                break
              }
              case 'stylePlus': {
                scores.StylePlus += mark.value ?? 1
                scores.StyleScores.push(1)
                scores.StyleTimes.push(mark.timestamp)
                break
              }
            }
          }
        }
        return scores
      }
    }
  },

  {
    rulesId: ['ijru@2.0.0', 'svgf-par@2.0.0'],
    judgeType: 'Pr',
    name: 'Routine Presentation',
    component: defineAsyncComponent(async () => import('./views/scoring/ijru@2.0.0/RoutinePresentation.vue'))
  },
  {
    rulesId: ['ijru@3.0.0', 'ijru.freestyle.2023', 'ijru.teamshow.2023'],
    judgeType: 'Pr',
    name: 'Routine Presentation',
    component: defineAsyncComponent(async () => import('./views/scoring/ijru@3.0.0/RoutinePresentation.vue')),
    localAlternativeCompetitionEvents: [
      ['Freestyle', 'e.ijru.fs.sr.srif.1.75'],
      ['Show Freestyle', 'e.ijru.fs.ts.sctf.8.300']
    ],
    converters: {
      servo (scoresheet: ServoIntermediateScoresheet<import('./views/scoring/ijru@3.0.0/RoutinePresentation.vue').Schema>) {
        const scores = {
          EntMinus: 0,
          EntCheck: 0,
          EntPlus: 0,
          MusicMinus: 0,
          MusicCheck: 0,
          MusicPlus: 0,
          EntScores: [] as number[],
          EntTimes: [] as number[],
          MusicScores: [] as number[],
          MusicTimes: [] as number[]
        }
        const marks = convertMarksToServoIntermediate(scoresheet.marks, scoresheet)
        for (const mark of marks) {
          switch (mark.schema) {
            case 'entertainmentMinus': {
              scores.EntMinus += mark.value ?? 1
              scores.EntScores.push(-1)
              scores.EntTimes.push(mark.timestamp)
              break
            }
            case 'entertainmentCheck': {
              scores.EntCheck += mark.value ?? 1
              scores.EntScores.push(0)
              scores.EntTimes.push(mark.timestamp)
              break
            }
            case 'entertainmentPlus': {
              scores.EntPlus += mark.value ?? 1
              scores.EntScores.push(1)
              scores.EntTimes.push(mark.timestamp)
              break
            }
            case 'musicalityMinus': {
              scores.MusicMinus += mark.value ?? 1
              scores.MusicScores.push(-1)
              scores.MusicTimes.push(mark.timestamp)
              break
            }
            case 'musicalityCheck': {
              scores.MusicCheck += mark.value ?? 1
              scores.MusicScores.push(0)
              scores.MusicTimes.push(mark.timestamp)
              break
            }
            case 'musicalityPlus': {
              scores.MusicPlus += mark.value ?? 1
              scores.MusicScores.push(1)
              scores.MusicTimes.push(mark.timestamp)
              break
            }
          }
        }
        return scores
      }
    }
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
    rulesId: ['ijru@3.0.0', 'ijru.freestyle.2023', 'ijru.teamshow.2023'],
    judgeType: 'R',
    name: 'Required Elements',
    component: defineAsyncComponent(async () => import('./views/scoring/ijru@3.0.0/RequiredElements.vue')),
    localAlternativeCompetitionEvents: [
      ['Individual Single Rope', 'e.ijru.fs.sr.srif.1.75'],
      ['Pair/Team Single Rope, and Wheel', 'e.ijru.fs.sr.srtf.4.75'],
      ['Double Dutch Single Freestyle', 'e.ijru.fs.dd.ddsf.3.75'],
      ['Double Dutch Other', 'e.ijru.fs.dd.ddpf.4.75'],
      ['Show Freestyle', 'e.ijru.fs.ts.sctf.8.300']
    ],
    converters: {
      servo (scoresheet: ServoIntermediateScoresheet<import('./views/scoring/ijru@3.0.0/RequiredElements.vue').Schema>) {
        const isShow = scoresheet.competitionEventId.split('.')[3] === 'ts'
        if (isShow) {
          const scores = {
            Misses: 0,
            TimeV: 0,
            MissTimes: [] as number[],
            TimeVTimes: [] as number[],

            SingleRope: 0,
            DoubleDutch: 0,
            Wheel: 0,
            LongRope: 0,
            Traveller: 0,

            SingleRopeTimes: [] as number[],
            DoubleDutchTimes: [] as number[],
            WheelTimes: [] as number[],
            LongRopeTimes: [] as number[],
            TravellerTimes: [] as number[]
          }
          const marks = convertMarksToServoIntermediate(scoresheet.marks, scoresheet)
          for (const mark of marks) {
            switch (mark.schema) {
              case 'miss': {
                scores.Misses += mark.value ?? 1
                scores.MissTimes.push(mark.timestamp)
                break
              }
              case 'timeViolation': {
                scores.TimeV += mark.value ?? 1
                scores.TimeVTimes.push(mark.timestamp)
                break
              }

              case 'rdSingleRope': {
                scores.SingleRope += mark.value ?? 1
                scores.SingleRopeTimes.push(mark.timestamp)
                break
              }
              case 'rdDoubleDutch': {
                scores.DoubleDutch += mark.value ?? 1
                scores.DoubleDutchTimes.push(mark.timestamp)
                break
              }
              case 'rdWheel': {
                scores.Wheel += mark.value ?? 1
                scores.WheelTimes.push(mark.timestamp)
                break
              }
              case 'rdLongRopes': {
                scores.LongRope += mark.value ?? 1
                scores.LongRopeTimes.push(mark.timestamp)
                break
              }
              case 'rdTraveller': {
                scores.Traveller += mark.value ?? 1
                scores.TravellerTimes.push(mark.timestamp)
                break
              }
            }
          }
          return scores
        } else {
          const scores = {
            Misses: 0,
            SpaceV: 0,
            TimeV: 0,
            MissTimes: [] as number[],
            SpaceVTimes: [] as number[],
            TimeVTimes: [] as number[],

            GymPower: 0,
            Interactions: 0,
            Multiples: 0,
            WrapsReleases: 0,
            TurnerInv: 0,

            GymPowerTimes: [] as number[],
            InteractionTimes: [] as number[],
            MultiplesTimes: [] as number[],
            WrapsReleasesTimes: [] as number[],
            TurnerInvolvementTimes: [] as number[]
          }
          const marks = convertMarksToServoIntermediate(scoresheet.marks, scoresheet)
          for (const mark of marks) {
            switch (mark.schema) {
              case 'miss': {
                scores.Misses += mark.value ?? 1
                scores.MissTimes.push(mark.timestamp)
                break
              }
              case 'timeViolation': {
                scores.TimeV += mark.value ?? 1
                scores.TimeVTimes.push(mark.timestamp)
                break
              }
              case 'spaceViolation': {
                scores.SpaceV += mark.value ?? 1
                scores.SpaceVTimes.push(mark.timestamp)
                break
              }

              case 'rqGymnasticsPower': {
                scores.GymPower += mark.value ?? 1
                scores.GymPowerTimes.push(mark.timestamp)
                break
              }
              case 'rqInteractions': {
                scores.Interactions += mark.value ?? 1
                scores.InteractionTimes.push(mark.timestamp)
                break
              }
              case 'rqMultiples': {
                scores.Multiples += mark.value ?? 1
                scores.MultiplesTimes.push(mark.timestamp)
                break
              }
              case 'rqWrapsReleases': {
                scores.WrapsReleases += mark.value ?? 1
                scores.WrapsReleasesTimes.push(mark.timestamp)
                break
              }
              case 'rqTurnerInvolvement': {
                scores.TurnerInv += mark.value ?? 1
                scores.TurnerInvolvementTimes.push(mark.timestamp)
                break
              }
            }
          }
          return scores
        }
      }
    }
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
  },

  {
    rulesId: ['ijru.ddc.2023'],
    judgeType: 'J',
    name: 'Jumper',
    allowScroll: true,
    component: defineAsyncComponent(async () => import('./views/scoring/ddc@2023/Judge.vue')),
    converters: {
      servo: servoDdc2023Converter
    }
  },
  {
    rulesId: ['ijru.ddc.2023'],
    judgeType: 'T',
    name: 'Turner',
    allowScroll: true,
    component: defineAsyncComponent(async () => import('./views/scoring/ddc@2023/Judge.vue')),
    converters: {
      servo: servoDdc2023Converter
    }
  },
  {
    rulesId: ['ijru.ddc.2023'],
    judgeType: 'E',
    name: 'Expression',
    allowScroll: true,
    component: defineAsyncComponent(async () => import('./views/scoring/ddc@2023/Judge.vue')),
    converters: {
      servo: servoDdc2023Converter
    }
  },
  {
    rulesId: ['ijru.ddc.2023'],
    judgeType: 'S',
    name: 'Styling',
    allowScroll: true,
    component: defineAsyncComponent(async () => import('./views/scoring/ddc@2023/Judge.vue')),
    converters: {
      servo: servoDdc2023Converter
    }
  }
]

export default models
