<template>
  <div class="test-i18n">
    <h1>欢迎使用自动国际化插件</h1>
    <p>这是一个测试页面</p>
    <div class="buttons">
      <button @click="handleClick">点击测试</button>
      <button @click="switchLang">切换语言</button>
    </div>
    <div class="content">
      <p>当前状态：正在运行中</p>
      <span>测试数据：示例数据</span>
    </div>
  </div>
</template>

<script setup>
// import { ref } from "vue";
/* eslint-disable */
import { useI18n } from "vue-i18n"; // 假设使用vue-i18n作为国际化库

// 使用组合式API获取i18n实例
const { t, locale } = useI18n();

// const status = ref("正在运行中");
// const testData = ref("示例数据");

// 方法
const handleClick = () => {
  alert("点击了一个按钮");
};

const switchLang = () => {
  locale.value = locale.value === "zh" ? "en" : "zh";
};
</script>
