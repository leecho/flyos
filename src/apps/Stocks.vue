
<script setup lang="ts">
import { ref } from 'vue';

const stocks = ref([
  { id: 'AAPL', name: 'Apple Inc.', price: '172.25', change: '+1.75', changePercent: '+1.02%', marketCap: '2.8T', volume: '88.5M' },
  { id: 'GOOGL', name: 'Alphabet Inc.', price: '135.10', change: '-0.45', changePercent: '-0.33%', marketCap: '1.7T', volume: '25.1M' },
  { id: 'MSFT', name: 'Microsoft Corp.', price: '370.95', change: '+2.10', changePercent: '+0.57%', marketCap: '2.7T', volume: '33.8M' },
  { id: 'AMZN', name: 'Amazon.com, Inc.', price: '147.42', change: '-1.12', changePercent: '-0.75%', marketCap: '1.5T', volume: '55.6M' },
  { id: 'TSLA', name: 'Tesla, Inc.', price: '245.00', change: '+5.50', changePercent: '+2.29%', marketCap: '780B', volume: '120.3M' },
]);

const selectedStock = ref(stocks.value[0]);
</script>

<template>
  <div class="stocks-app flex h-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
    <!-- Sidebar with stock list -->
    <div class="w-1/3 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      <header class="p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 class="text-lg font-bold">我的自选股</h2>
      </header>
      <div class="flex-1 overflow-y-auto">
        <div
          v-for="stock in stocks"
          :key="stock.id"
          @click="selectedStock = stock"
          class="p-4 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors duration-200"
          :class="{ 'bg-gray-200/50 dark:bg-gray-800/50': selectedStock.id === stock.id }"
        >
          <div class="flex justify-between items-center">
            <div class="font-bold text-sm">{{ stock.name }}</div>
            <div class="text-xs font-mono">{{ stock.price }}</div>
          </div>
          <div class="flex justify-between items-center text-xs mt-1">
            <div class="text-gray-500">{{ stock.id }}</div>
            <div :class="stock.change.startsWith('+') ? 'text-green-500' : 'text-red-500'">
              {{ stock.change }} ({{ stock.changePercent }})
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main content with stock details -->
    <div class="w-2/3 flex flex-col p-6">
      <div v-if="selectedStock">
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-3xl font-black">{{ selectedStock.name }}</h1>
            <p class="text-lg text-gray-500">{{ selectedStock.id }}</p>
          </div>
          <div class="text-right">
            <div class="text-3xl font-mono">{{ selectedStock.price }}</div>
            <div class="text-lg" :class="selectedStock.change.startsWith('+') ? 'text-green-500' : 'text-red-500'">
              {{ selectedStock.change }} ({{ selectedStock.changePercent }})
            </div>
          </div>
        </div>

        <div class="mt-8 h-64 bg-gray-200/50 dark:bg-gray-800/50 rounded-lg flex items-center justify-center">
          <p class="text-gray-500">图表区域</p>
        </div>

        <div class="mt-8 grid grid-cols-2 gap-6 text-sm">
          <div>
            <div class="flex justify-between py-2 border-b border-gray-200 dark:border-gray-800">
              <span class="text-gray-500">市值</span>
              <span class="font-mono">{{ selectedStock.marketCap }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-200 dark:border-gray-800">
              <span class="text-gray-500">成交量</span>
              <span class="font-mono">{{ selectedStock.volume }}</span>
            </div>
          </div>
          <div>
            <div class="flex justify-between py-2 border-b border-gray-200 dark:border-gray-800">
              <span class="text-gray-500">52周最高</span>
              <span class="font-mono">198.23</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-200 dark:border-gray-800">
              <span class="text-gray-500">52周最低</span>
              <span class="font-mono">124.17</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
