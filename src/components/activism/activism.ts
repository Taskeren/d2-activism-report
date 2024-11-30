// @ts-expect-error I don't why it shits errors here, but it did work. :|
import { DestinyActivityModeType, type DestinyHistoricalStatsPeriodGroup } from "bungie-api-ts/destiny2"

import type { ActivityHistoryEntryProps, ActivityHistoryGroupProps } from "@/components/acitivty_component_type"
import { type Highlight, highlightToString } from "@/components/activism/highlight"
import type { HistoryViewData } from "@/views/HistoryView.vue"
import { averageOf, includeAny, numToStr } from "@/utils/utils"

export type ActivismGetHistory = {
  code: number
  message: string
  data: DestinyHistoricalStatsPeriodGroup[]
}

type TempObjectHistoryData = DestinyHistoricalStatsPeriodGroup &
  ActivityHistoryEntryProps & {
    highlights_raw: Highlight<unknown>[]
  }

export function digestActivityHistories(data: ActivismGetHistory): HistoryViewData[] {
  if (data.code !== 0) {
    // invalid state
    throw data.message
  }

  return mergeHistories(data.data).map((cluster) => {
    const clusterEntries: TempObjectHistoryData[] = cluster.map((history) => {
      let completionState: string
      if (history.values.completionReason && history.values.completionReason.basic.value !== 255) {
        const value = history.values.completionReason.basic.value
        if (value === 0) {
          completionState = "activity.completed"
        } else if (value === 1) {
          completionState = "activity.timerFinished"
        } else if (value === 2) {
          completionState = "activity.failed"
        } else if (value === 4) {
          completionState = "activity.mercy"
        } else {
          completionState = `activity.unknown.${value}`
        }
      } else {
        completionState = history.values.completed.basic.value == 1 ? "activity.completed" : "activity.incomplete"
      }

      const highlights: Highlight<unknown>[] = []
      injectEntryHighlights(history, highlights)

      let targetingUrl: string | undefined = undefined
      if (history.activityDetails.modes.includes(DestinyActivityModeType.Raid)) {
        targetingUrl = `https://raid.report/pgcr/${history.activityDetails.instanceId}`
      } else if (history.activityDetails.modes.includes(DestinyActivityModeType.Dungeon)) {
        targetingUrl = `https://dungeon.report/pgcr/${history.activityDetails.instanceId}`
      } else if (history.activityDetails.modes.includes(DestinyActivityModeType.ScoredNightfall)) {
        targetingUrl = `https://gm.report/pgcr/${history.activityDetails.instanceId}`
      } else if (history.activityDetails.modes.includes(DestinyActivityModeType.TrialsOfOsiris)) {
        targetingUrl = `https://trials.report/pgcr/${history.activityDetails.instanceId}`
      } else if (history.activityDetails.modes.includes(DestinyActivityModeType.AllPvP)) {
        targetingUrl = `https://crucible.report/pgcr/${history.activityDetails.instanceId}`
      }

      return {
        ...history,
        completionState,
        activityName: `activity_name.${history.activityDetails.referenceId}`,
        activityTime: new Date(history.period),
        highlights: highlights.map(highlightToString),
        targetingUrl,
        highlights_raw: highlights,
      } satisfies TempObjectHistoryData
    })

    const clusterCompletionStates: { [key: string]: number } = {}
    for (const clusterEntry of clusterEntries) {
      if (clusterCompletionStates[clusterEntry.completionState]) {
        clusterCompletionStates[clusterEntry.completionState]++
      } else {
        clusterCompletionStates[clusterEntry.completionState] = 1
      }
    }

    const clusterHighlights: Highlight<unknown>[] = []
    injectGroupHighlights(clusterEntries, clusterHighlights)

    let nameColorHint: string | undefined = undefined
    const modes = cluster[0].activityDetails.modes
    if (modes.includes(DestinyActivityModeType.Raid)) {
      nameColorHint = "text-green-400"
    } else if (modes.includes(DestinyActivityModeType.Dungeon)) {
      nameColorHint = "text-teal-400"
    } else if (modes.includes(DestinyActivityModeType.AllPvP)) {
      nameColorHint = "text-red-400"
    }

    const clusterGroup: ActivityHistoryGroupProps = {
      activityName: `activity_name.${cluster[0].activityDetails.directorActivityHash}`,
      completionStates: Object.entries(clusterCompletionStates).map(([name, count]) => [name, `x${count}`]),
      highlights: clusterHighlights.map(highlightToString),
      nameColorHint,
    }

    return {
      group: clusterGroup,
      entries: clusterEntries,
    } satisfies HistoryViewData
  })
}

/**
 * Test if two history can be merged into a cluster.
 */
function canMergeTogether(o1: DestinyHistoricalStatsPeriodGroup, o2: DestinyHistoricalStatsPeriodGroup): boolean {
  if (o1.activityDetails.directorActivityHash === o2.activityDetails.directorActivityHash) {
    return true
  } else if (o1.activityDetails.referenceId === o2.activityDetails.referenceId) {
    return true
  }

  return false
}

/**
 * Merge the histories into clusters.
 *
 * The elements must be next to each other, and is true in `canMergeTogether`.
 */
function mergeHistories(elements: DestinyHistoricalStatsPeriodGroup[]): DestinyHistoricalStatsPeriodGroup[][] {
  const groups: DestinyHistoricalStatsPeriodGroup[][] = []

  elements.forEach((element) => {
    const lastGroup = groups[groups.length - 1]

    if (lastGroup && canMergeTogether(lastGroup[lastGroup.length - 1], element)) {
      lastGroup.push(element)
    } else {
      groups.push([element])
    }
  })

  return groups
}

function injectEntryHighlights(history: DestinyHistoricalStatsPeriodGroup, highlights: Highlight<unknown>[]) {
  const modes = history.activityDetails.modes

  if (includeAny(modes, DestinyActivityModeType.AllPvE, DestinyActivityModeType.Raid, DestinyActivityModeType.Dungeon)) {
    if (history.values.deaths.basic.value === 0 && history.values.completed.basic.value === 1) {
      highlights.push({ name: "flawless", value: null })
    }
  }

  if (includeAny(modes, DestinyActivityModeType.Story)) {
    highlights.push({ name: "kills", value: history.values.kills.basic.value })
  }

  if (includeAny(modes, DestinyActivityModeType.AllPvP)) {
    let flag = false
    if (history.values.killsDeathsRatio.basic.value > 1.0) {
      highlights.push({ name: "kd", value: history.values.killsDeathsRatio.basic.displayValue })
      flag = true
    }
    if (history.values.killsDeathsAssists.basic.value > 1.5) {
      highlights.push({ name: "kda", value: history.values.killsDeathsAssists.basic.displayValue })
      flag = true
    }

    if (!flag) {
      highlights.push({ name: "kills", value: history.values.kills.basic.value })
    }
  }
}

function injectGroupHighlights(histories: TempObjectHistoryData[], highlights: Highlight<unknown>[]) {
  const modes = histories[0].activityDetails.modes

  const flawlessCount = histories.reduce((agg, entry) => agg + (entry.highlights_raw.some((h) => h.name === "flawless") ? 1 : 0), 0)
  if (flawlessCount > 0) {
    highlights.push({ name: "flawless", value: flawlessCount })
  }

  // if (includeAny(modes, DestinyActivityModeType.Raid, DestinyActivityModeType.Dungeon)) {
  //   const averageTimeInSec = averageOf(histories, (h) => h.values.timePlayedSeconds.basic.value)
  //   highlights.push({ name: "avg_time", value: averageTimeInSec })
  // }

  if(includeAny(modes, DestinyActivityModeType.AllPvP)) {
    const averageKD = averageOf(histories, h => h.values.killsDeathsRatio.basic.value)
    if(averageKD > 1.0) {
      highlights.push({ name: "avg_kd", value: numToStr(averageKD) })
    }

    const averageKDA = averageOf(histories, h => h.values.killsDeathsAssists.basic.value)
    if(averageKDA > 1.5) {
      highlights.push({ name: "avg_kda", value: averageKDA })
    }
  }

}
