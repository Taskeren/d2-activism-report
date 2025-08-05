import { BungieMembershipType, DestinyHistoricalStatsPeriodGroup, getActivityHistory } from "bungie-api-ts/destiny2"
import { HttpClient } from "bungie-api-ts/http"

const MAX_PAGE_PER_CHARACTER = 50

export async function getCharacterActivityHistoryInTime(cli: HttpClient, membershipType: BungieMembershipType, membershipId: string, characterId: string, sentinelTime: Date, countPerRequest: number = 50): Promise<DestinyHistoricalStatsPeriodGroup[]> {
	let result: DestinyHistoricalStatsPeriodGroup[] = []
	for(let page = 0; ; page++) {
		console.debug(`Fetching Activity Histories for ${membershipType}:${membershipId} #${characterId} page ${page}`)
		let resp = await getActivityHistory(cli, {
			characterId: characterId,
			membershipType: membershipType,
			destinyMembershipId: membershipId,
			count: countPerRequest,
			page: page,
		})

		// check success
		if(resp.ErrorCode !== 1) {
			console.error(resp)
			throw createError({
				statusCode: 500,
				statusMessage: resp.Message,
				data: resp,
			})
		}

		const activities = resp.Response.activities
		if(activities == undefined || activities.length == 0) break // something went wrong, no activities found, time to break
		const activities_filtered = activities.filter(act => {
			const thisTime = new Date(act.period)
			return thisTime.getTime() >= sentinelTime.getTime() // must be later than the sentinel time
		})
		result.push(...activities_filtered)
		console.debug(`Grabbed ${activities_filtered.length} activities for ${membershipType}:${membershipId} #${characterId} page ${page}`)
		if(activities.length > activities_filtered.length) { // something has been filtered, time to break
			break
		}
		if(page > MAX_PAGE_PER_CHARACTER) { // don't make too many requests
			break
		}
	}
	return result
}

