<script setup lang="ts">
import IconArrowUpRight from "@/components/icons/IconUpRight.vue"
import IconXMark from "@/components/icons/IconXMark.vue"
import type { ActivityHistoryEntryProps } from "@/components/acitivty_component_type"
import { useI18n } from "vue-i18n"
import { getElapsedTime } from "./activism/elapse_date"

const { t } = useI18n()

defineProps<ActivityHistoryEntryProps>()
</script>

<template>
  <div class="grid grid-cols-5 min-h-12 py-2 bg-slate-800 text-white">
    <div class="flex items-center justify-center">
      <h3>{{ getElapsedTime(activityTime, t) }}</h3>
    </div>
    <div class="flex items-center justify-center text-center">
      <h3>{{ t(activityName) }}</h3>
    </div>
    <div class="flex flex-col items-center justify-center">
      <div class="flex flex-cols-2 gap-1 items-center" v-for="[hlName, hlValue] in highlights" :key="hlName">
        <span>{{ t(hlName) }}</span>
        <span v-if="hlValue !== null">{{ hlValue }}</span>
      </div>
    </div>
    <div class="flex items-center justify-center">
      <p>{{ t(completionState) }}</p>
    </div>
    <div class="flex items-center justify-center">
      <a v-if="targetingUrl !== undefined" :href="targetingUrl" target="_blank" class="hover:text-green-300" rel="noopener noreferrer">
        <IconArrowUpRight class="size-6" />
      </a>
      <IconXMark v-else class="size-6" />
    </div>
  </div>
</template>

<style scoped></style>
