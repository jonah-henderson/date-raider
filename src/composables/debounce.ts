import { type MaybeRefOrGetter, ref, toValue, watchEffect } from 'vue';

export function useDebounced<T>(value: MaybeRefOrGetter<T>, debounceMilliseconds: number) {
  const debouncedRef = ref(toValue(value));
  let timerId: number | null = null;

  watchEffect(() => {
    if (timerId) {
      clearTimeout(timerId);
    }
    const currentValue = toValue(value);
    timerId = setTimeout(() => {
      // this looks a bit silly but it seems like the simplest way
      // to make sure deeply nested refs are properly unwrapped
      debouncedRef.value = ref(currentValue).value;
    }, debounceMilliseconds);
  });

  return debouncedRef;
}
