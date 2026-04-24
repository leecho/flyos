<script setup lang="ts">
import { ref, watch } from 'vue';
import { TrendingUp, TrendingDown } from 'lucide-vue-next';
import LiveTile from '../components/LiveTile.vue';
import { cryptoWatchlist } from '../stores/cryptoStore';

const cryptoData = ref<any[]>([]);

async function fetchTicker(sym: string) {
  try {
    const res = await fetch(`/api/binance/api/v3/ticker/24hr?symbol=${sym}USDT`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

watch(cryptoWatchlist, async (newList) => {
  const updatedData = newList.map(conf => {
    const sym = conf.symbol.replace('USDT', '');
    const existing = cryptoData.value.find(c => c.symbol === sym);
    if (existing) {
       return existing; 
    } else {
       return { symbol: sym, name: conf.name, price: 0, change: 0, changesPercentage: 0, loading: true };
    }
  });
  
  cryptoData.value = updatedData;
  
  for (let c of cryptoData.value) {
    if (c.loading) {
       const data = await fetchTicker(c.symbol);
       if (data) {
          c.price = parseFloat(data.lastPrice);
          c.change = parseFloat(data.priceChange);
          c.changesPercentage = parseFloat(data.priceChangePercent);
          c.loading = false;
       }
    }
  }
}, { immediate: true, deep: true });

function formatChange(change: number) {
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}`;
}

function formatPrice(price: number) {
  return price < 10 ? price.toFixed(4) : price.toFixed(2);
}
</script>

<template>
  <div class="crypto-tile-container relative w-full h-full overflow-hidden select-none text-white bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 transition-colors duration-500">
    <div class="w-full h-full p-4 flex flex-col justify-center">
      <!-- 1. 精简视图 (针对 small 尺寸)，使用 LiveTile 进行轮播 -->
      <div class="view-small h-full absolute inset-0 p-3">
        <LiveTile :items="cryptoData" v-slot="{ item }">
          <div class="w-full h-full flex flex-col items-center justify-center text-center">
            <div class="text-[10px] opacity-50 font-bold tracking-widest uppercase mb-1">{{ item.symbol }}</div>
            <div v-if="item.loading" class="text-base font-bold text-white/30 animate-pulse">--.--</div>
            <div v-else class="text-base font-bold leading-tight">{{ formatPrice(item.price) }}</div>
            <div v-if="!item.loading" :class="item.change >= 0 ? 'text-emerald-400' : 'text-red-400'" class="text-[10px] font-black drop-shadow-sm mt-0.5">
              {{ formatChange(item.change) }} ({{ item.changesPercentage.toFixed(2) }}%)
            </div>
          </div>
        </LiveTile>
      </div>

      <!-- 2. 标准视图 (针对 medium 尺寸) -->
      <div class="view-medium h-full flex-col py-1">
        <div class="flex-1 flex flex-col justify-around gap-3">
          <div v-for="coin in cryptoData.slice(0, 3)" :key="coin.symbol" class="flex justify-between items-center text-xs ">
            <span class="font-black opacity-90 tracking-wide">{{ coin.symbol }}</span>
            <span v-if="coin.loading" class="font-mono opacity-30 text-[11px]">Loading...</span>
            <span v-else class="font-mono font-bold text-right tabular-nums flex items-center justify-end">
              <span>{{ formatPrice(coin.price) }}</span>
              <span :class="coin.change >= 0 ? 'text-emerald-400' : 'text-red-400'" class="ml-2.5 w-[52px] text-right font-black drop-shadow-md">
                {{ formatChange(coin.changesPercentage) }}%
              </span>
            </span>
          </div>
        </div>
      </div>

      <!-- 3. 详细视图 (针对 large 尺寸) -->
      <div class="view-large h-full flex-col py-1">
        <div class="flex-1 flex flex-col justify-around pb-1">
          <div v-for="coin in cryptoData" :key="coin.symbol" class="flex justify-between items-center font-mono border-b border-white/5 pb-2 last:border-0 last:pb-0">
            <div class="flex items-center gap-1.5 shrink-0">
              <span class="font-sans font-black text-[13px] tracking-wide">{{ coin.symbol }}</span>
            </div>
            
            <span v-if="coin.loading" class="text-right opacity-20 flex-1 ml-4">--</span>
            <span v-else class="text-right font-bold tabular-nums flex-1 ml-4 truncate">{{ formatPrice(coin.price) }}</span>
            
            <span v-if="coin.loading" class="text-right opacity-20 w-[64px] shrink-0 flex justify-end">--</span>
            <span v-else :class="coin.change >= 0 ? 'text-emerald-400' : 'text-red-400'" class="w-[64px] shrink-0 text-right flex items-center justify-end gap-1 font-black drop-shadow-md text-xs">
              <component :is="coin.change >= 0 ? TrendingUp : TrendingDown" :size="13" class="mb-px" />
              <span>{{ coin.changesPercentage.toFixed(2) }}%</span>
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

/* 根据父组件 Tile.vue 传入的 class 来显示对应的视图 */
.tile-small .view-small,
.tile-medium .view-medium,
.tile-large .view-large {
  display: flex;
}
</style>
