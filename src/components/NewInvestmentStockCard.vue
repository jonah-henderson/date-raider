<script setup lang="ts">
import { NCard, NButton, NSpace } from 'naive-ui';

import PriceChange from './PriceChange.vue';
import { usePortfolioStore } from '@/store/portfolio';
import { useStockPrice } from '@/composables/stockPrice';

const props = defineProps<{
  symbol: string;
  description?: string;
}>();

const portfolio = usePortfolioStore();
const livePrice = useStockPrice(props.symbol);
</script>

<template>
  <NCard class="stock-card" size="small" :hoverable="true" :title="symbol">
    <p v-if="description" :title="description">{{ description }}</p>
    <PriceChange :stock="symbol" />
    <template #footer>
      <NSpace justify="end">
        <NButton
          v-if="livePrice !== null"
          @click="portfolio.buyStock(symbol, livePrice)"
          size="small"
          round
          >Buy</NButton
        >
      </NSpace>
    </template>
  </NCard>
</template>

<style scoped>
.stock-card p {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
