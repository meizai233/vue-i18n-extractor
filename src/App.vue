<template>
  <div id="app">
    <TestI18n />
  </div>
</template>

<script>
import TestI18n from "./components/TestI18n.vue";

export default {
  name: "App",
  components: {
    TestI18n,
  },
  mounted() {
    console.log("i18n instance:", this.$i18n);
  },
};
</script>
