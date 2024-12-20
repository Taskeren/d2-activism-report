import lEn from "~/static/localization/en.json"
import lChs from "~/static/localization/zh_chs.json"
import lCht from "~/static/localization/zh_cht.json"

import lActivityEn from "~/static/localization/generated/DestinyActivityDefinition_en.json"
import lActivityChs from "~/static/localization/generated/DestinyActivityDefinition_zh-chs.json"
import lActivityCht from "~/static/localization/generated/DestinyActivityDefinition_zh-cht.json"

export default defineI18nConfig(() => ({
	legacy: false,
	locale: "en",
	fallbackLocale: "en",
	messages: {
		en: {
			...lEn,
			"activity_name": { ...lActivityEn },
		},
		"zh_chs": {
			...lChs,
			"activity_name": { ...lActivityChs },
		},
		"zh_cht": {
			...lCht,
			"activity_name": { ...lActivityCht },
		},
	},
}))