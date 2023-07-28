import { useApiStore, type SymbolDescription } from '@/store/api';
import { type MaybeRefOrGetter, toValue, watchEffect, ref } from 'vue';

export enum SymbolLookupState {
  Idle,
  Loading,
}

export function useSymbolLookup(symbol: MaybeRefOrGetter<string>) {
  const { lookupSymbol, isUsSymbol } = useApiStore();

  const symbolDescriptions = ref<SymbolDescription[]>([]);
  const state = ref(SymbolLookupState.Idle);

  watchEffect(async () => {
    const symbolValue = toValue(symbol);

    if (symbolValue === '') {
      return;
    }

    state.value = SymbolLookupState.Loading;
    const lookupResponse = await lookupSymbol(symbolValue);

    symbolDescriptions.value = lookupResponse.result.filter((symbolDescription) =>
      isUsSymbol(symbolDescription.symbol),
    );
    state.value = SymbolLookupState.Idle;
  });

  return { symbolDescriptions, state };
}
