<script setup lang="ts">
import { NDivider, NSkeleton, NButton, NButtonGroup, NStatistic, NSpace } from 'naive-ui';
import { usePortfolioStore } from '@/store/portfolio';
import TimeSeriesChart from './TimeSeriesChart.vue';
import { useStockPrice, useUnrealised } from '@/composables/stockPrice';
import { useHistoricalPrices } from '@/composables/historicalPrices';

const props = defineProps<{
  symbol: string;
  sharesOwned: number;
  totalInvested: number;
}>();

const store = usePortfolioStore();
const livePrice = useStockPrice(props.symbol);
const unrealised = useUnrealised(props.symbol);
const historicalPrices = useHistoricalPrices(props.symbol);

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
</script>

<template>
  <div class="portfolio-entry-details">
    <div class="chart-container">
      <NSkeleton class="chart-skeleton" v-if="historicalPrices === null" />
      <TimeSeriesChart
        v-else-if="historicalPrices.length > 0"
        :data="historicalPrices"
        chart-label="Price"
      />
      <p v-else>Historical prices unavailable</p>
    </div>
    <NDivider class="full-height" :vertical="true" />
    <NSpace class="statistics" :align="'center'">
      <NStatistic class="statistic" label="Owned" :tabular-nums="true">{{
        sharesOwned
      }}</NStatistic>
      <NStatistic class="statistic" label="Invested" :tabular-nums="true">{{
        formatter.format(totalInvested)
      }}</NStatistic>
      <NStatistic class="statistic" label="Current price" :tabular-nums="true">
        {{ livePrice === null ? '...' : formatter.format(livePrice) }}
      </NStatistic>
      <NStatistic class="statistic" label="Unrealised" :tabular-nums="true">
        <p v-if="unrealised === null">...</p>
        <span v-else :class="unrealised > 0 ? 'gain' : 'loss'">{{
          formatter.format(unrealised)
        }}</span>
      </NStatistic>
    </NSpace>
    <NButtonGroup size="small" v-if="livePrice !== null">
      <NButton @click="store.buyStock(symbol, livePrice)" round>Buy</NButton>
      <NButton @click="store.sellStock(symbol, livePrice)" round>Sell</NButton>
    </NButtonGroup>
  </div>
</template>

<style scoped>
.chart-container {
  align-self: stretch;
  display: flex;
  place-items: center;
  flex: 1;
  min-width: 300px; /* set by chart.js */
}

.full-height {
  margin: 0 16px;
  height: unset;
  align-self: stretch;
}

.statistics {
  flex: 3;
}

.statistic {
  width: 100px;
}

.chart-container p {
  text-align: center;
}

.chart-container * {
  width: 100%;
}
.chart-skeleton {
  height: unset; /* naive UI forces 1em */
}

.unavailable {
  display: flex;
  flex-flow: row;
  place-content: center;
}
.portfolio-entry-details {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
}
</style>
