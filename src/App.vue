<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { NConfigProvider, NDivider, darkTheme, type GlobalThemeOverrides } from 'naive-ui';

import { useApiStore } from './store/api';
import TheHeader from './components/TheHeader.vue';
import TheNewInvestments from './components/TheNewInvestments.vue';
import ThePortfolio from './components/ThePortfolio.vue';
import TheAccount from './components/TheAccount.vue';
import TheApiKeyConfig from './components/TheApiKeyConfig.vue';

const { isApiKeyValid } = storeToRefs(useApiStore());

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#802392',
    primaryColorHover: '#BE82C9',
    primaryColorPressed: '#B353C6',
    primaryColorSuppl: '#4D2C54',
  },
};
</script>

<template>
  <NConfigProvider :theme="darkTheme" :theme-overrides="themeOverrides">
    <TheHeader />
    <NDivider>Configuration</NDivider>
    <TheApiKeyConfig />
    <div v-if="isApiKeyValid">
      <NDivider>Account</NDivider>
      <TheAccount />
      <NDivider>Invest</NDivider>
      <TheNewInvestments />
      <NDivider>Portfolio</NDivider>
      <ThePortfolio />
    </div>
  </NConfigProvider>
</template>

<style scoped></style>
