<script setup lang="ts">
import { ref } from 'vue';
import { TrendingUp, TrendingDown } from 'lucide-vue-next';
import LiveTile from '../components/LiveTile.vue';

// 使用模拟数据
const stockData = ref([
  {
    symbol: '^GSPC',
    name: 'S&P 500',
    price: 5297.10,
    change: 4.86,
    changesPercentage: 0.09
  },
  {
    symbol: '^DJI',
    name: 'Dow Jones',
    price: 38798.99,
    change: -115.57,
    changesPercentage: -0.30
  },
  {
    symbol: '^IXIC',
    name: 'Nasdaq',
    price: 17133.13,
    change: 88.23,
    changesPercentage: 0.52
  },
]);

function formatChange(change: number) {
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}`;
}
</script>

<template>
  <div class="stocks-tile-container relative w-full h-full overflow-hidden select-none text-white bg-gray-800 transition-colors duration-500">
    <div class="w-full h-full p-3">
        <!-- 1. 精简视图 (针对 small 尺寸)，使用 LiveTile 进行轮播 -->
        <div class="view-small h-full">
          <LiveTile :items="stockData" v-slot="{ item }">
            <div class="w-full h-full flex flex-col items-center justify-center text-center">
              <div class="text-[10px] opacity-80">{{ item.name }}</div>
              <div class="text-base font-bold leading-tight">{{ item.price.toFixed(2) }}</div>
              <div :class="item.change > 0 ? 'text-green-400' : 'text-red-400'" class="text-[10px]">
                {{ formatChange(item.change) }} ({{ item.changesPercentage.toFixed(2) }}%)
              </div>
            </div>
          </LiveTile>
        </div>

        <!-- 2. 标准视图 (针对 medium 尺寸) -->
        <div class="view-medium h-full flex-col justify-center">
             <h3 class="font-bold text-sm absolute top-2 left-3">市场指数</h3>
            <div class="space-y-1 text-xs mt-4">
                <div v-for="stock in stockData" :key="stock.symbol" class="flex justify-between items-baseline">
                    <span class="opacity-80">{{ stock.name }}</span>
                    <span class="font-mono text-right">
                        {{ stock.price.toFixed(2) }}
                        <span :class="stock.change > 0 ? 'text-green-400' : 'text-red-400'" class="ml-2 w-14 inline-block text-left">
                            {{ formatChange(stock.change) }}
                        </span>
                    </span>
                </div>
            </div>
        </div>

        <!-- 3. 详细视图 (针对 large 尺寸) -->
        <div class="view-large h-full flex-col">
            <h3 class="font-bold text-base mb-3">市场指数</h3>
            <div class="space-y-2 text-sm">
                <div v-for="stock in stockData" :key="stock.symbol" class="grid grid-cols-3 items-center gap-2 font-mono">
                    <span class="font-sans font-semibold text-sm opacity-90">{{ stock.name }}</span>
                    <span class="text-right">{{ stock.price.toFixed(2) }}</span>
                    <span :class="stock.change > 0 ? 'text-green-400' : 'text-red-400'" class="text-right flex items-center justify-end gap-1">
                         <component :is="stock.change > 0 ? TrendingUp : TrendingDown" :size="14" />
                        <span>{{ stock.changesPercentage.toFixed(2) }}%</span>
                    </span>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
/* 默认隐藏所有视图 */
.view-small, .view-medium, .view-large {
  display: none;
}

/* 根据父组件 Tile.vue 传入的 class (.tile-small, .tile-medium, .tile-large) 来显示对应的视图 */
.tile-small .view-small,
.tile-medium .view-medium,
.tile-large .view-large {
  display: flex;
}
</style>
