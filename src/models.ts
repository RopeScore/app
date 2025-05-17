/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import { type Component, defineAsyncComponent } from 'vue'
import { convertMarksToServoIntermediate, type ScoreTally, type ServoIntermediateScoresheet } from './hooks/scoresheet'
import type { CompetitionEventDefinition } from '@ropescore/rulesets'

export interface BaseOption {
  name: string
  prop: string
  type: string
}

export interface BooleanOption extends BaseOption {
  type: 'boolean'
}

export interface SingleSelectOption extends BaseOption {
  type: 'single-select'
  options: string[]
}

export type Option = BooleanOption | SingleSelectOption

export interface Model {
  rulesId: string | string[]
  judgeType: string | string[]
  name: string
  // TODO: configure allowScroll per step
  allowScroll?: boolean
  component: Component
  localAlternativeCompetitionEvents: CompetitionEventDefinition | Array<[string, CompetitionEventDefinition]>
  localOptions?: Option[]
  hidden?: boolean
  historic?: boolean
  /**
   * If this model has multiple steps that you must pass through before exiting
   * specify their step "id"'s. Clicking "Exit"/"Next" will advance to the next
   * step and pass the current step id as the prop `step` to the model component
   */
  steps?: string[]

  // I would kinda like this broken out somehow, but this will do for now
  converters?: {
    servo?: (scoresheet: ServoIntermediateScoresheet<any>, tally: ScoreTally<string>) => Record<string, unknown>
  }
}

function servoDdc2023Converter (scoresheet: ServoIntermediateScoresheet<import('./views/scoring/ddc@2023/Judge.vue').Schema>, tally: ScoreTally<import('./views/scoring/ddc@2023/Judge.vue').Schema>) {
  const scores: Record<string, number> = {
    Bonus: tally.bonus ?? 0,
    Misses: tally.miss ?? 0
  }
  switch (scoresheet.judgeType) {
    case 'J': {
      scores.Jumper = tally.jumperScore ?? 0
      break
    }
    case 'T': {
      scores.Turner = tally.turnerScore ?? 0
      break
    }
    case 'E': {
      scores.Expression = tally.expressionScore ?? 0
      break
    }
    case 'S': {
      scores.Staging = tally.stagingScore ?? 0
      break
    }
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
    rulesId: ['ijru@1.1.0', 'ijru@2.0.0', 'ijru@3.0.0', 'ijru@4.0.0', 'ijru@4.2.0', 'ijru.speed@1.0.0', 'svgf-rh@2020', 'svgf-rh@2025', 'svgf-par@2.0.0', 'svgf-vh@2023', 'ijru.speed.2020'],
    judgeType: 'S',
    name: 'Speed',
    component: defineAsyncComponent(async () => await import('./views/scoring/ijru@1.1.0/Speed.vue')),
    localAlternativeCompetitionEvents: 'e.ijru.sp.sr.srss.1.30@1.0.0',
    localOptions: [
      {
        type: 'boolean',
        name: 'Minus button',
        prop: 'minusButton'
      }
    ],
    converters: {
      servo: servoSpeedConverter
    }
  },
  {
    rulesId: ['ijru@1.1.0', 'ijru@2.0.0', 'ijru@3.0.0', 'ijru@4.0.0', 'ijru@4.2.0', 'ijru.speed@1.0.0', 'svgf-rh@2020', 'svgf-rh@2025', 'svgf-par@2.0.0', 'ijru.speed.2020'],
    judgeType: 'Shj',
    name: 'Speed Head Judge',
    component: defineAsyncComponent(async () => await import('./views/scoring/ijru@1.1.0/Speed.vue')),
    localAlternativeCompetitionEvents: [
      ['False Switches', 'e.ijru.sp.sr.srsr.4.4x30@1.0.0'],
      ['No Switches', 'e.ijru.sp.sr.srss.1.30@1.0.0']
    ],
    localOptions: [
      {
        type: 'boolean',
        name: 'Minus button',
        prop: 'minusButton'
      }
    ],
    converters: {
      servo: servoSpeedConverter
    }
  },
  {
    rulesId: ['experiments'],
    judgeType: 'S',
    name: 'Speed Auto Clicker',
    localAlternativeCompetitionEvents: 'e.ijru.sp.sr.srss.1.30@1.0.0',
    component: defineAsyncComponent(async () => await import('./views/scoring/experiments/SpeedAutoClicker.vue'))
  },

  {
    rulesId: ['ijru@1.1.0', 'ijru@2.0.0', 'svgf-par@2.0.0'],
    judgeType: 'D',
    name: 'Difficulty',
    localAlternativeCompetitionEvents: 'e.ijru.fs.sr.srif.1.75@2.0.0',
    historic: true,
    component: defineAsyncComponent(async () => await import('./views/scoring/ijru@1.1.0/Difficulty.vue'))
  },
  {
    rulesId: ['ijru@3.0.0', 'ijru.freestyle.2023', 'ijru.freestyle.teamshow@2023', 'ijru.teamshow.2023', 'svgf-par@3.0.0'],
    judgeType: 'D',
    historic: true,
    name: 'Difficulty',
    component: defineAsyncComponent(async () => await import('./views/scoring/ijru@3.0.0/Difficulty.vue')),
    localAlternativeCompetitionEvents: [
      ['Freestyle', 'e.ijru.fs.sr.srif.1.75@3.0.0'],
      ['Show Freestyle', 'e.ijru.fs.ts.sctf.8.300@3.0.0']
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
            // make TS happy by re-initing
            scores.NumRepeated ??= 0
            scores.RepeatedSkillTimes ??= []

            scores.NumRepeated += mark.value ?? 1
            scores.RepeatedSkillTimes.push(mark.timestamp)
          }
        }
        return scores
      }
    }
  },
  {
    rulesId: ['ijru.freestyle.dd@4.0.0', 'ijru@4.0.0', 'ijru.freestyle.dd@4.2.0', 'ijru@4.2.0'],
    judgeType: 'Dt',
    name: 'Turner Difficulty (Double Dutch)',
    localAlternativeCompetitionEvents: 'e.ijru.fs.dd.ddsf.3.75@4.0.0',
    component: defineAsyncComponent(async () => await import('./views/scoring/ijru@4.0.0/DDDifficulty.vue'))
  },
  {
    rulesId: ['ijru.freestyle.dd@4.0.0', 'ijru@4.0.0', 'ijru.freestyle.dd@4.2.0', 'ijru@4.2.0'],
    judgeType: 'Dj',
    name: 'Jumper Difficulty (Double Dutch)',
    localAlternativeCompetitionEvents: 'e.ijru.fs.dd.ddsf.3.75@4.0.0',
    component: defineAsyncComponent(async () => await import('./views/scoring/ijru@4.0.0/DDDifficulty.vue'))
  },
  {
    rulesId: [
      'ijru.freestyle.sr@4.0.0', 'ijru.freestyle.wh@4.0.0', 'ijru@4.0.0',
      'ijru.freestyle.sr@4.2.0', 'ijru@4.2.0',
    ],
    judgeType: ['Dp', 'Dm', 'Dr', 'Da', 'Db'],
    name: 'Difficulty (Single Rope and Wheel)',
    localAlternativeCompetitionEvents: 'e.ijru.fs.sr.srif.1.75@4.0.0',
    component: defineAsyncComponent(async () => await import('./views/scoring/ijru@3.0.0/Difficulty.vue'))
  },

  {
    rulesId: ['ijru@2.0.0', 'svgf-par@2.0.0'],
    judgeType: 'Pa',
    name: 'Athlete Presentation',
    localAlternativeCompetitionEvents: 'e.ijru.fs.sr.srif.1.75@2.0.0',
    historic: true,
    component: defineAsyncComponent(async () => await import('./views/scoring/ijru@2.0.0/AthletePresentation.vue'))
  },
  {
    rulesId: ['ijru@3.0.0', 'ijru.freestyle.2023', 'ijru.freestyle.teamshow@2023', 'ijru.teamshow.2023', 'svgf-par@3.0.0'],
    judgeType: 'Pa',
    name: 'Athlete Presentation',
    historic: true,
    localAlternativeCompetitionEvents: [
      ['Freestyle', 'e.ijru.fs.sr.srif.1.75@3.0.0'],
      ['Show Freestyle', 'e.ijru.fs.ts.sctf.8.300@3.0.0']
    ],
    component: defineAsyncComponent(async () => await import('./views/scoring/ijru@3.0.0/AthletePresentation.vue')),
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
            // make TS happy by re-initing
            scores.StyleMinus ??= 0
            scores.StyleCheck ??= 0
            scores.StylePlus ??= 0
            scores.StyleScores ??= []
            scores.StyleTimes ??= []

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
    localAlternativeCompetitionEvents: 'e.ijru.fs.sr.srif.1.75@2.0.0',
    historic: true,
    component: defineAsyncComponent(async () => await import('./views/scoring/ijru@2.0.0/RoutinePresentation.vue'))
  },
  {
    rulesId: ['ijru@3.0.0', 'ijru.freestyle.2023', 'ijru.freestyle.teamshow@2023', 'ijru.teamshow.2023', 'svgf-par@3.0.0'],
    judgeType: 'Pr',
    name: 'Routine Presentation',
    historic: true,
    component: defineAsyncComponent(async () => await import('./views/scoring/ijru@3.0.0/RoutinePresentation.vue')),
    localAlternativeCompetitionEvents: [
      ['Freestyle', 'e.ijru.fs.sr.srif.1.75@3.0.0'],
      ['Show Freestyle', 'e.ijru.fs.ts.sctf.8.300@3.0.0']
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
    rulesId: [
      'ijru.freestyle.dd@4.0.0', 'ijru.freestyle.sr@4.0.0', 'ijru.freestyle.wh@4.0.0', 'ijru@4.0.0',
      'ijru.freestyle.sr@4.2.0', 'ijru@4.2.0',
    ],
    judgeType: 'P',
    name: 'Presentation',
    localAlternativeCompetitionEvents: 'e.ijru.fs.dd.ddsf.3.75@4.0.0',
    component: defineAsyncComponent(async () => await import('./views/scoring/ijru@4.0.0/Presentation.vue')),
    steps: ['marks', 'adjust'],
  },

  {
    rulesId: ['ijru@2.0.0', 'svgf-par@2.0.0'],
    judgeType: 'R',
    name: 'Required Elements',
    historic: true,
    component: defineAsyncComponent(async () => await import('./views/scoring/ijru@2.0.0/RequiredElements.vue')),
    localAlternativeCompetitionEvents: [
      ['Individual Single Rope', 'e.ijru.fs.sr.srif.1.75@2.0.0'],
      ['Pair/Team Single Rope, and Wheel', 'e.ijru.fs.sr.srtf.4.75@2.0.0'],
      ['Double Dutch Single Freestyle', 'e.ijru.fs.dd.ddsf.3.75@2.0.0'],
      ['Double Dutch Other', 'e.ijru.fs.dd.ddpf.4.75@2.0.0']
    ]
  },
  {
    rulesId: ['ijru@3.0.0', 'ijru.freestyle.2023', 'ijru.freestyle.teamshow@2023', 'ijru.teamshow.2023', 'svgf-par@3.0.0'],
    judgeType: 'R',
    name: 'Required Elements',
    historic: true,
    component: defineAsyncComponent(async () => await import('./views/scoring/ijru@3.0.0/RequiredElements.vue')),
    localAlternativeCompetitionEvents: [
      ['Individual Single Rope', 'e.ijru.fs.sr.srif.1.75@3.0.0'],
      ['Pair/Team Single Rope, and Wheel', 'e.ijru.fs.sr.srtf.4.75@3.0.0'],
      ['Double Dutch Single Freestyle', 'e.ijru.fs.dd.ddsf.3.75@3.0.0'],
      ['Double Dutch Other', 'e.ijru.fs.dd.ddpf.4.75@3.0.0'],
      ['Show Freestyle', 'e.ijru.fs.ts.sctf.8.300@3.0.0']
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
    rulesId: ['ijru.freestyle.dd@4.0.0', 'ijru@4.0.0', 'ijru.freestyle.dd@4.2.0', 'ijru@4.2.0'],
    judgeType: 'T',
    name: 'Technical (Double Dutch)',
    localAlternativeCompetitionEvents: 'e.ijru.fs.dd.ddsf.1.75@4.0.0',
    component: defineAsyncComponent(async () => await import('./views/scoring/ijru@4.0.0/Technical.vue')),
    steps: ['marks', 'timeViolations'],
  },
  {
    rulesId: [
      'ijru.freestyle.sr@4.0.0', 'ijru.freestyle.wh@4.0.0', 'ijru@4.0.0',
      'ijru.freestyle.sr@4.2.0', 'ijru@4.2.0',
    ],
    judgeType: 'T',
    name: 'Technical (Single Rope and Wheel)',
    component: defineAsyncComponent(async () => await import('./views/scoring/ijru@4.0.0/Technical.vue')),
    localAlternativeCompetitionEvents: [
      ['Individual Single Rope', 'e.ijru.fs.sr.srif.1.75@4.0.0'],
      ['Pair/Team Single Rope', 'e.ijru.fs.sr.srtf.4.75@4.0.0'],
      ['Wheel', 'e.ijru.fs.wh.whpf.2.75@4.0.0'],
    ]
  },

  {
    rulesId: ['svgf-rh@2020', 'svgf-rh@2025'],
    judgeType: 'D',
    name: 'Difficulty',
    localAlternativeCompetitionEvents: 'e.svgf.fs.sr.srif-rh.1.75@2020',
    component: defineAsyncComponent(async () => await import('./views/scoring/svgf-rh@2020/Difficulty.vue'))
  },
  {
    rulesId: 'svgf-rh@2020',
    judgeType: 'P',
    name: 'Presentation',
    allowScroll: true,
    component: defineAsyncComponent(async () => await import('./views/scoring/svgf-rh@2020/Presentation.vue')),
    localAlternativeCompetitionEvents: [
      ['Single Rope', 'e.svgf.fs.sr.srif-rh.1.75@2020'],
      ['Double Dutch', 'e.svgf.fs.dd.ddpf-rh.4.75@2020']
    ]
  },
  {
    rulesId: 'svgf-rh@2025',
    judgeType: 'P',
    name: 'Presentation',
    allowScroll: true,
    component: defineAsyncComponent(async () => await import('./views/scoring/svgf-rh@2025/Presentation.vue')),
    localAlternativeCompetitionEvents: [
      ['Single Rope', 'e.svgf.fs.sr.srif-rh.1.75@2025'],
      ['Double Dutch', 'e.svgf.fs.dd.ddpf-rh.4.75@2025']
    ]
  },

  {
    rulesId: 'svgf-vh@2023',
    judgeType: 'D',
    name: 'Difficulty',
    localAlternativeCompetitionEvents: 'e.svgf.fs.sr.srif-vh.1.75@2023',
    component: defineAsyncComponent(async () => await import('./views/scoring/svgf-vh@2023/Difficulty.vue'))
  },
  {
    rulesId: 'svgf-vh@2023',
    judgeType: 'O',
    name: 'Obligatoriska',
    localAlternativeCompetitionEvents: [
      ['Single Rope', 'e.svgf.fs.sr.srif-rh.1.75@2020'],
      ['Double Dutch', 'e.svgf.fs.dd.ddpf-rh.4.75@2020']
    ],
    component: defineAsyncComponent(async () => await import('./views/scoring/svgf-vh@2023/Obligatoriska.vue'))
  },
  {
    rulesId: 'svgf-vh@2023',
    judgeType: 'P',
    name: 'Presentation',
    component: defineAsyncComponent(async () => await import('./views/scoring/svgf-vh@2023/Presentation.vue')),
    localAlternativeCompetitionEvents: [
      ['Single Rope', 'e.svgf.fs.sr.srif-vh.1.75@2023'],
      ['Double Dutch', 'e.svgf.fs.dd.ddpf-vh.4.120@2023']
    ]
  },
  {
    rulesId: 'svgf-vh@2023',
    judgeType: 'T',
    name: 'Timing',
    localAlternativeCompetitionEvents: 'e.svgf.sp.dd.ddut.4.0@2023',
    component: defineAsyncComponent(async () => await import('./views/scoring/svgf-vh@2023/Timing.vue'))
  },

  {
    rulesId: 'experiments',
    judgeType: 'P',
    name: 'Simplified Presentation',
    localAlternativeCompetitionEvents: 'e.ijru.fs.sr.srif.1.75@exp',
    component: defineAsyncComponent(async () => await import('./views/scoring/experiments/SimplifiedPresentation.vue')),
    hidden: true,
    historic: true,
    localOptions: [
      { prop: 'scale5', name: 'wider scale', type: 'boolean' },
      { prop: 'noCheck', name: 'no checkmark', type: 'boolean' }
    ]
  },
  {
    rulesId: 'experiments',
    judgeType: 'Pc1',
    name: 'Circular Presentation (Not-scales)',
    localAlternativeCompetitionEvents: 'e.ijru.fs.sr.srif.1.75@exp',
    component: defineAsyncComponent(async () => await import('./views/scoring/experiments/CirclePresentationAlt1.vue')),
    hidden: true,
    historic: true
  },
  {
    rulesId: 'experiments',
    judgeType: 'Pc2',
    name: 'Circular Presentation (Scales)',
    localAlternativeCompetitionEvents: 'e.ijru.fs.sr.srif.1.75@exp',
    component: defineAsyncComponent(async () => await import('./views/scoring/experiments/CirclePresentationAlt2.vue')),
    hidden: true,
    historic: true,
    steps: ['marks', 'adjust']
  },
  {
    rulesId: 'experiments',
    judgeType: 'Pc5',
    name: 'Five Presentation Scales 2024',
    localAlternativeCompetitionEvents: 'e.ijru.fs.sr.srif.1.75@exp',
    component: defineAsyncComponent(async () => await import('./views/scoring/experiments/FiveScalePresentation2024.vue')),
    steps: ['marks', 'adjust'],
    hidden: true,
    historic: true,
  },
  {
    rulesId: 'experiments',
    judgeType: 'Pc3',
    name: 'Five Presentation Scales 2023',
    localAlternativeCompetitionEvents: 'e.ijru.fs.sr.srif.1.75@exp',
    component: defineAsyncComponent(async () => await import('./views/scoring/experiments/FiveScalePresentation.vue')),
    hidden: true,
    historic: true,
    steps: ['marks', 'adjust'],
    localOptions: [
      {
        name: 'Second-step Weights',
        prop: 'w2',
        type: 'single-select',
        options: [
          'Even',
          'Form, Ent 30 / Mus 20 / Crea, Var 10',
          'Ent 30 / Form 25 / Mus, Cre, Var 15',
          'Form, Ent 25 / Mus 20 / Crea, Var 15',
          'Form, Ent 25 / Mus, Crea, Var 17'
        ]
      },
      {
        name: 'No Boost button',
        prop: 'noBoost',
        type: 'boolean'
      }
    ]
  },
  {
    rulesId: 'experiments',
    judgeType: 'R',
    name: 'Density Required Elements',
    component: defineAsyncComponent(async () => await import('./views/scoring/experiments/DensityReqEl.vue')),
    hidden: true,
    historic: true,
    localAlternativeCompetitionEvents: [
      ['Individual Single Rope', 'e.ijru.fs.sr.srif.1.75@3.0.0'],
      ['Pair/Team Single Rope, and Wheel', 'e.ijru.fs.sr.srtf.4.75@3.0.0'],
      ['Double Dutch Single Freestyle', 'e.ijru.fs.dd.ddsf.3.75@3.0.0'],
      ['Double Dutch Other', 'e.ijru.fs.dd.ddpf.4.75@3.0.0']
    ]
  },

  {
    rulesId: ['ijru.freestyle.ddc@2023', 'ijru.ddc.2023', 'ijru.ddcf.2023'],
    judgeType: 'J',
    name: 'Jumper',
    allowScroll: true,
    localAlternativeCompetitionEvents: 'e.ddc.fs.dd.ddcf.3.30@2023',
    component: defineAsyncComponent(async () => await import('./views/scoring/ddc@2023/Judge.vue')),
    converters: {
      servo: servoDdc2023Converter
    }
  },
  {
    rulesId: ['ijru.freestyle.ddc@2023', 'ijru.ddc.2023', 'ijru.ddcf.2023'],
    judgeType: 'T',
    name: 'Turner',
    allowScroll: true,
    localAlternativeCompetitionEvents: 'e.ddc.fs.dd.ddcf.3.30@2023',
    component: defineAsyncComponent(async () => await import('./views/scoring/ddc@2023/Judge.vue')),
    converters: {
      servo: servoDdc2023Converter
    }
  },
  {
    rulesId: ['ijru.freestyle.ddc@2023', 'ijru.ddc.2023', 'ijru.ddcf.2023'],
    judgeType: 'E',
    name: 'Expression',
    allowScroll: true,
    localAlternativeCompetitionEvents: 'e.ddc.fs.dd.ddcf.3.30@2023',
    component: defineAsyncComponent(async () => await import('./views/scoring/ddc@2023/Judge.vue')),
    converters: {
      servo: servoDdc2023Converter
    }
  },
  {
    rulesId: ['ijru.freestyle.ddc@2023', 'ijru.ddc.2023', 'ijru.ddcf.2023'],
    judgeType: 'S',
    name: 'Staging',
    allowScroll: true,
    localAlternativeCompetitionEvents: 'e.ddc.fs.dd.ddcf.3.30@2023',
    component: defineAsyncComponent(async () => await import('./views/scoring/ddc@2023/Judge.vue')),
    converters: {
      servo: servoDdc2023Converter
    },
  }
]

export default models
