<template>
  <div class="buy">
    <h1>Buy stocks</h1>
    <div class="search">
      <input id="symbolInput" type="text" placeholder="Ticker symbol" ref="symbolInput">
      <button type="button" @click="search">Search</button>
    </div>
    <div class="details" v-if="symbol !== ''">
      <div class="buyWidget">
        <BuySellWidget :symbol="symbol" :mode="BuySellWidgetMode.BUY"></BuySellWidget>
      </div>
      <div class="result">
        <StockCard :symbol="symbol"></StockCard>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';
  import Store from '@/auxiliary/store';
  import StockCard from '../components/StockCard.vue';
  import BuySellWidget, {BuySellWidgetMode} from '@/components/BuySellWidget.vue'; // @ is an alias to /src

  @Component({
    components: {
      StockCard,
      BuySellWidget
    },
  })

  export default class Buy extends Vue {

    symbol = '';
    BuySellWidgetMode = BuySellWidgetMode;

    search()
    {
      this.symbol = (this.$refs.symbolInput as HTMLInputElement).value;
    }
  }

</script>

<style scoped>
  .result {
    max-width: 900px;
    background-color: #4c5454;
    /*margin: 8px;*/
    border-radius: 4px;
    margin-top: 8px;
  }

  .search {
    margin-bottom: 16px;
  }

  #symbolInput {
    margin-right: 16px;
  }

  @media only screen and (max-width: 450px)
  {
    .result {
      border-radius: 0;
    }
  }
</style>