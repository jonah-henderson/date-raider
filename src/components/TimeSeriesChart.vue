<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-luxon';
import annotationPlugin, { type AnnotationOptions } from 'chartjs-plugin-annotation';

export interface TimeSeriesData {
  time: Date;
  value: number;
}

const props = defineProps<{
  data: TimeSeriesData[];
  chartLabel: string;
  suggestedMin?: number;
  suggestedMax?: number;
  yLine?: number;
}>();

let chart: Chart<'line', TimeSeriesData[], unknown> | null = null;

Chart.defaults.backgroundColor = '#802392';
Chart.defaults.borderColor = '#802392';

Chart.register(annotationPlugin);

const chartElement = ref<HTMLCanvasElement | null>(null);

const annotations: AnnotationOptions[] = [];

if (props.yLine !== undefined) {
  annotations.push({
    type: 'line',
    yMin: props.yLine,
    yMax: props.yLine,
    borderWidth: 2,
  });
}

watch(
  () => props.data,
  (newData) => {
    if (!chart) {
      return;
    }
    chart.data.datasets[0].data = [...newData];
    chart.update();
  },
  { deep: true },
);

onMounted(() => {
  chart = new Chart(chartElement.value!, {
    type: 'line',
    data: {
      datasets: [
        {
          data: [...props.data],
          label: props.chartLabel,
        },
      ],
    },
    options: {
      parsing: {
        xAxisKey: 'time',
        yAxisKey: 'value',
      },
      plugins: {
        colors: {
          enabled: false,
        },
        annotation: {
          annotations,
        },
      },
      scales: {
        y: {
          type: 'linear',
          suggestedMin: props.suggestedMin,
          suggestedMax: props.suggestedMax,
          grid: {
            color: 'rgba(255, 255, 255, 0.09)',
          },
        },
        x: {
          type: 'time',
          grid: {
            color: 'rgba(255, 255, 255, 0.09)',
          },
        },
      },
    },
  });
});
</script>

<template>
  <div class="chart-container">
    <canvas ref="chartElement"></canvas>
  </div>
</template>

<style scoped>
.chart-container {
  position: relative;
}
</style>
