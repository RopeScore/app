import type { Ref } from 'vue'
import { isUndoMark, type useScoresheet, type Mark, type Scoresheet } from './hooks/scoresheet'

const numInt = new Intl.NumberFormat(['en-GB'], { style: 'decimal', maximumFractionDigits: 2 })

export function numFmt (v: number) { return numInt.format(v) }

declare global {
  interface ImportMetaEnv {
    VITE_COMMIT_REF?: string
    VITE_CONTEXT?: string
    VITE_GRAPHQL_ENDPOINT?: string
    VITE_GRAPHQL_WS_ENDPOINT?: string
    VITE_DEFAULT_SERVO_BASE_URL?: string
  }
}

const locales = ['en-SE', 'en-AU', 'en-GB']
const dateFormatter = Intl.DateTimeFormat(locales, {
  dateStyle: 'medium',
  timeStyle: 'medium',
  hour12: false
})
/**
 * Formats a date and time into a human readable format, in the en-SE locale
 * this results in something like 22 Aug 2021, 21:08:27
 */
export function formatDate (timestamp: number | Date): string {
  return dateFormatter.format(timestamp)
}

const listFormatter = new Intl.ListFormat(locales)
export function formatList (list: string[]): string {
  return listFormatter.format(list)
}

export const version: string = (import.meta.env.VITE_COMMIT_REF ?? 'dev').toString().substring(0, 7)

export function handleScaleUpdateFactory <Schema extends string> (scoresheet: Readonly<Ref<Scoresheet<Schema> | undefined>>, addMark: ReturnType<typeof useScoresheet<Schema>>['addMark']) {
  return function handleScaleUpdate (schema: Schema, value: number) {
    const marks = scoresheet.value?.marks ?? []
    let prevMark: Mark<Schema> | undefined
    for (let idx = marks.length - 1; idx >= 0; idx--) {
      if (marks[idx].schema === schema) {
        prevMark = marks[idx]
        break
      }
    }

    if (prevMark) {
      let isUndone = false
      for (let idx = marks.length - 1; idx >= 0; idx--) {
        const mark = marks[idx]
        if (isUndoMark(mark) && mark.target === prevMark.sequence) {
          isUndone = true
          break
        }
        if (marks[idx].sequence === prevMark.sequence) break // can't undo earlier than the mark
      }

      if (!isUndone) void addMark({ schema: 'undo', target: prevMark.sequence })
    }

    void addMark({ schema, value })
  }
}
