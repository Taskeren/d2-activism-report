import { getCharacterActivityHistoryInTime } from "~/server/bungie-api-wrapper"
import {
	DestinyCharacterComponent,
	DestinyComponentType,
	DestinyHistoricalStatsPeriodGroup,
	DestinyInventoryItemDefinition,
	DestinyProfileComponent,
	getDestinyEntityDefinition,
	getProfile,
} from "bungie-api-ts/destiny2"
import { BungieHttpClient } from "~/server/api/bungie_api"

export default defineEventHandler(async (event) => {
	const client = BungieHttpClient

	const mType = getRouterParam(event, "mType")
	const mId = getRouterParam(event, "mId")
	if(mType === undefined || mId === undefined) {
		return Response.json({
			error: "invalid membership info",
		}, { status: 400 })
	}

	const mTypeNum = parseInt(mType)
	if(isNaN(mTypeNum)) {
		return Response.json({
			error: "invalid membership info",
		}, { status: 400 })
	}

	const sentinelDate = new Date()
	sentinelDate.setDate(sentinelDate.getDate() - 7)

	// get the characters data
	const respGetProfile = await getProfile(client, {
		membershipType: mTypeNum,
		destinyMembershipId: mId,
		components: [DestinyComponentType.Characters, DestinyComponentType.Profiles],
	})
	if(respGetProfile.ErrorCode !== 1) {
		// return Response.json({
		// 	error: respGetProfile.Message,
		// }, { status: 500 })
		throw createError({
			statusCode: 500,
			statusMessage: respGetProfile.Message,
			data: respGetProfile,
		})
	}
	const userProfile: DestinyProfileComponent = respGetProfile.Response.profile.data!
	const characters: { [p: string]: DestinyCharacterComponent } = respGetProfile.Response.characters.data ?? {}

	// find the last logged in character
	// const lastPlayedCharacter = Object.values(characters).reduce((a, b) => new Date(a.dateLastPlayed).getTime() > new Date(b.dateLastPlayed).getTime() ? a : b)
	const lastPlayedCharacter = Object.values(characters)[0]
	const lastPlayedCharacterEmblemHash = lastPlayedCharacter.emblemHash

	const respEmblemDef = await getDestinyEntityDefinition(client, {
		hashIdentifier: lastPlayedCharacterEmblemHash,
		entityType: "DestinyInventoryItemDefinition",
	})
	if(respEmblemDef.ErrorCode !== 1) {
		// return Response.json({
		// 	error: respEmblemDef.Message,
		// }, { status: 500 })
		throw createError({
			statusCode: 500,
			statusMessage: respEmblemDef.Message,
			data: respEmblemDef,
		})
	}
	const emblemDef = respEmblemDef.Response as unknown as DestinyInventoryItemDefinition

	// aggregate activity histories
	const histories: DestinyHistoricalStatsPeriodGroup[] = []
	try {
		const characterIds = Object.keys(characters)
		for await(const cId of characterIds) {
			const characterHistories = await getCharacterActivityHistoryInTime(client, mTypeNum, mId, cId, sentinelDate)
			histories.push(...characterHistories)
		}
	} catch(e: any) {
		console.error(e)
		throw createError({
			statusCode: 500,
			statusMessage: "Failed to fetch activity histories",
		})
	}
	histories.sort((a, b) => new Date(b.period).getTime() - new Date(a.period).getTime())

	return Response.json({
		histories: histories,
		characters: characters,
		emblemDefinition: emblemDef,
		userInfo: userProfile.userInfo,
	})
})