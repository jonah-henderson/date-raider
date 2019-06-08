<template>
  <div class="overview">
    <h1>Account</h1>
    <div id="balanceGraph">
      <LineChart label="Balance" v-bind:lineChartData="accountHistory" colour="#b282b5"></LineChart>
    </div>
    <h1>Balance</h1>
    <h2>${{ currentBalance.value.toFixed(2) }}</h2>
    <h1>Unrealised</h1>
    <h2>${{ unrealised.value.toFixed(2) }}</h2>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import LineChart from '@/components/LineChart.vue';
import Store from '@/auxiliary/store'; // @ is an alias to /src

@Component({
  components: {
    LineChart,
  },
})
export default class Overview extends Vue {
  accountHistory = Store.accountHistory;
  currentBalance = Store.currentBalance;
  unrealised = Store.unrealisedProfit;
  intervalHandle: any = null;

  created()
  {
    Store.updateTotalUnrealised();
    this.intervalHandle = setInterval(Store.updateTotalUnrealised.bind(Store), 60000);
  }

  destroyed()
  {
    clearInterval(this.intervalHandle);
  }
}
</script>

<style scoped>
  .overview
  {
  }

  #balanceGraph {
    /*min-width: 600px;*/
  }
</style>