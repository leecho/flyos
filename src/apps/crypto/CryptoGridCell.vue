<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';
import CryptoChart, { KlineData } from './CryptoChart.vue';

const props = defineProps<{ symbol: string }>();

const data = ref<{ p: number; o: number; h: number; l: number; c: number; chg: number } | null>(null);
const klines = ref<KlineData[]>([]);

let ws: WebSocket | null = null;
let reconnectTimer: any = null;

async function loadData() {
  const resTicker = await fetch(`/api/binance/api/v3/ticker/24hr?symbol=${props.symbol}`);
  const jst = await resTicker.json();
  data.value = {
    p: parseFloat(jst.lastPrice), o: parseFloat(jst.openPrice), 
    h: parseFloat(jst.highPrice), l: parseFloat(jst.lowPrice), 
    c: parseFloat(jst.priceChangePercent), chg: parseFloat(jst.priceChange)
  };

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
</script>

<template>
  <div class="flex flex-col bg-[var(--fly-bg-secondary)] rounded-[var(--fly-radius-md)] border border-[var(--fly-border-system)] overflow-hidden relative group">
    <div v-if="!data" class="flex-1 flex justify-center items-center opacity-30 text-xs font-black uppercase">Loading...</div>
    <template v-else>
      <!-- Mini Header -->
      <div class="px-4 py-2 flex justify-between items-center border-b border-[var(--fly-border-system)]/30 backdrop-blur shrink-0 absolute top-0 left-0 right-0 z-20">
        <span class="font-black tracking-tight text-sm uppercase drop-shadow-md">{{ symbol.replace('USDT', '') }}</span>
        <div class="text-right drop-shadow-md font-mono">
           <span class="font-bold text-xs" :class="data.c >= 0 ? 'text-emerald-500' : 'text-red-500'">{{ data.p.toFixed(4).replace(/\.?0+$/, '') }}</span>
           <span class="text-[10px] ml-2" :class="data.c >= 0 ? 'text-emerald-400' : 'text-red-400'">{{ data.c >= 0 ? '+' : '' }}{{ data.c.toFixed(2) }}%</span>
        </div>
      </div>
      <!-- Chart -->
      <div class="flex-1 mt-6">
        <CryptoChart :klines="klines" :loading="klines.length===0" type="candle" class="h-full border-none rounded-none w-full !bg-black/5" />
      </div>
    </template>
  </div>
</template>
