export type ActivityHistoryGroupProps = {
  activityName: string
  highlights: [string, string | null][]
  completionStates: [string, string | null][]

  nameColorHint?: string
}

export type ActivityHistoryEntryProps = {
  activityTime: Date
  activityName: string
  highlights: [string, string | null][]
  completionState: string
  targetingUrl?: string
}
