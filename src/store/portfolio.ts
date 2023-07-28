import { defineStore } from 'pinia';
import { computed, ref, watch, reactive } from 'vue';

import {
  useManualCleanupStockPrice,
  type ManualCleanupPriceSubscription,
} from '@/composables/stockPrice';

interface PortfolioEntry {
  symbol: string;
  sharesOwned: number;
  purchaseHistory: number[];
}

interface HistoryEntry {
  value: number;
  time: Date;
}

interface SubscriptionEntry extends ManualCleanupPriceSubscription {
  symbol: string;
}

// The portfolio store is reponsible for all data related to owned stocks,
// account balance, and unrealised gains or losses

export const usePortfolioStore = defineStore('portfolio', () => {
  // ****************************************************************
  // Portfolio
  // ----------------------------------------------------------------
  const portfolio = ref<PortfolioEntry[]>([]);

  // The symbols that are currently in the portfolio, regardless of quantity
  const activeSymbols = computed(() => portfolio.value.map((entry) => entry.symbol));

  // Subscriptions must be reactive in order to calculate gains/losses
  const priceSubscriptions = ref<SubscriptionEntry[]>([]);

  // We use changes in active symbols to add or remove price subscriptions
  watch(activeSymbols, (newVals, oldVals) => {
    // if it's in new, but not in old, we need to subscribe
    const symbolsToSubscribe = newVals.filter((newVal) => !oldVals.includes(newVal));

    // if it's in old, but not in new, we need to unsubscribe
    const symbolsToUnsubscribe = oldVals.filter((oldVal) => !newVals.includes(oldVal));

    for (const symbolToSubscribe of symbolsToSubscribe) {
      priceSubscriptions.value.push(
        reactive({
          symbol: symbolToSubscribe,
          ...useManualCleanupStockPrice(symbolToSubscribe),
        }),
      );
    }

    for (const symbolToUnsubscribe of symbolsToUnsubscribe) {
      const index = priceSubscriptions.value.findIndex((sub) => sub.symbol === symbolToUnsubscribe);
      priceSubscriptions.value[index].cleanup();
      priceSubscriptions.value.splice(index, 1);
    }
  });

  // ****************************************************************
  // Account balance
  // ----------------------------------------------------------------

  const balanceHistory = ref<HistoryEntry[]>([{ value: 5000, time: new Date() }]);
  const balance = computed(() => balanceHistory.value[balanceHistory.value.length - 1].value);

  // ****************************************************************
  // Unrealised gains/losses
  // ----------------------------------------------------------------

  const unrealised = computed(() =>
    priceSubscriptions.value.map((subscription) => {
      return subscription.price
        ? subscription.price * getNumberOfSharesOwned(subscription.symbol) -
            getTotalAmountInvested(subscription.symbol)
        : 0;
    }),
  );

  const totalUnrealised = computed(() => {
    return unrealised.value.reduce((acc, next) => acc + next, 0);
  });

  watch(totalUnrealised, (newVal) => {
    unrealisedHistory.value.push({ time: new Date(), value: newVal });
    if (unrealisedHistory.value.length > 30) {
      unrealisedHistory.value.shift();
    }
  });

  const unrealisedHistory = ref<HistoryEntry[]>([{ value: 0, time: new Date() }]);

  // ****************************************************************
  // Initialisation from storage
  // ----------------------------------------------------------------

  const savedStateString = localStorage.getItem('portfolioState');

  if (savedStateString !== null) {
    const savedState = JSON.parse(savedStateString);
    balanceHistory.value = savedState.balanceHistory;
    portfolio.value = savedState.entries;
    unrealisedHistory.value = savedState.unrealisedHistory;
  }

  // ****************************************************************
  // Helper functions
  // ----------------------------------------------------------------

  function findEntry(symbol: string): PortfolioEntry | undefined {
    return portfolio.value.find((entry) => entry.symbol === symbol);
  }

  // ****************************************************************
  // Actions/getters
  // ----------------------------------------------------------------

  function buyStock(symbol: string, currentPrice: number) {
    let entry = findEntry(symbol);
    if (!entry) {
      entry = {
        sharesOwned: 0,
        purchaseHistory: [],
        symbol,
      };
    }

    if (currentPrice > balance.value) {
      return;
    }

    if (entry.sharesOwned === 0) {
      portfolio.value.push(entry);
    }
    entry.sharesOwned++;
    entry.purchaseHistory.push(currentPrice);
    balanceHistory.value.push({ time: new Date(), value: balance.value - currentPrice });
  }

  function sellStock(symbol: string, currentPrice: number) {
    const entry = findEntry(symbol);
    if (!entry) {
      return;
    }

    entry.sharesOwned--;
    entry.purchaseHistory.pop();
    balanceHistory.value.push({ time: new Date(), value: balance.value + currentPrice });

    if (entry.sharesOwned === 0) {
      portfolio.value = portfolio.value.filter((entry) => entry.sharesOwned > 0);
    }
  }

  function getTotalAmountInvested(symbol: string) {
    const entry = findEntry(symbol);
    if (!entry) {
      return 0;
    }
    return entry.purchaseHistory.reduce((acc, next) => acc + next, 0);
  }

  function getNumberOfSharesOwned(symbol: string) {
    const entry = findEntry(symbol);
    if (!entry) {
      return 0;
    }
    return entry.sharesOwned;
  }

  return {
    entries: portfolio,
    balance,
    balanceHistory,
    getTotalAmountInvested,
    getNumberOfSharesOwned,
    buyStock,
    sellStock,
    unrealisedHistory,
    totalUnrealised,
  };
});
