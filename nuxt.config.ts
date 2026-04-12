// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "2026-04-07",
	devtools: { enabled: true },

	nitro: {
		preset: "cloudflare-module",

		cloudflare: {
			deployConfig: true,
			nodeCompat: true
		}
	},

	modules: ["@nuxt/ui", "@nuxtjs/i18n"],

	i18n: {
		vueI18n: "./i18n.config.ts",
		detectBrowserLanguage: {
			useCookie: true,
			cookieKey: "i18n_cookie",
		}
	},
})