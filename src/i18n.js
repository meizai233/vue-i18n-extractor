// src/i18n.js
import { createI18n } from "vue-i18n";
import zh from "../lang/zh.json";
import en from "../lang/en.json";

const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: "zh", // 设置默认语言
  messages: {
    zh,
    en,
  },
});

export default i18n;
