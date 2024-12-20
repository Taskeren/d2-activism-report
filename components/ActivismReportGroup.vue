<script setup lang="ts">

import type { ActivismReportGroupData } from "~/pages/[mType]/[mId].vue"

useI18n()

type Props = {
	data: ActivismReportGroupData
	expandInit: boolean
}

const props = defineProps({
	data: {
		type: Object as PropType<ActivismReportGroupData>,
		required: true
	},
	expandInit: {
		type: Boolean,
		default: false,
	},
})

const expand = ref(props.expandInit)
</script>

<template>
	<div class="bg-slate-800">
		<div
			class="grid grid-cols-3 w-full min-h-24 p-2 gap-1  text-white font-bold cursor-pointer xl:hover:bg-slate-800 transition"
			:class="{'bg-slate-800': expand, 'bg-slate-900': !expand}"
			@click="expand = !expand">
			<div class="flex justify-center items-center">
				<h3 class="text-xl text-center">{{ $t(data.groupInfo.groupName) }}</h3>
			</div>
			<div class="flex flex-col items-center justify-center">
				<div class="grid grid-cols-2 gap-1 items-center" v-for="[hlName, hlValue] in data.groupInfo.highlights"
						 :key="hlName">
					<span>{{ $t(hlName) }}</span>
					<span>{{ hlValue }}</span>
				</div>
			</div>
			<div class="flex flex-col items-center justify-center">
				<div class="w-full" v-for="(data, key) in data.groupInfo.completionStates" :key="key">
					<div class="grid grid-cols-1 xl:grid-cols-2 text-center gap-x-1 items-center">
						<span class="xl:text-right">{{ $t(key.toString()) }}</span>
						<span class="xl:text-left">x{{ data.value }}</span>
					</div>
					<div
						class="grid grid-cols-1 xl:grid-cols-2 text-center gap-x-1 items-center text-gray-400 font-normal text-sm"
						v-for="(v, n) in data.subTypes">
						<span class="xl:text-right">{{ $t(n.toString()) }}</span>
						<span class="xl:text-left">x{{ v }}</span>
					</div>
				</div>
			</div>
		</div>
		<Transition>
			<div v-show="expand" class="transition divide-y-2 divide-slate-900">
				<div v-for="(entry, idx) in data.entries" :key="idx"
						 class="grid grid-cols-3 w-full min-h-8 bg-slate-800 text-white">
					<div class="flex justify-center items-center">
						<h4 class="text-center">{{ $t(entry.entryName) }}</h4>
					</div>
					<div class="flex flex-col items-center justify-center text-sm">
						<div v-for="(hl, idx) in entry.highlights" :key="idx">
							<div v-if="typeof hl === 'string'">
								<span>{{ $t(hl) }}</span>
							</div>
							<div v-else class="grid grid-cols-2 gap-1 items-center">
								<span>{{ $t(hl[0]) }}</span>
								<span>{{ hl[1] }}</span>
							</div>
						</div>
					</div>
					<div class="flex justify-center items-center">
						<span>{{ $t(entry.completionState) }}</span>
					</div>
				</div>
			</div>
		</Transition>
	</div>
</template>

<style scoped>

</style>