// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "2024-11-01",
	devtools: { enabled: true },

	nitro: {
		preset: "cloudflare-pages",
	},

	modules: ["nitro-cloudflare-dev", "@nuxt/ui", "@nuxtjs/i18n"],

	i18n: {
		vueI18n: "./i18n.config.ts",
		detectBrowserLanguage: {
			useCookie: true,
			cookieKey: "i18n_cookie",
		}
	},
})