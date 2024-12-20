import { HttpClient, HttpClientConfig } from "bungie-api-ts/http"

export function makeHttpClient(key: string): HttpClient {
	return async function(config: HttpClientConfig) {
		const url = new URL(config.url)
		for(let key in config.params) {
			url.searchParams.set(key, config.params[key])
		}

		const r = await fetch(url, {
			method: config.method,
			body: JSON.stringify(config.body),
			headers: {
				"X-API-Key": key,
			},
		})
		return await r.json()
	}
}
