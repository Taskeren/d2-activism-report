<script setup lang="ts">

import {
	DestinyActivityModeType,
	type DestinyCharacterComponent,
	type DestinyHistoricalStatsPeriodGroup,
	type DestinyInventoryItemDefinition,
} from "bungie-api-ts/destiny2"
import type { UserInfoCard } from "bungie-api-ts/user"
import ActivismReportGroup from "~/components/ActivismReportGroup.vue"

const BUNGIE_BASE = "//www.bungie.net"

const route = useRoute()

const { locale } = useI18n()

const { mType, mId } = route.params
const showInfo = ref(true)

const paramMembershipInfo = computed(() => `${mType}/${mId}`)

export type UserInfoData = {
	username: string
	usernameCode: string
	emblemOverlayUrl: string
	emblemBackgroundUrl: string
}

export type Highlight = (string | [string, string])

export type hInt = { value: number, __type: "int" }
export type HighlightBuilder = { [key: string]: string | number | boolean | hInt }

export type ActivismReportGroupData = {
	groupInfo: {
		groupName: string
		highlights: Highlight[]
		completionStates: GroupCompletionStates
	}
	entries: ActivismReportEntry[]
}

export type GroupCompletionStates = { [key: string]: { value: number, subTypes: { [key: string]: number } } }

export type ActivismReportEntry = {
	entryName: string,
	highlights: Highlight[]
	completionState: string

	targetUrl: string | null

	rawData: unknown
}

type ApiRespType = {
	histories: DestinyHistoricalStatsPeriodGroup[]
	characters: { [p: string]: DestinyCharacterComponent }
	emblemDefinition: DestinyInventoryItemDefinition
	userInfo: UserInfoCard
}

const {
	data: respData,
	error: respError,
	refresh,
	status,
} = await useFetch<ApiRespType>(`/api/get-history/${paramMembershipInfo.value}`, {
	lazy: true,
	server: false,
})

watch(() => paramMembershipInfo, (newValue, oldValue) => {
	if(newValue !== oldValue) {
		console.log("membership info changed, refreshing data!")
		refresh()
	}
})

const pageData = computed(() => respData.value !== null ? getAnalyzeHistoryData(respData.value.histories) : [])
const userInfoData = computed(() => respData.value !== null ? getUserData(respData.value.userInfo, respData.value.emblemDefinition) : undefined)

const windowTitle = computed(() => userInfoData.value !== undefined ? `${userInfoData.value.username}#${userInfoData.value.usernameCode} - Activism Report` : "Activism Report")

useHead({
	title: windowTitle,
})

const bungieErrorStatus = computed(() => respError?.value?.data?.data?.ErrorStatus)

function getUserData(userInfo: UserInfoCard, emblemDefinition: DestinyInventoryItemDefinition): UserInfoData {
	console.log("Emblem Definition", emblemDefinition)

	return {
		username: userInfo.bungieGlobalDisplayName,
		usernameCode: _numTo4Str(userInfo.bungieGlobalDisplayNameCode ?? -1),
		emblemOverlayUrl: emblemDefinition.secondaryOverlay,
		emblemBackgroundUrl: emblemDefinition.secondarySpecial,
	}
}

function getAnalyzeHistoryData(histories: DestinyHistoricalStatsPeriodGroup[]): ActivismReportGroupData[] {
	console.log("Activity Histories", histories)

	const historyGroups: DestinyHistoricalStatsPeriodGroup[][] = []
	{
		for(let history of histories) {
			const lastGroup = historyGroups.at(-1)

			if(lastGroup !== undefined && canMergeActivityHistory(lastGroup[0], history)) {
				lastGroup.push(history)
			} else {
				historyGroups.push([history])
			}
		}
	}
	console.debug("History Groups", historyGroups)

	const parsedHistoryGroups: ActivismReportGroupData[] = historyGroups.map(analyzeGroupHistory)
	console.debug("Analyzed Histories", parsedHistoryGroups)

	return parsedHistoryGroups
}

function canMergeActivityHistory(a1: DestinyHistoricalStatsPeriodGroup, a2: DestinyHistoricalStatsPeriodGroup) {
	return a1.activityDetails.directorActivityHash === a2.activityDetails.directorActivityHash ||
		a1.activityDetails.referenceId === a2.activityDetails.referenceId
}

function analyzeGroupHistory(g: DestinyHistoricalStatsPeriodGroup[]): ActivismReportGroupData {
	const gCompletionStates: GroupCompletionStates = {}
	const gHighlights: Highlight[] = []
	const gReportEntries: ActivismReportEntry[] = g.map(h => analyzeOneHistory(h, gCompletionStates))
	return {
		groupInfo: {
			groupName: _getActivityName(g[0].activityDetails.directorActivityHash),
			highlights: gHighlights,
			completionStates: gCompletionStates,
		},
		entries: gReportEntries,
	}
}

function analyzeOneHistory(h: DestinyHistoricalStatsPeriodGroup, gCompletionStates: GroupCompletionStates): ActivismReportEntry {
	let highlights: HighlightBuilder = {}

	// The "completionState" and "subCompletionState" are used to "cache" the completion state for this history.
	// The main complete reason is set to "completionState" like "Complete", "Incomplete", "Victory", "Defeat", etc.,
	// while additional complete info is set to "subCompletionState" like "Mercy", "Timer Finished", etc.
	// At the end, the "completionState" and "subCompletionState" will be merged, and used as the completion reason of this history.
	// Also, they are used to update the "gCompletionState", where "completionState" is used as the key,
	// and "subCompletionState" is used for "subType".
	let completionState: string
	let subCompletionState: string | null = null

	const aModes = h.activityDetails.modes

	// read general completion state
	const vCompleted = h.values.completed
	if(vCompleted) {
		completionState = vCompleted.basic.value === 1
			? "activity_completion.completed"
			: "activity_completion.incomplete"
	} else {
		completionState = "activity_completion.undeclared"
	}

	const vCompletionReason = h.values.completionReason

	// PVP completion with victory or defeat info
	if(_hasAny(aModes, DestinyActivityModeType.AllPvP)) {
		const vStanding = h.values.standing
		if(vStanding) {
			completionState = vStanding.basic.value === 0
				? "activity_completion.victory"
				: "activity_completion.defeat"

			// for special match endings
			if(vCompletionReason) {
				switch(vCompletionReason.basic.value) {
					case 0:
						// normal ending
						break
					case 1:
						subCompletionState = "timerFinished"
						break
					case 2:
						subCompletionState = "failed"
						break
					case 4:
						subCompletionState = "mercy"
						break
					default:
				}
			}
		} else {
			console.warn(`Unexpected PvP history without 'standing' value`, h)
		}
	}

	if(_hasAny(aModes, DestinyActivityModeType.Raid, DestinyActivityModeType.Nightfall, DestinyActivityModeType.ScoredNightfall)) {
		if(vCompletionReason && vCompletionReason.basic.value === 2) {
			// "completed" but failed, where you can see the PGCR screen, but you didn't actually complete it
			// situations:
			// 1) wiped on grandmaster
			// 2) died in legacy flawless runs, eg: Petra's Runs (Last Wish), Scourge of the Past, Crown of Sorrow
			// 3) harder version of seasonal activities, eg: The Coil (Season of Wish), Tomb of Elders (Episode: Revenant)
			completionState = "activity_completion.failed"
		}
	}

	// search for highlights here
	if(_hasAny(aModes, DestinyActivityModeType.AllPvP)) {
		// K
		const vKills = h.values.kills
		if(vKills && vKills.basic.value > 10) {
			highlights["highlight.kills"] = _toHInt(vKills.basic.value)
		}

		// KD
		const vKillsDeathsRatio = h.values.killsDeathsRatio
		if(vKillsDeathsRatio && vKillsDeathsRatio.basic.value > 1.0) {
			highlights["highlight.kd"] = vKillsDeathsRatio.basic.value
		}

		// KDA
		const vKillsDeathsAssists = h.values.killsDeathsAssists
		if(vKillsDeathsAssists && vKillsDeathsAssists.basic.value > 1.5) {
			highlights["highlight.kda"] = vKillsDeathsAssists.basic.value
		}
	}

	if(_hasAny(aModes, DestinyActivityModeType.Story)) {
		// K
		const vKills = h.values.kills
		if(vKills && vKills.basic.value > 100) {
			highlights["highlight.kills"] = _toHInt(vKills.basic.value)
		}
	}

	if(_hasAny(aModes, DestinyActivityModeType.Dungeon, DestinyActivityModeType.Raid)) {
		// flawless
		const vDeaths = h.values.deaths
		if(vDeaths && vDeaths.basic.value < 1) {
			highlights["highlight.flawless"] = true
		}
	}

	// see above
	_setGroupCompletionState(gCompletionStates, completionState)
	if(subCompletionState) {
		_setGroupCompletionStateSubType(gCompletionStates, completionState, subCompletionState)
		completionState += `_${subCompletionState}`
	}

	// find target url
	let targetUrl = null
	if(aModes.includes(DestinyActivityModeType.Raid)) {
		targetUrl = `https://raid.report/pgcr/${h.activityDetails.instanceId}`
	} else if(aModes.includes(DestinyActivityModeType.Dungeon)) {
		targetUrl = `https://dungeon.report/pgcr/${h.activityDetails.instanceId}`
	} else if(aModes.includes(DestinyActivityModeType.ScoredNightfall)) {
		targetUrl = `https://gm.report/pgcr/${h.activityDetails.instanceId}`
	} else if(aModes.includes(DestinyActivityModeType.TrialsOfOsiris)) {
		targetUrl = `https://trials.report/pgcr/${h.activityDetails.instanceId}`
	} else if(aModes.includes(DestinyActivityModeType.AllPvP)) {
		targetUrl = `https://crucible.report/pgcr/${h.activityDetails.instanceId}`
	}

	return {
		entryName: `activity_name.${h.activityDetails.referenceId}`,
		highlights: _buildHighlights(highlights),
		completionState,
		targetUrl,
		rawData: h,
	}
}

function _hasAny<T>(src: T[], ...els: T[]): boolean {
	for(const el of els) {
		if(src.includes(el)) {
			return true
		}
	}

	return false
}

function _getActivityName(referenceId: number) {
	return `activity_name.${referenceId}`
}

function _setGroupCompletionState(gCompletionStates: GroupCompletionStates, key: string, increment: number = 1) {
	if(!gCompletionStates[key]) {
		gCompletionStates[key] = {
			value: 0,
			subTypes: {},
		}
	}

	gCompletionStates[key].value += increment
}

function _setGroupCompletionStateSubType(gCompletionStates: GroupCompletionStates, key: string, subType: string, increment: number = 1) {
	if(!gCompletionStates[key]) {
		gCompletionStates[key] = {
			value: 0,
			subTypes: {},
		}
	}

	subType = `activity_completion.${subType}`

	if(!gCompletionStates[key].subTypes[subType]) {
		gCompletionStates[key].subTypes[subType] = 0
	}

	gCompletionStates[key].subTypes[subType] += increment
}

function _toHInt(v: number): hInt {
	return {
		value: v,
		__type: "int",
	}
}

function _numTo4Str(v: number) {
	return v.toString().padStart(4, "0")
}

function _buildHighlights(b: HighlightBuilder): Highlight[] {
	return Object.entries(b).map(([k, v]) => {
		if(typeof v === "boolean" && v) {
			return k
		}
		if(typeof v === "number") {
			return [k, v.toFixed(2)]
		}
		if(typeof v === "string") {
			return [k, v]
		}
		if(typeof v === "object" && v.__type && v.__type === "int") {
			return [k, `x${v.value}`]
		}

		console.warn("Invalid highlight value", v)
		return [k, "unknown value, see console"]
	})
}

</script>

<template>
	<!-- Debugging Information Panel -->
	<DevOnly>
		<div v-show="showInfo" class="fixed w-full bottom-0 left-0 p-4 bg-stone-900 text-white">
			<h3 class="font-bold">Debugging Information Panel <span class="text-red-600 hover:underline hover:cursor-pointer"
																															@click="showInfo=false">X</span></h3>
			<p>Membership Id: <span class="font-mono hover:underline hover:cursor-pointer"
															@click="useCopyToClipboard().copy(mId.toString())">{{ mId }}</span></p>
			<p>I18n Locale: {{ locale }}</p>
			<p>Page Status: {{ status }}</p>
		</div>
	</DevOnly>
	<!-- Debugging Information Panel End -->
	<div v-show="userInfoData" class="bg-cover flex flex-wrap items-center gap-3"
			 :style="{'background-image': `url(${BUNGIE_BASE}${userInfoData?.emblemBackgroundUrl})`}">
		<div class="max-w-96 flex flex-wrap mx-auto my-4 gap-x-2">
			<span class="inline-block bg-cover size-12"
						:style="{'background-image': `url(${BUNGIE_BASE}${userInfoData?.emblemOverlayUrl})`}"></span>
			<h2 class="text-3xl font-bold my-auto text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
				{{ userInfoData?.username }} <span class="text-lg font-normal">#{{ userInfoData?.usernameCode }}</span>
			</h2>
			<button @click="() => refresh()">
				<UIcon name="i-heroicons-arrow-path" class="size-6 text-white" />
			</button>
		</div>
	</div>

	<div class="container mx-auto">
		<div class="flex flex-col gap-y-2 mx-1">
			<!-- the history lists -->
			<ActivismReportGroup v-if="status==='success' && pageData.length > 0" v-for="(data, idx) in pageData" :key="idx"
													 :data="data" :expand-init="idx < 3" />
			<!-- success but no data -->
			<p v-else-if="status==='success'" class="status-text">{{ $t("error.empty_data") }}</p>
			<!-- error by privacy -->
			<p v-else-if="status==='error' && bungieErrorStatus === 'DestinyPrivacyRestriction'" class="status-text">
				{{ $t("error.privacy_restriction") }}</p>
			<!-- other errors -->
			<p v-else-if="status==='error'" class="status-text">{{ $t("error.unknown") }}</p>
			<!-- loading/pending -->
			<div v-else-if="status === 'pending'" class="h-full w-full flex justify-center items-center">
				<p class="status-text">{{ $t("loading_text") }}</p>
			</div>
		</div>
	</div>
</template>

<style scoped>
.status-text {
	@apply text-3xl text-white p-16 text-center;
}
</style>