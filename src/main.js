// src/main.js
import { createApp } from "vue"; // 使用 createApp 而不是 Vue.createApp
import App from "./App.vue";
import i18n from "./i18n";

// 不要使用 new Vue()，而是使用 createApp
const app = createApp(App);
app.use(i18n);
app.mount("#app");
