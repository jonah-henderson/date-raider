<template>
  <div id="app">
    <header>
      <img src="img/logo.svg" height="96px"></img>
      <h1>Date Raider</h1>
    </header>
    <WelcomeModal v-if="showModal" @close="showModal = false"></WelcomeModal>
    <div id="main-layout">
      <div id="overview">
        <Overview></Overview>
      </div>
      <div id="side-layout">
        <div id="buy">
          <Buy></Buy>
        </div>
        <div id="portfolio">
          <Portfolio></Portfolio>
        </div>
      </div>
    </div>
    <footer>
      <p>Code hosted on <a href="https://github.com/jsh229/cs260-public/tree/master/proj2">github</a></p>
      <p>
        Data provided for free by <a href="https://iextrading.com/developer">IEX</a>.
        <a href="https://iextrading.com/api-exhibit-a/">View IEX’s Terms of Use</a>.
      </p>
    </footer>
  </div>
</template>

<style>

html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  background-color: #6b7070;
  color: white;
}

a {
  color: #b282b5;
}

a:hover {
  color: #85c7f2;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100%;
  display: flex;
  flex-flow: column;
}

header {
  background-color: #802392;
  text-align: center;
  border-bottom: 4px solid #641a72;
  vertical-align: center;
  font-family: 'Aldrich', sans-serif;
  font-weight: normal;
  font-size: larger;
}

header img {
  float: left;
  margin-left: 32px;
}

footer {
  text-align: center;
  background-color: #383f3f;
}

#main-layout {
  display: flex;
  flex-flow: row;
  flex: 1 1 auto;
}

#overview {
  margin: 0;
  padding: 8px;
  flex: 0 1 auto;
  background-color: #4c5454;
  max-width: 320px;
}


#side-layout {
  display: flex;
  flex-flow: column;
  background-color: #6b7070;
  width: 100%;
  padding: 8px;
}

@media only screen and (max-width: 900px)
{
  #main-layout {
    flex-flow: column;
  }

  #side-layout {
    padding: 0;
  }

  #side-layout h1 {
    text-align: center;
  }

  #overview {
    max-width: unset;
    text-align: center;
  }
}

@media only screen and (max-width: 400px)
{
  header h1 {
    display: none;
  }
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

input[type=text] {
  background-color: #4c5454;
  border: 0;
  color: white;
  padding: 8px;
  border-radius: 4px;
  box-shadow: 1px 1px 1px black;
}

button {
  cursor: pointer;
  background-color: #b282b5;
  color: white;
  border: 0;
  border-radius: .25em;
  padding: 4px;
  line-height: 1.5em;
  padding: .375rem .75rem;
}

button:hover {
  background-color: #802392;
}

</style>

<script lang="ts">
  import Vue from 'vue';
  import { Component } from 'vue-property-decorator';
  import WelcomeModal from '@/components/WelcomeModal.vue';
  import Store from '@/auxiliary/store';
  import Overview from '@/views/Overview.vue';
  import Portfolio from '@/views/Portfolio.vue';
  import Buy from '@/views/Buy.vue';

  @Component({
    components: {Portfolio, Overview, WelcomeModal, Buy }
  })
  export default class App extends Vue
  {
    showModal: boolean = localStorage.getItem("hasSeenWelcome") == null;

    created()
    {
      Store.init();
    }
  }
</script>
