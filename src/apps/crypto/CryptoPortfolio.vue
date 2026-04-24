<script setup lang="ts">
import { ref, onMounted, computed, watch, onUnmounted } from 'vue';
import { Plus, X, Trash2, TrendingUp, TrendingDown, DollarSign } from 'lucide-vue-next';

interface PortfolioAsset {
  id: string;
  symbol: string;
  amount: number;
  avgPrice: number;
}

const assets = ref<PortfolioAsset[]>([]);
const livePrices = ref<Record<string, number>>({});
let ws: WebSocket | null = null;
let reconnectTimer: any = null;

const showAdd = ref(false);
const form = ref({ symbol: 'BTCUSDT', amount: 0, avgPrice: 0 });

onMounted(() => {
  const saved = localStorage.getItem('flyos_crypto_portfolio');
  if (saved) { try { assets.value = JSON.parse(saved); } catch (e) {} }
  connectWS();
});

watch(assets, (val) => {
  localStorage.setItem('flyos_crypto_portfolio', JSON.stringify(val));
  updateWS();
}, { deep: true });

function connectWS() {
  if (ws) ws.close();
  ws = new WebSocket('wss://stream.binance.com:9443/ws');
  ws.onopen = () => { updateWS(); };
  ws.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);
      if (data.e === '24hrTicker') {
        livePrices.value[data.s] = parseFloat(data.c);
      }
    } catch {}
  };
  ws.onclose = () => { reconnectTimer = setTimeout(connectWS, 3000); };
}

function updateWS() {
  if (!ws || ws.readyState !== WebSocket.OPEN || assets.value.length === 0) return;
  const symbols = [...new Set(assets.value.map(a => a.symbol.toLowerCase() + '@ticker'))];
  ws.send(JSON.stringify({ method: "SUBSCRIBE", params: symbols, id: 1 }));
}

onUnmounted(() => {
  clearTimeout(reconnectTimer);
  if (ws) ws.close();
});

function addAsset() {
  const sym = form.value.symbol.toUpperCase();
  assets.value.push({ id: Math.random().toString(), symbol: sym.endsWith('USDT') ? sym : sym+'USDT', amount: form.value.amount, avgPrice: form.value.avgPrice });
  showAdd.value = false;
  form.value = { symbol: 'BTCUSDT', amount: 0, avgPrice: 0 };
}

function removeAsset(id: string) {
  assets.value = assets.value.filter(a => a.id !== id);
}

const summary = computed(() => {
  let cost = 0; let current = 0;
  assets.value.forEach(a => {
    cost += a.amount * a.avgPrice;
    current += a.amount * (livePrices.value[a.symbol] || a.avgPrice); // fallback to avg if not loaded
  });
  return { cost, current, pnl: current - cost, pnlPercent: cost === 0 ? 0 : ((current - cost) / cost) * 100 };
});

function fmtMoney(v: number) {
  return v.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}
</script>

<template>
  <div class="w-full h-full p-6 flex flex-col bg-[var(--fly-bg-primary)] overflow-y-auto no-scrollbar">
    
    <!-- Header -->
    <div class="flex justify-between items-start mb-8">
       <div>
         <h2 class="text-xl font-black tracking-tight flex items-center gap-2 mb-1">资产管理 <span class="bg-accent/20 text-accent text-[10px] px-2 py-0.5 rounded-full">Portfolio</span></h2>
         <p class="text-xs opacity-50 uppercase tracking-widest font-bold">Real-time PnL Tracking</p>
       </div>
       <button @click="showAdd = !showAdd" class="bg-accent text-white px-4 py-2 rounded-[var(--fly-radius-md)] flex items-center gap-2 text-xs font-black uppercase tracking-widest shadow-lg shadow-accent/30 active:scale-95 transition-all">
         <Plus :size="14" /> {{ showAdd ? '取消录入' : '录入持仓' }}
       </button>
    </div>

    <!-- PNL Board -->
    <div class="bg-[var(--fly-bg-glass)] border border-[var(--fly-border-glass)] backdrop-blur p-6 rounded-[var(--fly-radius-lg)] mb-6 shadow-xl relative overflow-hidden">
       <!-- Decoration -->
       <div class="absolute -right-10 -top-10 opacity-5 pointer-events-none">
          <DollarSign :size="200" />
       </div>

       <p class="text-xs uppercase font-black opacity-40 tracking-widest mb-2">当前等值总资产</p>
       <h1 class="text-5xl font-black font-mono tracking-tighter mb-4">{{ fmtMoney(summary.current) }}</h1>
       
       <div class="grid grid-cols-2 md:grid-cols-3 gap-6 border-t border-[var(--fly-border-system)]/30 pt-4">
         <div>
            <p class="text-[10px] uppercase font-black opacity-40 tracking-widest mb-1">总投入成本 (Cost)</p>
            <span class="font-mono font-bold">{{ fmtMoney(summary.cost) }}</span>
         </div>
         <div>
            <p class="text-[10px] uppercase font-black opacity-40 tracking-widest mb-1">未实现盈亏 (U/PnL)</p>
            <span class="font-mono font-black" :class="summary.pnl >= 0 ? 'text-emerald-500' : 'text-red-500'">
              {{ summary.pnl >= 0 ? '+' : '' }}{{ fmtMoney(summary.pnl) }}
            </span>
         </div>
         <div>
            <p class="text-[10px] uppercase font-black opacity-40 tracking-widest mb-1">总收益率 (ROI)</p>
            <span class="font-mono font-black text-lg px-2 py-0.5 rounded" :class="summary.pnlPercent >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'">
              {{ summary.pnlPercent >= 0 ? '+' : '' }}{{ summary.pnlPercent.toFixed(2) }}%
            </span>
         </div>
       </div>
    </div>

    <!-- Add Form -->
    <div v-if="showAdd" class="bg-black/5 dark:bg-white/5 border border-[var(--fly-border-system)] p-4 rounded-[var(--fly-radius-md)] mb-6 flex items-end gap-4 overflow-hidden flex-wrap">
       <div class="flex-1 min-w-[120px]">
         <label class="block text-[10px] font-black opacity-40 tracking-widest uppercase mb-1">交易对</label>
         <input v-model="form.symbol" placeholder="BTCUSDT" class="w-full bg-[var(--fly-bg-primary)] border border-transparent rounded px-3 py-2 text-xs font-mono outline-none focus:border-accent uppercase" />
       </div>
       <div class="flex-1 min-w-[120px]">
         <label class="block text-[10px] font-black opacity-40 tracking-widest uppercase mb-1">数量</label>
         <input v-model.number="form.amount" type="number" step="0.01" class="w-full bg-[var(--fly-bg-primary)] border border-transparent rounded px-3 py-2 text-xs font-mono outline-none focus:border-accent" />
       </div>
       <div class="flex-1 min-w-[120px]">
         <label class="block text-[10px] font-black opacity-40 tracking-widest uppercase mb-1">买入均价 (USDT)</label>
         <input v-model.number="form.avgPrice" type="number" step="0.01" class="w-full bg-[var(--fly-bg-primary)] border border-transparent rounded px-3 py-2 text-xs font-mono outline-none focus:border-accent" />
       </div>
       <button @click="addAsset" class="bg-accent text-white px-6 py-2 h-[34px] rounded font-black text-xs uppercase tracking-widest shrink-0 active:scale-95">提交</button>
    </div>

    <!-- Positions -->
    <h3 class="text-xs font-black uppercase tracking-widest opacity-40 mb-3 border-b border-[var(--fly-border-system)]/30 pb-2">持仓清单</h3>
    <div class="space-y-2">
       <div v-for="a in assets" :key="a.id" class="flex flex-wrap md:flex-nowrap items-center justify-between p-4 bg-[var(--fly-bg-secondary)] rounded-[var(--fly-radius-md)] border border-[var(--fly-border-system)] group hover:border-accent/30 transition-all">
          <div class="flex items-center gap-4 w-full md:w-auto mb-2 md:mb-0">
             <div class="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-black shadow-md cursor-default shrink-0">
               {{ a.symbol.substring(0,1) }}
             </div>
             <div>
               <h4 class="font-black text-sm uppercase tracking-tight">{{ a.symbol.replace('USDT','') }}</h4>
               <p class="text-[10px] font-mono font-bold opacity-40 mt-0.5">{{ a.amount }} {{ a.symbol.replace('USDT','') }}</p>
             </div>
          </div>

          <div class="flex-1 flex justify-between items-center px-0 md:px-8 max-w-lg">
             <div class="text-left">
               <p class="text-[10px] opacity-40 uppercase tracking-widest font-black mb-1">均价 / 现价</p>
               <div class="text-xs font-mono font-bold flex items-center gap-2">
                 <span>${{ a.avgPrice }}</span>
                 <span class="opacity-30">➔</span>
                 <span :class="(livePrices[a.symbol] || a.avgPrice) >= a.avgPrice ? 'text-emerald-500' : 'text-red-500'">${{ livePrices[a.symbol] || a.avgPrice }}</span>
               </div>
             </div>
             
             <div class="text-right">
               <p class="text-[10px] opacity-40 uppercase tracking-widest font-black mb-1">盈亏</p>
               <div class="text-sm font-mono font-black" :class="(livePrices[a.symbol] || a.avgPrice) >= a.avgPrice ? 'text-emerald-500' : 'text-red-500'">
                  {{ (livePrices[a.symbol] || a.avgPrice) >= a.avgPrice ? '+' : '' }}{{ fmtMoney(((livePrices[a.symbol] || a.avgPrice) - a.avgPrice) * a.amount) }}
               </div>
             </div>
          </div>

          <div class="shrink-0 w-full md:w-auto text-right md:text-center mt-2 md:mt-0">
             <button @click="removeAsset(a.id)" class="p-2 text-red-500 opacity-50 hover:opacity-100 hover:bg-red-500/10 rounded-full transition-all">
               <Trash2 :size="16" />
             </button>
          </div>
       </div>
       <div v-if="assets.length === 0" class="text-center p-10 opacity-30 text-xs font-black uppercase tracking-widest">
         暂时没有在监控的资产
       </div>
    </div>
  </div>
</template>
