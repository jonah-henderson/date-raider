<script setup lang="ts">
import { NStatistic } from 'naive-ui';

import { usePortfolioStore } from '@/store/portfolio';
import TimeSeriesChart from '@/components/TimeSeriesChart.vue';
import { computed } from 'vue';

const store = usePortfolioStore();

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const unrealisedClass = computed(() => (store.totalUnrealised > 0 ? 'gain' : 'loss'));
</script>

<template>
  <div class="charts">
    <div>
      <NStatistic label="Balance">{{ formatter.format(store.balance) }}</NStatistic>
      <TimeSeriesChart :data="store.balanceHistory" chart-label="Balance" />
    </div>
    <div>
      <NStatistic label="Unrealised">
        <p :class="unrealisedClass">{{ formatter.format(store.totalUnrealised) }}</p>
      </NStatistic>
      <TimeSeriesChart :data="store.unrealisedHistory" chart-label="Unrealised" :y-line="0" />
    </div>
  </div>
</template>

<style scoped>
.charts {
  display: flex;
  flex-flow: row;
  gap: 16px;
}

.charts > div {
  /* flex-grow: 1; */
  width: 50%;
}
header {
  background-color: var(--color-primary);
  color: white;
  text-align: center;
}
</style>
