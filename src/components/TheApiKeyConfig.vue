<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useApiStore } from '@/store/api';
import { ref } from 'vue';
import { NInputGroup, NInputGroupLabel, NInput, NButton, NTooltip, NText } from 'naive-ui';
import MaterialIcon from './MaterialIcon.vue';

const { apiKey, isApiKeyValid } = storeToRefs(useApiStore());
const apiKeyInput = ref<HTMLInputElement | null>(null);

const apiKeyInputValue = ref(apiKey.value);
</script>

<template>
  <div class="input-row">
    <NInputGroup>
      <NInputGroupLabel>Finnhub.io API key</NInputGroupLabel>
      <NInput
        name="apiKey"
        type="text"
        placeholder="Set your API key"
        v-model:value="apiKeyInputValue"
        ref="apiKeyInput"
        autosize
        style="min-width: 300px"
        :clearable="true"
      />
      <NButton @click="apiKey = apiKeyInputValue">Set</NButton>
    </NInputGroup>
    <NTooltip>
      <template #trigger>
        <MaterialIcon icon-name="info" class="left-margin"></MaterialIcon>
      </template>
      Date Raider only supports Finnhub.io free plan keys. Paid plan keys may be used, but free plan
      limits will still be enforced.
    </NTooltip>
  </div>
  <div>
    <NText type="error" v-show="apiKey === apiKeyInputValue && !isApiKeyValid"
      >API key is invalid</NText
    >
  </div>
</template>

<style scoped>
.input-row {
  display: inline-flex;
  flex-flow: row;
  align-items: center;
}

.left-margin {
  margin-left: 16px;
}
</style>
