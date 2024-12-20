import { HttpClient } from "bungie-api-ts/http"
import { makeHttpClient } from "~/server/bungie-api-facilities"

export const API_KEY = "573fc23726ac47468cbe69e0c1f6a792"

export const BungieHttpClient: HttpClient = makeHttpClient(API_KEY)