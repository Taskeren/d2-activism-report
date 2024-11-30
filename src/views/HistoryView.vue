<script setup lang="ts">
import { useRoute } from "vue-router"
import ActivityHistoryGroup from "@/components/ActivityHistoryGroup.vue"
import ActivityHistoryEntry from "@/components/ActivityHistoryEntry.vue"
import type { ActivityHistoryEntryProps, ActivityHistoryGroupProps } from "@/components/acitivty_component_type"
import { onMounted, type Ref, ref } from "vue"
import { digestActivityHistories } from "@/components/activism/activism"
import { useI18n } from "vue-i18n"

const route = useRoute()

const { locale } = useI18n()

const { membershipType, membershipId } = route.params

console.log("Taskeren-3's Report!")
console.log("Membership Info", membershipType, membershipId)

export type HistoryViewData = {
  group: ActivityHistoryGroupProps
  entries: ActivityHistoryEntryProps[]
}

const data: Ref<HistoryViewData[]> = ref([])

onMounted(async () => {
  const resp = await fetch(`https://activism.nitu2003.workers.dev/v1/get-history/${membershipType}/${membershipId}`).then((res) => res.json())
  console.log(resp)
  data.value = digestActivityHistories(resp)
})
</script>

<template>
  <header class="px-6 bg-black flex flex-wrap align-middle items-center text-white gap-x-4">
    <a href="/" class="text-2xl my-5 mr-4 hover:underline align-middle">
      <h1 class="font-mono">Taskeren-3's Report (Alpha Test)</h1>
    </a>
    <div class="relative w-[24em]">
      <input tabindex="0" class="p-2 w-full rounded-md z-2 text-black" placeholder="Search for a player (WIP, not functioning)" role="combobox" aria-expanded="false" aria-autocomplete="list" type="text" />
    </div>
    <nav class="flex gap-x-4 flex-wrap my-5 pl-2 mr-2">
      <button @click="locale = 'zh_chs'">简体中文</button>
      <button @click="locale = 'zh_cht'">繁体中文</button>
      <button @click="locale = 'en'">English</button>
    </nav>
  </header>
  <main class="max-w-7xl mx-auto mb-8">
    <ActivityHistoryGroup v-for="(cluster, idx) in data" :key="idx" :activity-name="cluster.group.activityName" :highlights="cluster.group.highlights" :completion-states="cluster.group.completionStates" :name-color-hint="cluster.group.nameColorHint">
      <ActivityHistoryEntry v-for="(entry, entryIdx) in cluster.entries" :key="entryIdx" :activity-time="entry.activityTime" :activity-name="entry.activityName" :highlights="entry.highlights" :completion-state="entry.completionState" :targeting-url="entry.targetingUrl" />
    </ActivityHistoryGroup>
  </main>
</template>

<style scoped></style>
