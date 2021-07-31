const numInt = new Intl.NumberFormat(['en-GB'], { style: 'decimal', maximumFractionDigits: 2 })

export function numFmt (v: number) { return numInt.format(v) }
