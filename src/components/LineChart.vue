<template>
  <div class="lineChart">
    <canvas ref="chart"></canvas>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Chart from 'chart.js';

  Chart.defaults.global.defaultFontColor = "white";

  import { Component, Prop, Watch } from 'vue-property-decorator';

  export interface LineChartDataEntry {
    time: Date,
    value: number
  }

  @Component
  export default class LineChart extends Vue {
    @Prop({default: []})
    lineChartData!: LineChartDataEntry[];

    @Prop({default: "Data"})
    label!: string;

    @Prop({default: "#eb6534"})
    colour!: string;

    chart: Chart | null = null;

    mounted() {

      let ctx = (this.$refs.chart as HTMLCanvasElement).getContext("2d");

      if (ctx !== null)
      {
        this.chart = new Chart( ctx, {
          type: 'line',
          data: {
            datasets: [{
              label: this.label,
              data: this.lineChartData.map(entry => ({y: entry.value, t: entry.time})),
              borderColor: this.colour,
              fill: false,
              lineTension: 0,
              pointBackgroundColor: this.colour
            }]
          },
          options: {
            scales: {
              xAxes: [{
                type: 'time'
              }]
            }
          }
        });
      }

    }

    @Watch('lineChartData')
    onDataChanged(value: LineChartDataEntry[]) {

      if (this.chart && this.chart.data && this.chart.data.datasets && this.chart.data.datasets[0])
      {
        this.chart.data.datasets[0].data = value.map(entry => ({
          y: entry.value,
          t: entry.time
        }));

        this.chart.update();
      }

    }

    @Watch('label')
    onLabelChanged(value: string) {
      if (this.chart && this.chart.data.datasets)
        this.chart.data.datasets[0].label = value;
    }
  };
</script>

<style scoped>

  .lineChart {
     /*width: 100%;*/
    /*height: 100%;*/
  }
</style>