<script setup lang="ts">
const props = defineProps<{ iconName: string }>();
</script>

<template>
  <span class="material-symbols-outlined">
    {{ props.iconName }}
  </span>
</template>

<style scoped>
.material-symbols-outlined {
  user-select: none;
}
</style>
