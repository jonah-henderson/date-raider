import { ref, onUnmounted, computed, type Ref } from 'vue';

import { useApiStore } from '@/store/api';
import { usePortfolioStore } from '@/store/portfolio';

export interface ManualCleanupPriceSubscription {
  price: Ref<number | null>;
  cleanup: () => void;
}

// Doesn't accept refs or getters to simplify subscribe/unsubscribe logic
export function useManualCleanupStockPrice(symbol: string): ManualCleanupPriceSubscription {
  const price = ref<number | null>(null);
  const api = useApiStore();

  const update = (newPrice: number) => (price.value = newPrice);

  api.subscribeToStockPrice(symbol, update);

  return {
    price,
    cleanup: () => {
      api.unsubscribeFromStockPrice(symbol, update);
    },
  };
}

// Convenience composable for unsubscribing from a stock price when component is unmounted
export function useStockPrice(symbol: string) {
  const { price, cleanup } = useManualCleanupStockPrice(symbol);

  onUnmounted(() => {
    cleanup();
  });

  return price;
}

export function useUnrealised(symbol: string) {
  const { getNumberOfSharesOwned, getTotalAmountInvested } = usePortfolioStore();
  const price = useStockPrice(symbol);

  const unrealised = computed(() => {
    if (price.value === null) {
      return 0;
    }
    const owned = getNumberOfSharesOwned(symbol);
    const invested = getTotalAmountInvested(symbol);
    const sellValue = owned * price.value;
    return sellValue - invested;
  });

  return unrealised;
}
