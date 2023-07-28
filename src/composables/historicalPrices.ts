import { useApiStore } from '@/store/api';
import { type MaybeRefOrGetter, toValue, watchEffect, ref } from 'vue';

export function useHistoricalPrices(symbol: MaybeRefOrGetter<string>) {
  const { getPricesForLast30Days } = useApiStore();

  const historicalPrices = ref<{ value: number; time: Date }[] | null>(null);

  watchEffect(async () => {
    const symbolValue = toValue(symbol);

    if (symbolValue === '') {
      return;
    }

    historicalPrices.value = await getPricesForLast30Days(symbolValue);
  });

  return historicalPrices;
}
