import { AccountEntry } from '@/auxiliary/types';
import Vue from 'vue';
import axios from 'axios';
import {constructApiEndpoint} from '@/auxiliary/api';

interface StoreData {
  accountHistory: AccountEntry[];
  portfolio: {
    [key: string]: {qty: number, invested: number}
  },
  currentBalance: {value: number},
  unrealisedProfit: {value: number}
}

class Store {

  private data: StoreData = {
    accountHistory: [],
    portfolio: {},
    currentBalance: {value: 0}, // wrapped in object so that we can pass the ref around
    unrealisedProfit: {value: 0}
  };

  init()
  {
    let accountHistoryStr = localStorage.getItem("accountHistory");

    if (accountHistoryStr !== null)
      this.data.accountHistory = JSON.parse(accountHistoryStr);

    if (this.data.accountHistory.length == 0)
      this.addAccountEntry(5000);

    this.data.currentBalance.value = this.data.accountHistory[this.data.accountHistory.length - 1].value;

    let portfolioStr = localStorage.getItem("portfolio");

    if (portfolioStr !== null)
      this.data.portfolio = JSON.parse(portfolioStr);
  }

  get portfolio()
  {
    return this.data.portfolio;
  }

  get accountHistory()
  {
    return this.data.accountHistory;
  }

  get currentBalance()
  {
    return this.data.currentBalance;
  }

  get unrealisedProfit()
  {
    return this.data.unrealisedProfit;
  }

  addAccountEntry(value: number)
  {
    this.data.accountHistory.push({value, time: new Date()});

    if (this.data.accountHistory.length > 100)
      this.data.accountHistory = this.data.accountHistory.splice(0, 1);

    this.data.currentBalance.value = value;
    localStorage.setItem("accountHistory", JSON.stringify(this.data.accountHistory));
  }

  purchaseStock(symbol: string, price: number, qty: number)
  {
    if (price * qty > this.data.currentBalance.value)
    {
      throw new Error("Insufficient funds");
    }
    else
    {
      this.addAccountEntry(this.data.currentBalance.value - price * qty);
      this.addStockToPortfolio(symbol, price, qty);
    }
    this.updateTotalUnrealised();

    localStorage.setItem("portfolio", JSON.stringify(this.data.portfolio));
  }

  sellStock(symbol: string, price: number, qty: number)
  {
    if (this.data.portfolio[symbol] === undefined)
      throw new Error("You do not own that stock!");

    if (this.data.portfolio[symbol].qty < qty)
      throw new Error("You do not own enough of that stock!");

    this.addAccountEntry(this.data.currentBalance.value + price * qty);
    this.removeStockFromPortfolio(symbol, price, qty);
    this.updateTotalUnrealised();

    localStorage.setItem("portfolio", JSON.stringify(this.data.portfolio));
  }

  addStockToPortfolio(symbol: string, price: number, qty: number)
  {
    symbol = symbol.toLocaleUpperCase();
    if (this.data.portfolio[symbol] === undefined || this.data.portfolio[symbol] == null)
    {
      Vue.set(this.data.portfolio, symbol, {qty: qty, invested: qty * price});
    }
    else
    {
      this.data.portfolio[symbol].qty += qty;
      this.data.portfolio[symbol].invested += qty * price;
    }
  }

  removeStockFromPortfolio(symbol: string, price: number, qty: number)
  {
    symbol = symbol.toLocaleUpperCase();
    this.data.portfolio[symbol].qty -= qty;
    this.data.portfolio[symbol].invested -= price * qty;

    if (this.data.portfolio[symbol].qty == 0)
      Vue.set(this.data.portfolio, symbol, null);
  }

  getUnrealisedForSymbol(symbol: string)
  {
    if (this.data.portfolio[symbol] != null)
    {
      const apiEndpoint = constructApiEndpoint(symbol);

      return axios.get(apiEndpoint)
        .then((json: any) => {
          return this.data.portfolio[symbol].invested - this.data.portfolio[symbol].qty * json.data;
        })
        .catch(err => {
          console.log(err)
        });
    }
    else
    {
      return Promise.resolve(0);
    }
  }

  updateTotalUnrealised()
  {
    let promises: Promise<any>[] = [];

    if (Object.keys(this.data.portfolio).length == 0)
      this.data.unrealisedProfit.value = 0;

    for (let symbol of Object.keys(this.data.portfolio))
    {
      promises.push(this.getUnrealisedForSymbol(symbol))
    }

    let self = this;

    return Promise.all(promises)
      .then( results => self.data.unrealisedProfit.value = results.reduce( (acc, next) => acc + next) );
  }
}

const store = new Store();

export default store;
