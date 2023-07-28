<script setup lang="ts">
import { reactive, watch } from 'vue';
import gsap from 'gsap';
import { useStockPrice } from '@/composables/stockPrice';

const props = defineProps<{
  stock: string;
}>();

const livePrice = useStockPrice(props.stock);

const tweened = reactive({
  number: livePrice.value || 0,
});

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

let displayAs: 'gain' | 'loss' | 'none' = 'none';

watch(livePrice, (newVal, oldVal) => {
  if (newVal === null) {
    displayAs = 'none';
    return;
  }
  if (oldVal === null) {
    displayAs = 'none';
  } else if (newVal > oldVal) {
    displayAs = 'gain';
  } else if (newVal < oldVal) {
    displayAs = 'loss';
  } else {
    displayAs = 'none';
  }
  gsap.to(tweened, { duration: 0.3, number: Number(newVal) || 0 });
});
</script>

<template>
  <p :class="displayAs">{{ livePrice === null ? '...' : formatter.format(tweened.number) }}</p>
</template>

<style scoped>
.gain::before {
  content: '🞁 ';
}
.loss::before {
  content: '🞃 ';
}
.none {
  color: inherit;
}
</style>
