<template>
  <div class="mask">
    <div class="wrapper">
      <div id="welcome">
        <img src="img/logo.svg" height="300px">
        <hr/>
        <h1>Welcome to Date Raider!</h1>
        <p>Starting with $5,000 can you make a fortune on the market? Make careful purchases and sell at the right time
        and soon you too will be a wolf on Wall Street.</p>
        <a href="#" @click="markSeen">Let's get started!</a>
      </div>
    </div>
  </div>
</template>

<script>
  import Store from '@/auxiliary/store';
  import {Component, Vue} from "vue-property-decorator";

  @Component
  export default class WelcomeModal extends Vue
  {
    markSeen()
    {
      localStorage.setItem("hasSeenWelcome", "true");
      Store.addAccountEntry(5000);
      this.$emit("close");
    }
  }
</script>

<style scoped>
  .mask
  {
    position: fixed;
    z-index: 9998;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, .5);
    display: flex;
    flex-flow: column;
    align-items: center;
    justify-content: center;
    transition: opacity .3s ease;
  }

  .wrapper
  {
    width: 80%;
    height: 80%;
    display: flex;
    flex-flow: column;
    align-items: center;
    justify-content: center;
    padding: 32px;
    background-color: #4c5454;
  }

  #welcome img
  {
    margin: auto;
    align-self: center;
  }


  #welcome
  {
    display: flex;
    flex-flow: column;
    /*margin: 0px auto;*/
    /*width: 80%;*/
  }

  hr {
    margin-top: 32px;
    width: 100%;
    border: 1px solid white;
  }
</style>
