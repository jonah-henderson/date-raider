import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import Bottleneck from 'bottleneck';
import * as luxon from 'luxon';

const apiUrlBase = 'https://finnhub.io/api/v1';

const MILLIS_IN_SECOND = 1000;
const API_LIMIT_REFRESH_INTERVAL = 60 * MILLIS_IN_SECOND;

const finnhubLimiter = new Bottleneck({
  minTime: 40, // slightly less than 30 requests per second
  maxConcurrent: 10,
  reservoir: 55, // free tier permits 60 requests per minute, undershoot slightly
  reservoirRefreshAmount: 55,
  reservoirRefreshInterval: API_LIMIT_REFRESH_INTERVAL,
  highWater: 20,
  strategy: Bottleneck.strategy.LEAK,
});

const finnhubEndpoints = {
  symbolLookup: (symbol: string) => `/search?q=${symbol}`,
  quote: (symbol: string) => `/quote?symbol=${symbol}`,
  usStockSymbols: '/stock/symbol?exchange=US',
  candles: (symbol: string, from: number, to: number) =>
    `/stock/candle?symbol=${symbol}&resolution=D&from=${from}&to=${to}`,
};

interface StockInfo {
  currency: string;
  description: string;
  displaySymbol: string;
  figi: string;
  mic: string;
  symbol: string;
  type: string;
}

interface SymbolLookupResponse {
  count: number;
  result: SymbolDescription[];
}

interface QuoteData {
  c: number; // current price
  d: number; // change
  dp: number; // change (percentage)
  h: number; // high
  l: number; // low
  o: number; // open
  pc: number; // previous close
}

interface CandleData {
  c: number[]; // close prices
  h: number[]; // high prices
  l: number[]; // low prices
  o: number[]; // open prices
  s: 'ok' | 'no_data'; // status
  t: number[]; // timestamps
  v: number[]; // volume data
}

interface StockTradeMessage {
  type: string;
  data: {
    s: string; // symbol
    p: number; // last price
    t: number; // timestamp
    v: number; // volume
  }[];
}

export interface SymbolDescription {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
}

export const useApiStore = defineStore('api', () => {
  // **************************************************************************
  // API Key and initialisation
  // --------------------------------------------------------------------------
  const apiKey = ref<string>('');
  const isApiKeyValid = ref(false);
  const initialising = ref(true);
  const usSymbols = ref(new Set<string>());

  // Check API key validity by loading US stock symbols (Finnhub.io doesn't provide a ping/heartbeat endpoint)
  watch(
    apiKey,
    async () => {
      isApiKeyValid.value = false;

      try {
        const data = await getUsStocks();

        if ('error' in data) {
          return;
        }

        // If this is the first time loading US symbols, save them
        if (usSymbols.value.size === 0) {
          data.map((entry) => usSymbols.value.add(entry.symbol));
          initialising.value = false;
        }

        isApiKeyValid.value = true;
        localStorage.setItem('apiKey', apiKey.value!);
      } catch (err: any) {
        isApiKeyValid.value = false;
      }
    },
    { immediate: true },
  );
  apiKey.value = localStorage.getItem('apiKey') ?? '';

  // **************************************************************************
  // Rate limiting
  // --------------------------------------------------------------------------

  const isRateExceeded = ref(false);

  finnhubLimiter.on('depleted', () => {
    isRateExceeded.value = true;

    // bottleneck doesn't provide an event for reservoir refill, so check it on an interval
    const reservoirCheckerHandle = window.setInterval(async () => {
      const reservoirValue = await finnhubLimiter.currentReservoir();
      if (reservoirValue !== null && reservoirValue > 0) {
        isRateExceeded.value = false;
        window.clearInterval(reservoirCheckerHandle);
      }
    }, 1 * MILLIS_IN_SECOND);
  });

  const limitedFetch = finnhubLimiter.wrap(fetch);

  // **************************************************************************
  // WebSocket
  // --------------------------------------------------------------------------

  const webSocket = ref<WebSocket | null>(null);

  watch(isApiKeyValid, async () => {
    // If we don't have a valid API key, close down the old WebSocket and leave it null
    if (!isApiKeyValid.value) {
      webSocket.value?.close();
      webSocket.value = null;
      return;
    }

    // Otherwise, initialise a new one
    webSocket.value = new WebSocket(`wss://ws.finnhub.io?token=${apiKey.value}`);

    webSocket.value.addEventListener('message', (event) => {
      const parsedData = JSON.parse(event.data);
      const eventType = parsedData.type;

      if (eventType === 'trade') {
        const tradeData = parsedData as StockTradeMessage;
        const lastTrade = tradeData.data[tradeData.data.length - 1];
        const symbol = lastTrade.s;

        for (const callback of subscribers.get(symbol) || []) {
          callback(lastTrade.p);
        }
      }
    });

    // If the API key and WebSocket changed, we need to resend subscription messages
    // for all current subscriptions
    webSocket.value.addEventListener('open', () => {
      for (const symbol of Object.keys(subscribers)) {
        if (subscribers.get(symbol) && webSocket.value) {
          subscribe(webSocket.value, symbol);
        }
      }
    });
  });

  type PriceSubscriptionCallback = (price: number) => void;
  const subscribers = new Map<string, PriceSubscriptionCallback[]>();

  function subscribe(socket: WebSocket, symbol: string) {
    socket.send(JSON.stringify({ type: 'subscribe', symbol }));
  }

  function unsubscribe(socket: WebSocket, symbol: string) {
    socket.send(JSON.stringify({ type: 'unsubscribe', symbol }));
  }

  async function subscribeToStockPrice(symbol: string, callback: (price: number) => void) {
    if (!subscribers.has(symbol)) {
      subscribers.set(symbol, []);
    }
    const callbacks = subscribers.get(symbol)!;
    callbacks.push(callback);

    if (callbacks.length === 1) {
      // This was the first callback added, add a new subscription
      if (webSocket.value === null) {
        return;
      }
      if (webSocket.value.readyState !== WebSocket.OPEN) {
        webSocket.value.addEventListener('open', () => subscribe(webSocket.value!, symbol));
      } else {
        subscribe(webSocket.value!, symbol);
      }
    }
    const quote = await getQuote(symbol);
    for (const cb of callbacks) {
      cb(quote.c);
    }
  }

  function unsubscribeFromStockPrice(symbol: string, callback: (price: number) => void) {
    const callbacks = subscribers.get(symbol);

    callbacks?.filter((cb) => cb !== callback);
    if (callbacks?.length === 0) {
      unsubscribe(webSocket.value!, symbol);
      subscribers.delete(symbol);
    }
  }

  // **************************************************************************
  // Helpers
  // --------------------------------------------------------------------------

  function buildUrl(action: string) {
    return `${apiUrlBase}/${action}&token=${apiKey.value}`;
  }

  async function finnhubApiRequest<T>(action: string) {
    const url = buildUrl(action);
    const res = await limitedFetch(url);
    return (await res.json()) as T;
  }

  // **************************************************************************
  // Actions
  // --------------------------------------------------------------------------

  async function lookupSymbol(symbol: string) {
    return finnhubApiRequest<SymbolLookupResponse>(finnhubEndpoints.symbolLookup(symbol));
  }

  async function getQuote(symbol: string) {
    return finnhubApiRequest<QuoteData>(finnhubEndpoints.quote(symbol));
  }

  async function getUsStocks() {
    return finnhubApiRequest<StockInfo[]>(finnhubEndpoints.usStockSymbols);
  }

  async function getPricesForLast30Days(symbol: string) {
    const today = luxon.DateTime.now().startOf('day');
    const last30Days = today.minus(luxon.Duration.fromObject({ days: 30 }));

    const candleData = await finnhubApiRequest<CandleData>(
      finnhubEndpoints.candles(symbol, last30Days.toUnixInteger(), today.toUnixInteger()),
    );

    if (candleData.s === 'no_data') {
      return [];
    }

    return candleData.c.map((price, index) => ({
      value: price,
      time: new Date(candleData.t[index] * MILLIS_IN_SECOND),
    }));
  }

  function isUsSymbol(symbol: string) {
    return usSymbols.value.has(symbol);
  }

  return {
    apiKey,
    isApiKeyValid,
    webSocket,
    isUsSymbol,
    isRateExceeded,
    lookupSymbol,
    getQuote,
    getPricesForLast30Days,
    subscribeToStockPrice,
    unsubscribeFromStockPrice,
  };
});
