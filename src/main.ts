import "./assets/main.css"

import { createApp } from "vue"
import { createPinia } from "pinia"

import App from "./App.vue"
import router from "./router"
import { createI18n } from "vue-i18n"

import enLocalization from "./assets/localization/en.json"
import chsLocalization from "./assets/localization/zh_chs.json"
import chtLocalization from "./assets/localization/zh_cht.json"

import enActivityLocalization from "./assets/localization/generated/DestinyActivityDefinition_en.json"
import chsActivityLocalization from "./assets/localization/generated/DestinyActivityDefinition_zh-chs.json"
import chtActivityLocalization from "./assets/localization/generated/DestinyActivityDefinition_zh-cht.json"

const i18n = createI18n({
  locale: "en",
  fallbackLocale: "en",
  messages: {
    en: {
      ...enLocalization,
      activity_name: {
        ...enActivityLocalization,
      },
    },
    zh_chs: {
      ...chsLocalization,
      activity_name: {
        ...chsActivityLocalization,
      },
    },
    zh_cht: {
      ...chtLocalization,
      activity_name: {
        ...chtActivityLocalization,
      },
    },
  },
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount("#app")
