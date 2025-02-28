<template>
  <div id="app">
    <TestI18n />
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";
import TestI18n from "./components/TestI18n.vue";

// 获取 i18n 实例
const { locale, messages } = useI18n();

onMounted(() => {
  console.log("i18n instance:", { locale: locale.value, messages: messages.value });
});
</script>
