import {
	BungieMembershipType,
	searchByGlobalNamePost,
	UserInfoCard,
	UserSearchResponseDetail,
} from "bungie-api-ts/user"
import { searchDestinyPlayerByBungieName } from "bungie-api-ts/destiny2"
import { HttpClient } from "bungie-api-ts/http"
import { BungieHttpClient } from "~/server/api/bungie_api"

export default defineEventHandler(async (event) => {
	const searchName = await readBody<string>(event)

	if(searchName === undefined) {
		return Response.json({
			error: "invalid search name",
		}, { status: 400 })
	}

	const client = BungieHttpClient

	let result: UserInfoCard[]
	const splitterIndex = searchName.indexOf("#")
	try {
		if(splitterIndex !== -1) {
			const displayName = searchName.substring(0, splitterIndex)
			const displayNameCode = parseInt(searchName.substring(splitterIndex + 1))

			result = await getUsers(client, displayName, displayNameCode)
		} else {
			result = await getUsersWithoutCode(client, searchName)
		}
	} catch(e) {
		return Response.json({
			error: e,
		}, { status: 500 })
	}

	return Response.json({
		data: result,
	})
})

async function getUsersWithoutCode(client: HttpClient, searchName: string) {
	const result: UserSearchResponseDetail[] = []
	for(let page = 0; ; page++) {
		console.log(`Searching User by Name ${searchName} at page ${page}`)

		const resp = await searchByGlobalNamePost(client, { page }, {
			displayNamePrefix: searchName,
		})

		if(resp.ErrorCode !== 1) {
			return Promise.reject(resp.Message)
		}

		const { searchResults, hasMore } = resp.Response
		result.push(...searchResults.filter(x => x.destinyMemberships.length > 0))

		if(!hasMore) {
			break
		}
	}

	result.sort(x => x.bungieGlobalDisplayNameCode ?? -1)

	return result.map(d => d.destinyMemberships).flat()
}

async function getUsers(client: HttpClient, displayName: string, displayNameCode: number) {
	const resp = await searchDestinyPlayerByBungieName(client, { membershipType: BungieMembershipType.All }, {
		displayName,
		displayNameCode,
	})
	if(resp.ErrorCode !== 1) {
		return Promise.reject(resp.Message)
	}

	return resp.Response
}