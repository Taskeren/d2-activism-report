<script setup lang="ts">
import { ref } from "vue"
import type { ActivityHistoryGroupProps } from "@/components/acitivty_component_type"
import { useI18n } from "vue-i18n"

const { t } = useI18n()

defineProps<ActivityHistoryGroupProps>()

const expand = ref(false)
</script>

<template>
  <div class="bg-slate-800">
  <div class="grid grid-cols-3 w-full min-h-24 py-4 gap-1 bg-slate-900 text-white font-bold cursor-pointer hover:bg-slate-800 transition" @click="expand = !expand">
    <div class="flex justify-center items-center">
      <h3 class="text-2xl text-center" :class="nameColorHint">{{ t(activityName) }}</h3>
    </div>
    <div class="flex flex-col items-center justify-center">
      <div class="grid grid-cols-2 gap-1 items-center" v-for="[hlName, hlValue] in highlights" :key="hlName">
        <span>{{ t(hlName) }}</span>
        <span>{{ hlValue }}</span>
      </div>
    </div>
    <div class="flex flex-col items-center justify-center">
      <div class="grid grid-cols-2 gap-1 items-center" v-for="[csType, csValue] in completionStates" :key="csType">
        <span>{{ t(csType) }}</span>
        <span>{{ csValue }}</span>
      </div>
    </div>
  </div>
  <Transition
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
    enter-active-class="transition duration-100"
    leave-active-class="transition duration-100">
    <div v-show="expand" class="transition">
      <slot />
    </div>
  </Transition>
  </div>
</template>

<style scoped></style>
