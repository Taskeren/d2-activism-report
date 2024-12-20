<script setup lang="ts">

import type { UserInfoCard, UserSearchResponseDetail } from "bungie-api-ts/user"

const { setLocale } = useI18n()

const searchName = ref<string>("")
const showPopup = ref<boolean>(false)
const userData = ref<UserInfoCard[]>()

async function execSearch() {
	const { data } = await $fetch<{ data: UserInfoCard[] }>(`/api/search-user`, {
		method: "POST",
		body: JSON.stringify(searchName.value),
	})
	console.log("User Info", data)

	const filteredData = data.filter(x => x.crossSaveOverride === 0 || x.crossSaveOverride === x.membershipType)

	if(filteredData.length === 1) {
		const singleton = filteredData[0]
		jumpToUser(singleton.membershipType, singleton.membershipId)
	} else if(filteredData.length > 1) {
		userData.value = filteredData
		showPopup.value = true
	} else {
		// TODO: handle the condition that no such user is found
		console.log("No User Found", searchName.value)
	}
}

// transform numbers to string, whose length is fixed to 4, padding 0 at the head
// 100 => "0100"
// 1314 => "1314"
function _numTo4Str(v: number) {
	return v.toString().padStart(4, "0")
}

function jumpToUser(mType: number, mId: string) {
	console.log("Jump to User", mType, mId)
	useRouter().push({
		name: "mType-mId",
		params: { mType, mId }
	})
	showPopup.value = false
}

</script>

<template>
	<header class="px-6 bg-black flex flex-wrap align-middle items-center text-white gap-x-4">
		<NuxtLink to="/" class="text-2xl my-5 mr-4 hover:underline align-middle">
			<h1 class="font-mono">{{ $t("side_name") }} (Nuxt Alpha Test)</h1>
		</NuxtLink>
		<div class="relative w-[24em]">
			<input type="text" class="p-2 w-full rounded-md z-2 text-black"
						 placeholder="Search for a player" v-model="searchName" @keydown.enter="execSearch">
		</div>
		<nav class="flex gap-x-4 flex-wrap my-5 pl-2 mr-2">
			<button @click="setLocale('en')">English</button>
			<button @click="setLocale('zh_chs')">简体中文</button>
			<button @click="setLocale('zh_cht')">繁體中文</button>
		</nav>
	</header>
	<main>
		<slot />
	</main>

	<div class="fixed top-0 left-0 w-full h-full bg-black bg-opacity-60 flex justify-center items-center"
			 v-show="showPopup">
		<div class="w-1/2 xl:w-1/4 h-3/4 xl:h-1/2 p-4 xl:p-12 bg-white overflow-auto">
			<div class="grid grid-cols-1 xl:grid-cols-4 items-center gap-1">
				<button @click="showPopup = false">Close</button>
				<button v-for="(d, idx) in userData" :key="idx" @click="jumpToUser(d.membershipType, d.membershipId)" class="text-center hover:underline">
					{{ d.bungieGlobalDisplayName }}#{{ _numTo4Str(d.bungieGlobalDisplayNameCode ?? -1) }}
				</button>
			</div>
		</div>
	</div>
</template>

<style>
html, body, #__nuxt {
	height: 100%;
}
body {
	@apply bg-slate-900;
}
</style>