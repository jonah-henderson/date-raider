<template>
  <div class="buySellWidget">
    <div class="controls" v-if="!badSymbol">
      <label>
        {{mode === BuySellWidgetMode.BUY ? "Buy" : "Sell"}}
        <input type="number" min="1" v-model.number="qty">
        {{ symbol.toLocaleUpperCase() }} stocks at <strong>${{ price }}</strong>
      </label>
      <button id="executeBtn" type="button" @click="executeTransaction">Go!</button>
      <p class="error" v-if="error">{{ error }}</p>
    </div>
    <p class="error" v-if="badSymbol">Error loading symbol</p>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';
  import { Prop, Watch } from 'vue-property-decorator';
  import Store from '@/auxiliary/store';
  import axios from 'axios';
  import {constructApiEndpoint} from '@/auxiliary/api';

  export enum BuySellWidgetMode { BUY, SELL }

  @Component
  export default class BuySellWidget extends Vue {

    @Prop({default: 'TSLA'})
    symbol!: string;

    @Prop({default: BuySellWidgetMode.BUY})
    mode!: BuySellWidgetMode;

    qty = 1;
    price = 0;
    error: string | null = null;
    badSymbol = false;

    BuySellWidgetMode = BuySellWidgetMode;

    intervalHandle: any;

    created () {
      this.fetchData();
      this.intervalHandle = setInterval(this.fetchData.bind(this), 60000);
    }

    fetchData () {
      const apiEndpoint = constructApiEndpoint(this.symbol);

      axios.get(apiEndpoint)
        .then((json: any) => {
          this.badSymbol = false;
          this.price = json.data;
        })
        .catch(err => {this.badSymbol = true; console.log(err)});
    }

    executeTransaction() {
      try
      {
        switch (this.mode) {
          case BuySellWidgetMode.BUY:
            Store.purchaseStock(this.symbol, this.price, this.qty);
            break;

          case BuySellWidgetMode.SELL:
            Store.sellStock(this.symbol, this.price, this.qty);
            break;
        }
      }
      catch (err)
      {
        this.error = err.message;
      }
      this.$forceUpdate();
    }

    @Watch('symbol')
    onSymbolChanged() {
      this.fetchData();
    }

    destroyed()
    {
      clearInterval(this.intervalHandle);
    }
  }
</script>

<style scoped>

  input[type="number"] {
    max-width: 56px;
  }

  label {
    margin-right: 16px;
  }

  @media only screen and (max-width: 400px)
  {
    label {
      margin: 0;
    }

    #executeBtn {
      display: block;
      width: 80%;
      margin: 8px auto;
    }
  }
</style>
