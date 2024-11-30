export const highlightKeys = [
  "flawless",
  "kills",
  "kd",
  "kda",

  "avg_time",
  "avg_kd",
  "avg_kda",
] as const

export type HighlightKey = typeof highlightKeys[number]

export interface Highlight<T> {
  readonly name: HighlightKey
  readonly value: T
}

export function highlightToString(hl: Highlight<unknown>): [string, string | null] {
  if (typeof hl.value === "undefined" || hl.value === null) {
    return [`activity_highlight.${hl.name}`, null]
  }

  if (typeof hl.value === "number") {
    return [`activity_highlight.${hl.name}`, `x${hl.value}`]
  }

  return [`activity_highlight.${hl.name}`, hl.value?.toString() ?? null]
}
