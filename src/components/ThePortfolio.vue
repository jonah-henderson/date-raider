<script setup lang="ts">
import { NCollapse, NCollapseItem } from 'naive-ui';
import { computed, ref } from 'vue';

import { usePortfolioStore } from '@/store/portfolio';

import PortfolioEntry from './PortfolioEntryDetails.vue';
import PriceChange from './PriceChange.vue';
import MaterialIcon from './MaterialIcon.vue';
import SearchBox from './SearchBox.vue';

const portfolio = usePortfolioStore();

portfolio.$subscribe((mutation, state) => {
  localStorage.setItem('portfolioState', JSON.stringify(state));
});

const filterText = ref<string | null>(null);

function shouldBeShown(symbol: string) {
  if (filterText.value === null) {
    return true;
  }
  return symbol.includes(filterText.value.toUpperCase());
}

const expandedItems = ref<Set<number>>(new Set());
const visibleEntryNames = computed(() => {
  const names = new Set<number>();
  for (let i = 0; i < portfolio.entries.length; i++) {
    if (shouldBeShown(portfolio.entries[i].symbol)) {
      names.add(i);
    }
  }
  return names;
});

function handleCollapseItemClick({ name, expanded }: { name: number; expanded: boolean }) {
  if (expanded) {
    expandedItems.value.add(name);
  } else {
    expandedItems.value.delete(name);
  }
}
</script>

<template>
  <header>
    <div>
      <SearchBox @search-text-changed="(text) => (filterText = text)" placeholder="filter" />
      <MaterialIcon
        class="clickable icon"
        @click="expandedItems = new Set()"
        icon-name="collapse_all"
        title="collapse all"
      />
      <MaterialIcon
        class="clickable"
        @click="expandedItems = new Set(visibleEntryNames)"
        icon-name="expand_all"
        title="expand all"
      />
    </div>
  </header>
  <div class="portfolio-container">
    <NCollapse
      display-directive="show"
      :expanded-names="[...expandedItems]"
      @item-header-click="handleCollapseItemClick"
    >
      <template v-for="(entry, index) in portfolio.entries" :key="entry.symbol">
        <NCollapseItem v-show="shouldBeShown(entry.symbol)" :title="entry.symbol" :name="index">
          <template #header-extra>
            <PriceChange :stock="entry.symbol" />
          </template>
          <PortfolioEntry
            :symbol="entry.symbol"
            :total-invested="portfolio.getTotalAmountInvested(entry.symbol)"
            :shares-owned="entry.sharesOwned"
          />
        </NCollapseItem>
      </template>
    </NCollapse>
  </div>
</template>

<style scoped>
.clickable {
  cursor: pointer;
}

.icon {
  margin-left: 8px;
}

header {
  display: flex;
  flex-flow: row;
  align-items: center;
  margin-bottom: 16px;
  justify-content: end;
}

header div {
  display: flex;
  align-items: center;
}

.subheading {
  display: inline;
  flex-grow: 1;
}
</style>
