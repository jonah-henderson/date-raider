<script setup lang="ts">
import { NInput } from 'naive-ui';

const emit = defineEmits<{ searchTextChanged: [value: string] }>();
const props = defineProps<{ placeholder?: string }>();
</script>

<template>
  <NInput
    round
    clearable
    :placeholder="props.placeholder || 'search'"
    :on-update:value="(value) => emit('searchTextChanged', value)"
  />
</template>

<style scoped>
input {
  font-size: 16px;
  font-size: max(16px, 1em);
  font-family: inherit;
  padding: 0.25em 0.5em;
  background: transparent;
  border: 1px solid #aaa;
  color: #aaa;

  border-radius: 4px;
  line-height: 1;
  transition: 180ms box-shadow ease-in-out;
}

input:focus {
  border: 2px solid var(--color-primary);
  color: var(--color-primary);
  box-shadow: 0 0 0 1px var(--color-primary);
  outline: 1px solid transparent;
}
</style>
