<template>
  <div class="test-i18n">
    <h1>欢迎使用自动国际化插件</h1>
    <p>这是一个测试页面</p>
    <div class="buttons">
      <button @click="handleClick">点击测试</button>
      <button @click="switchLang">{{ $t("qie-huan-yu-yan") }}</button>
    </div>
    <div class="content">
      <p>当前状态：{{ status }}</p>
      <span>测试数据：{{ testData }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "TestI18n",
  data() {
    return {
      status: "正在运行中",
      testData: "示例数据",
    };
  },
  methods: {
    created() {
      console.log(this.$t);
    },
    handleClick() {
      alert(this.$t);
    },
    switchLang() {
      const newLang = this.$i18n.locale === "zh" ? "en" : "zh";
      this.$i18n.locale = newLang;
    },
  },
};
</script>
