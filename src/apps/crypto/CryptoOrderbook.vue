<script setup lang="ts">
import { ref, watch, onUnmounted, computed } from 'vue';

const props = defineProps<{ symbol: string }>();

interface DepthPoint { p: string; q: string; }
const bids = ref<DepthPoint[]>([]);
const asks = ref<DepthPoint[]>([]);
const trades = ref<{ p: string; q: string; m: boolean; t: number }[]>([]); // m = isBuyerMaker (true = sell trade)

let ws: WebSocket | null = null;
const reconnectTimer = ref<any>(null);

function connectCombined() {
  if (ws) ws.close();
  if (!props.symbol) return;
  
  bids.value = []; asks.value = []; trades.value = [];
  
  const sym = props.symbol.toLowerCase();
  ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${sym}@depth20@100ms/${sym}@trade`);
  
  ws.onmessage = (e) => {
    try {
      const payload = JSON.parse(e.data);
      if (payload.stream.endsWith('@depth20@100ms')) {
        bids.value = payload.data.bids;
        asks.value = [...payload.data.asks].reverse();
      } else if (payload.stream.endsWith('@trade')) {
        trades.value.unshift({ p: payload.data.p, q: payload.data.q, m: payload.data.m, t: payload.data.T });
        if (trades.value.length > 30) trades.value.pop();
      }
    } catch {}
  };
  
  ws.onclose = () => { reconnectTimer.value = setTimeout(connectCombined, 3000); };
}

watch(() => props.symbol, () => {
  clearTimeout(reconnectTimer.value);
  connectCombined();
}, { immediate: true });

onUnmounted(() => {
  clearTimeout(reconnectTimer.value);
  if (ws) ws.close();
});

function formatTime(ts: number) {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}`;
}

function getMaxDepth(arr: any[]) {
  if (!arr || arr.length === 0) return 1;
  return Math.max(...arr.map(x => parseFloat(x[1])));
}

// Depth Mountain Math
const depthMountain = computed(() => {
  if (!bids.value.length || !asks.value.length) return null;
  
  const SVG_W = 600;
  const SVG_H = 120;
  const HALF_W = SVG_W / 2;
  
  // Calculate cumulatives
  let cumB = 0; const bVals = bids.value.map(b => { cumB += parseFloat(b[1]); return { p: parseFloat(b[0]), c: cumB }; });
  // Since we reversed asks earlier for list display (best ask is at end), we must un-reverse to accumulate from best
  let cumA = 0; const aVals = [...asks.value].reverse().map(a => { cumA += parseFloat(a[1]); return { p: parseFloat(a[0]), c: cumA }; });
  
  const maxCum = Math.max(cumB, cumA) || 1;
  
  // BIDS: right to left (best bid to lowest bid)
  const bestBidP = bVals[0].p; const lowBidP = bVals[bVals.length-1].p; const rangeB = bestBidP - lowBidP || 1;
  let bidsPts = [`M0,${SVG_H}`];
  [...bVals].reverse().forEach(b => {
     const x = ((b.p - lowBidP) / rangeB) * HALF_W;
     const y = SVG_H - (b.c / maxCum) * SVG_H;
     bidsPts.push(`L${x.toFixed(1)},${y.toFixed(1)}`);
  });
  bidsPts.push(`L${HALF_W},${SVG_H}`);

  // ASKS: left to right (best ask to highest ask)
  const bestAskP = aVals[0].p; const highAskP = aVals[aVals.length-1].p; const rangeA = highAskP - bestAskP || 1;
  let asksPts = [`M${HALF_W},${SVG_H}`];
  aVals.forEach(a => {
     const x = HALF_W + ((a.p - bestAskP) / rangeA) * HALF_W;
     const y = SVG_H - (a.c / maxCum) * SVG_H;
     asksPts.push(`L${x.toFixed(1)},${y.toFixed(1)}`);
  });
  asksPts.push(`L${SVG_W},${SVG_H}`);
  
  return { bidsPath: bidsPts.join(''), asksPath: asksPts.join('') };
});

</script>

<template>
  <div class="h-full flex flex-col font-mono text-[11px] bg-[var(--fly-bg-secondary)] border-l border-[var(--fly-border-system)] w-64 lg:w-72 shrink-0 select-none">
    
    <!-- Orderbook Header & Mountain -->
    <div class="flex flex-col border-b border-[var(--fly-border-system)] bg-[var(--fly-bg-primary)]">
       <div class="px-3 py-2 font-sans font-black opacity-40 uppercase tracking-widest text-[10px] flex justify-between">
         <span>市场深度</span>
         <div :class="['w-1.5 h-1.5 rounded-full mt-1', bids.length===0 ? 'bg-yellow-500 animate-pulse' : 'bg-emerald-500']"></div>
       </div>
       
       <div v-if="depthMountain" class="w-full h-20 bg-[var(--fly-bg-secondary)] relative shrink-0 overflow-hidden group border-t border-[var(--fly-border-system)]/30">
          <svg preserveAspectRatio="none" class="w-full h-full block" viewBox="0 0 600 120">
             <defs>
                <linearGradient id="g-bid" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#10b981" stop-opacity="0.5"/><stop offset="100%" stop-color="#10b981" stop-opacity="0.0"/></linearGradient>
                <linearGradient id="g-ask" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ef4444" stop-opacity="0.5"/><stop offset="100%" stop-color="#ef4444" stop-opacity="0.0"/></linearGradient>
             </defs>
             <path :d="depthMountain.bidsPath" fill="url(#g-bid)" stroke="#10b981" stroke-width="1.5" />
             <path :d="depthMountain.bidsPath" stroke="#10b981" stroke-width="1.5" fill="none" opacity="0.3" stroke-dasharray="4 4" />
             <path :d="depthMountain.asksPath" fill="url(#g-ask)" stroke="#ef4444" stroke-width="1.5" />
             <path :d="depthMountain.asksPath" stroke="#ef4444" stroke-width="1.5" fill="none" opacity="0.3" stroke-dasharray="4 4" />
          </svg>
       </div>
    </div>

    <!-- Orderbook Lists -->
    <div class="flex-1 flex flex-col min-h-0 bg-[var(--fly-bg-secondary)]">
      <div class="px-3 py-1 font-sans font-black opacity-30 uppercase tracking-widest text-[9px] flex justify-between border-b border-[var(--fly-border-system)]/30">
        <span>价格(USDT)</span>
        <span>总量</span>
      </div>
      
      <div class="flex-1 overflow-y-auto no-scrollbar py-1">
        <!-- Asks (Red) - Top half -->
        <div class="flex flex-col justify-end min-h-[50%]">
          <div v-for="(ask, i) in asks" :key="'ask'+i" class="relative group flex justify-between px-3 py-[2px] hover:bg-black/5 dark:hover:bg-white/5 cursor-crosshair">
            <div class="absolute top-0 right-0 bottom-0 bg-red-500/10 pointer-events-none transition-all" :style="{ width: `${(parseFloat(ask[1]) / getMaxDepth(asks)) * 100}%` }"></div>
            <span class="text-red-500 font-bold z-10">{{ parseFloat(ask[0]).toFixed(2) }}</span>
            <span class="opacity-70 z-10 tabular-nums">{{ parseFloat(ask[1]).toFixed(4) }}</span>
          </div>
        </div>
        
        <!-- Spread separator -->
        <div class="px-3 py-1 text-center text-[10px] opacity-20 font-black tracking-widest my-1 border-y border-[var(--fly-border-system)]/30">
          SPREAD
        </div>
        
        <!-- Bids (Green) - Bottom half -->
        <div>
          <div v-for="(bid, i) in bids" :key="'bid'+i" class="relative group flex justify-between px-3 py-[2px] hover:bg-black/5 dark:hover:bg-white/5 cursor-crosshair">
            <div class="absolute top-0 right-0 bottom-0 bg-emerald-500/10 pointer-events-none transition-all" :style="{ width: `${(parseFloat(bid[1]) / getMaxDepth(bids)) * 100}%` }"></div>
            <span class="text-emerald-500 font-bold z-10">{{ parseFloat(bid[0]).toFixed(2) }}</span>
            <span class="opacity-70 z-10 tabular-nums">{{ parseFloat(bid[1]).toFixed(4) }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Realtime Trades Tape -->
    <div class="h-64 flex flex-col border-t border-[var(--fly-border-system)] bg-[var(--fly-bg-primary)]">
      <div class="px-3 py-2 font-sans font-black opacity-40 uppercase tracking-widest text-[10px] border-b border-[var(--fly-border-system)]/30">实时吃单瀑布</div>
      <div class="flex-1 overflow-y-auto no-scrollbar p-1">
        <div v-for="t in trades" :key="t.t + t.p + Math.random()" class="flex justify-between px-2 py-1 text-[10px] tabular-nums hover:bg-black/5 dark:hover:bg-white/5">
          <span class="opacity-40 w-12">{{ formatTime(t.t) }}</span>
          <span :class="t.m ? 'text-red-500' : 'text-emerald-500'" class="font-bold flex-1 text-center">{{ parseFloat(t.p).toFixed(2) }}</span>
          <span class="opacity-70 text-right">{{ parseFloat(t.q).toFixed(4) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
</style>
