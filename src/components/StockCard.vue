<template>
  <div class="stockCard">
    <h1>{{ symbol.toLocaleUpperCase() }}</h1>
    <h2>Owned: {{ portfolio[symbol.toLocaleUpperCase()] ? portfolio[symbol.toLocaleUpperCase()].qty : 0 }}</h2>
    <LineChart v-if="!error" v-bind:lineChartData="stockPriceHistory" label="Price" colour="#b282b5"></LineChart>
    <p class="error" v-if="error">Not found</p>
  </div>
</template>

<script lang="ts">
  import LineChart from '@/components/LineChart.vue';
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop, Watch } from 'vue-property-decorator';
  import { LineChartDataEntry } from './LineChart.vue';
  import axios from "axios";
  import Store from '@/auxiliary/store';

  @Component({
    components: { LineChart }
  })
  export default class StockCard extends Vue {

    @Prop({default: "TSLA"})
    symbol!: string;

    stockPriceHistory: LineChartDataEntry[] = [];
    error = false;

    intervalHandle: any;

    portfolio = Store.portfolio;

    created()
    {
      this.fetchData();
      this.intervalHandle = setInterval(this.fetchData, 60000);
    }

    fetchData()
    {
      const apiEndpoint = `https://api.iextrading.com/1.0/stock/${this.symbol}/chart/3m`;

      axios.get(apiEndpoint)
        .then( (json: any) => {
          this.error = false;
          this.stockPriceHistory = json.data.map((entry: any) => ({value: entry.close, time: new Date(entry.date)}));
        })
        .catch( err => {this.error = true; console.log(err) });
    }

    @Watch("symbol")
    onSymbolChanged(value: string)
    {
      this.fetchData();
    }

    destroyed()
    {
      clearInterval(this.intervalHandle);
    }
  }
</script>

<style scoped>

  .stockCard {
    margin: 8px;
  }
  h1 {
    font-size: small;
  }

  h2 {
    font-size: smaller;
  }
</style>