const numInt = new Intl.NumberFormat(['en-GB'], { style: 'decimal', maximumFractionDigits: 2 })

export function numFmt (v: number) { return numInt.format(v) }

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
