<script setup lang="ts">
import { ref, onMounted,computed, onUnmounted, watch } from 'vue';
import { cryptoWatchlist } from '@/stores/cryptoStore';
import CryptoChart, { type KlineData } from './CryptoChart.vue';
import { Settings2 } from 'lucide-vue-next';

// Define the MiniGridCell directly in here or as a local setup
const GridCell = {
  props: ['symbol'],
  setup(props: { symbol: string }) {
    const data = ref<{ p: number; o: number; h: number; l: number; c: number; chg: number } | null>(null);
    const klines = ref<KlineData[]>([]);
    
    let ws: WebSocket | null = null;
    let reconnectTimer: any = null;

    async function loadData() {
      // Fetch 24h ticker
      const resTicker = await fetch(`/api/binance/api/v3/ticker/24hr?symbol=${props.symbol}`);
      const jst = await resTicker.json();
      data.value = {
        p: parseFloat(jst.lastPrice), o: parseFloat(jst.openPrice), 
        h: parseFloat(jst.highPrice), l: parseFloat(jst.lowPrice), 
        c: parseFloat(jst.priceChangePercent), chg: parseFloat(jst.priceChange)
      };

      // Fetch klines
      const resKlines = await fetch(`/api/binance/api/v3/klines?symbol=${props.symbol}&interval=1h&limit=24`);
      const jsk = await resKlines.json();
      klines.value = jsk.map((k:any) => ({ t: k[0]/1000, o: parseFloat(k[1]), h: parseFloat(k[2]), l: parseFloat(k[3]), c: parseFloat(k[4]), v: parseFloat(k[5]) }));
    }

    function initWs() {
      if(ws) ws.close();
      ws = new WebSocket('wss://stream.binance.com:9443/ws');
      ws.onopen = () => {
         ws!.send(JSON.stringify({ method: 'SUBSCRIBE', params: [`${props.symbol.toLowerCase()}@ticker`], id: 1 }));
      };
      ws.onmessage = (e) => {
         const msg = JSON.parse(e.data);
         if (msg.e === '24hrTicker') {
           const pLine = klines.value[klines.value.length - 1];
           const price = parseFloat(msg.c);
           if (data.value) { data.value.p = price; data.value.c = parseFloat(msg.P); }
           if (pLine) { pLine.c = price; pLine.h = Math.max(pLine.h, price); pLine.l = Math.min(pLine.l, price); }
         }
      };
      ws.onclose = () => { reconnectTimer = setTimeout(initWs, 3000); };
    }

    watch(() => props.symbol, () => {
      loadData().then(initWs);
    }, { immediate: true });

    onUnmounted(() => {
      clearTimeout(reconnectTimer);
      if (ws) ws.close();
    });

    return { data, klines };
  },
  template: `
    <div class="flex flex-col bg-[var(--fly-bg-secondary)] rounded-[var(--fly-radius-md)] border border-[var(--fly-border-system)] overflow-hidden relative group">
      <div v-if="!data" class="flex-1 flex justify-center items-center opacity-30 text-xs font-black uppercase">Loading...</div>
      <template v-else>
        <!-- Mini Header -->
        <div class="px-4 py-2 flex justify-between items-center border-b border-[var(--fly-border-system)]/30 backdrop-blur shrink-0 absolute top-0 left-0 right-0 z-20">
          <span class="font-black tracking-tight text-sm uppercase drop-shadow-md">{{ symbol.replace('USDT', '') }}</span>
          <div class="text-right drop-shadow-md font-mono">
             <span class="font-bold text-xs" :class="data.c >= 0 ? 'text-emerald-500' : 'text-red-500'">{{ data.p.toFixed(4).replace(/\\.?0+$/, '') }}</span>
             <span class="text-[10px] ml-2" :class="data.c >= 0 ? 'text-emerald-400' : 'text-red-400'">{{ data.c >= 0 ? '+' : '' }}{{ data.c.toFixed(2) }}%</span>
          </div>
        </div>
        <!-- Chart -->
        <div class="flex-1">
          <CryptoChart :klines="klines" :loading="klines.length===0" type="candle" class="h-full border-none rounded-none w-full !bg-black/5" />
        </div>
      </template>
    </div>
  `,
  components: { CryptoChart }
};

const layout = ref<'1x2' | '2x2'>('2x2');
const symbols = computed(() => {
  const watch = cryptoWatchlist.value.map(s => s.symbol);
  // Default to these if nothing in watchlist
  const fallback = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'DOGEUSDT'];
  const res = [];
  const needed = layout.value === '1x2' ? 2 : 4;
  for (let i = 0; i < needed; i++) {
    res.push(watch[i] || fallback[i % fallback.length]);
  }
  return res;
});
</script>

<template>
  <div class="w-full h-full bg-[var(--fly-bg-primary)] flex flex-col p-2">
    <div class="flex justify-between items-center px-4 py-2 shrink-0 border-b border-[var(--fly-border-system)]/50 mb-2">
      <h2 class="text-xs font-black tracking-widest uppercase opacity-50 flex items-center gap-2">
         分屏监控阵列 
      </h2>
      <div class="flex gap-2">
         <button @click="layout = '1x2'" class="text-[10px] font-black uppercase px-2 py-1 rounded transition-all" :class="layout === '1x2' ? 'bg-accent text-white' : 'hover:bg-black/10 dark:hover:bg-white/10 opacity-50'">1x2 行列</button>
         <button @click="layout = '2x2'" class="text-[10px] font-black uppercase px-2 py-1 rounded transition-all" :class="layout === '2x2' ? 'bg-accent text-white' : 'hover:bg-black/10 dark:hover:bg-white/10 opacity-50'">2x2 田字</button>
      </div>
    </div>

    <!-- Dynamic Grid -->
    <div class="flex-1 grid gap-2" :class="layout === '1x2' ? 'grid-rows-2' : 'grid-cols-2 grid-rows-2'">
       <!-- Use a static wrapper to preserve instances when array length changes -->
       <GridCell v-for="(sym, i) in symbols" :key="sym+i" :symbol="sym" />
    </div>
  </div>
</template>
