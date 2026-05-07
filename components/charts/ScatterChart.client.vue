<template>
  <Scatter :data="data" :options="options" />
</template>

<script setup lang="ts">
import { Scatter } from 'vue-chartjs'
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js'
ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend)
defineProps<{ data: any; options?: any }>()
</script>
