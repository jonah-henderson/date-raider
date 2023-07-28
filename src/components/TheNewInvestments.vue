<script setup lang="ts">
import { NText, NSpin, NGrid, NGridItem } from 'naive-ui';
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';

import SearchBox from './SearchBox.vue';
import NewInvestmentStockCard from './NewInvestmentStockCard.vue';
import { SymbolLookupState, useSymbolLookup } from '@/composables/symbolLookup';
import { useDebounced } from '@/composables/debounce';
import { useApiStore } from '@/store/api';

const symbol = ref('');
const { symbolDescriptions: matchedInfo, state: lookupState } = useSymbolLookup(
  useDebounced(symbol, 500),
);
const { isRateExceeded } = storeToRefs(useApiStore());
const sortedInfo = computed(() => {
  const matchedInfoValue = matchedInfo.value;
  if (matchedInfoValue === null) {
    return [];
  }
  return [...matchedInfoValue].sort((a, b) => a.displaySymbol.localeCompare(b.displaySymbol));
});
</script>

<template>
  <header>
    <div class="search-container">
      <SearchBox
        :disabled="isRateExceeded"
        placeholder="search ticker symbols"
        @search-text-changed="(text) => (symbol = text)"
      />
      <NSpin
        class="loading-spinner"
        size="small"
        v-show="lookupState === SymbolLookupState.Loading"
        :show="false"
      />
    </div>
  </header>
  <NText type="warning" v-show="isRateExceeded">Rate limit exceeded, please wait...</NText>
  <NGrid class="cards" cols="2 m:3 l:5" :x-gap="8" :y-gap="8" :responsive="'screen'">
    <NGridItem
      v-for="(info, index) in sortedInfo"
      :key="info.symbol"
      :data-index="index"
      :data-reverse-index="sortedInfo.length - index"
    >
      <NewInvestmentStockCard :symbol="info.displaySymbol" :description="info.description" />
    </NGridItem>
  </NGrid>
</template>

<style scoped>
header {
  display: flex;
  flex-flow: row;
  margin-bottom: 16px;
}
.search-container {
  display: flex;
  flex-flow: row;
  align-items: center;
}

.loading-spinner {
  margin-left: 16px;
}
</style>
