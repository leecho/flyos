<script setup lang="ts">
import { ref, computed, reactive, onMounted, onUnmounted, watch } from 'vue'
import { cryptoWatchlist, moveCryptoConf, cryptoAlerts, addAlert, removeAlert } from '@/stores/cryptoStore'
import { Plus, X, BarChart2, Activity, RefreshCcw, Wifi, WifiOff, ChevronUp, ChevronDown, Bell, BellRing, Settings2, BarChart, Presentation, Trash2, LineChart, LayoutGrid, MapPin, Map as MapIcon, Wallet } from 'lucide-vue-next'

import CryptoChart, { KlineData } from './crypto/CryptoChart.vue'
import CryptoOrderbook from './crypto/CryptoOrderbook.vue'
import FearGreedIndex from './crypto/FearGreedIndex.vue'
import CryptoHeatmap from './crypto/CryptoHeatmap.vue'
import CryptoGrid from './crypto/CryptoGrid.vue'
import CryptoPortfolio from './crypto/CryptoPortfolio.vue'

interface CryptoData {
  symbol: string; displayName: string; price: number; previousClose: number;
  open: number; dayHigh: number; dayLow: number; volume: number; quoteVolume: number;
  change: number; changePercent: number; klines: KlineData[];
  loading: boolean; error: boolean; wsBlinking?: 'up' | 'down' | null;
}

const RANGES = [
  { label: '24H', value: '1d',  interval: '1h', limit: 24 },
  { label: '7D',   value: '7d',  interval: '4h', limit: 42 },
  { label: '1M',   value: '1M',  interval: '1d', limit: 30 },
  { label: '3M',   value: '3M',  interval: '1d', limit: 90 },
  { label: '1Y',   value: '1y',  interval: '1w', limit: 52 },
]

// ─── Root App Modes ─────────────────────────────────────
const appMode = ref<'terminal' | 'grid' | 'heatmap' | 'portfolio'>('terminal')

// ─── Shared References ──────────────────────────────────
const containerRef   = ref<HTMLElement | null>(null)
const containerWidth = ref(800)
const isMobile  = computed(() => containerWidth.value < 768)

// ─── Terminal State ─────────────────────────────────────
const mobileTab = ref<'list' | 'detail' | 'depth'>('list')
const listTab = ref<'watchlist' | 'gainers' | 'losers'>('watchlist')
const gainers = ref<any[]>([]); const losers = ref<any[]>([]); const discoveryLoading = ref(false)

const watchlist = ref<CryptoData[]>([])
const selectedSymbol = ref('BTCUSDT')
const selectedRange  = ref(RANGES[0])
const chartType = ref<'line' | 'candle'>('candle')

const searchQuery = ref(''); const isSearching = ref(false); const searchLoading = ref(false)
const wsStatus = ref<'connecting' | 'connected' | 'disconnected'>('disconnected')

const selectedStock = computed(() => watchlist.value.find(s => s.symbol === selectedSymbol.value) ?? null)

// ─── Alerts ─────────────────────────────────────────────
const showAlertDialog = ref(false)
const alertForm = reactive({ condition: 'above' as 'above'|'below', threshold: 0 })
const activeAlerts = computed(() => cryptoAlerts.value.filter(a => a.symbol === selectedSymbol.value))

// ─── Terminal API ───────────────────────────────────────
async function fetchTicker(symbol: string): Promise<Partial<CryptoData>> {
  const res = await fetch(`/api/binance/api/v3/ticker/24hr?symbol=${symbol}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return {
    price: parseFloat(data.lastPrice), previousClose: parseFloat(data.prevClosePrice),
    open: parseFloat(data.openPrice), dayHigh: parseFloat(data.highPrice), dayLow: parseFloat(data.lowPrice),
    volume: parseFloat(data.volume), quoteVolume: parseFloat(data.quoteVolume),
    change: parseFloat(data.priceChange), changePercent: parseFloat(data.priceChangePercent),
  }
}

async function fetchKlines(symbol: string, range: typeof RANGES[number]): Promise<{ klines: KlineData[] }> {
  const res = await fetch(`/api/binance/api/v3/klines?symbol=${symbol}&interval=${range.interval}&limit=${range.limit}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = await res.json()
  const klines: KlineData[] = []
  json.forEach((k: any) => { klines.push({ t: k[0] / 1000, o: parseFloat(k[1]), h: parseFloat(k[2]), l: parseFloat(k[3]), c: parseFloat(k[4]), v: parseFloat(k[5]) }) })
  return { klines }
}

async function loadStock(symbol: string, name: string) {
  let stock = watchlist.value.find(s => s.symbol === symbol)
  if (!stock) {
    stock = { symbol, displayName: name, price: 0, previousClose: 0, open: 0, dayHigh: 0, dayLow: 0, volume: 0, quoteVolume: 0, change: 0, changePercent: 0, klines: [], loading: true, error: false, wsBlinking: null }
    watchlist.value.push(stock)
  }
  stock.loading = true; stock.error = false
  try {
    const [ticker, klineObj] = await Promise.all([ fetchTicker(symbol), fetchKlines(symbol, selectedRange.value) ])
    Object.assign(stock, ticker, klineObj, { loading: false })
  } catch (e) { stock.loading = false; stock.error = true }
}

async function loadDiscovery() {
  if (gainers.value.length) return;
  discoveryLoading.value = true;
  try {
    const res = await fetch(`/api/binance/api/v3/ticker/24hr`); const data = await res.json();
    const usdt = data.filter((s:any) => s.symbol.endsWith('USDT') && parseFloat(s.volume) > 500);
    usdt.sort((a:any, b:any) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent));
    gainers.value = usdt.slice(0, 50);
    const loserArr = [...usdt]; loserArr.sort((a,b) => parseFloat(a.priceChangePercent) - parseFloat(b.priceChangePercent));
    losers.value = loserArr.slice(0, 50);
  } catch (e) {} finally { discoveryLoading.value = false; }
}

watch(listTab, (val) => { if (val === 'gainers' || val === 'losers') loadDiscovery() })

async function changeRange(range: typeof RANGES[number]) {
  selectedRange.value = range; const s = selectedStock.value; if (!s) return;
  s.loading = true;
  try { const kobj = await fetchKlines(s.symbol, range); Object.assign(s, kobj, { loading: false }) } catch { s.loading = false; s.error = true }
}

function selectStock(symbol: string) {
  selectedSymbol.value = symbol; if (isMobile.value) mobileTab.value = 'detail'
  const inWatchlist = watchlist.value.find(x => x.symbol === symbol)
  if (inWatchlist && inWatchlist.klines.length === 0 && !inWatchlist.loading) { loadStock(symbol, inWatchlist.displayName) }
  else if (!inWatchlist) { loadStock(symbol, symbol.replace('USDT', '')) }
  updateWSSubscription(); alertForm.threshold = selectedStock.value?.price || 0;
}

function removeStock(symbol: string) {
  watchlist.value = watchlist.value.filter(s => s.symbol !== symbol)
  cryptoWatchlist.value = cryptoWatchlist.value.filter(s => s.symbol !== symbol)
  updateWSSubscription()
  if (selectedSymbol.value === symbol && watchlist.value.length > 0) selectedSymbol.value = watchlist.value[0].symbol
}

function moveStock(symbol: string, direction: 'up' | 'down') {
  const wsIndex = watchlist.value.findIndex(s => s.symbol === symbol); const storeIndex = cryptoWatchlist.value.findIndex(s => s.symbol === symbol)
  if (direction === 'up' && wsIndex > 0) {
    const tempWs = watchlist.value[wsIndex]; watchlist.value[wsIndex] = watchlist.value[wsIndex - 1]; watchlist.value[wsIndex - 1] = tempWs;
    moveCryptoConf(storeIndex, direction)
  } else if (direction === 'down' && wsIndex < watchlist.value.length - 1) {
    const tempWs = watchlist.value[wsIndex]; watchlist.value[wsIndex] = watchlist.value[wsIndex + 1]; watchlist.value[wsIndex + 1] = tempWs;
    moveCryptoConf(storeIndex, direction)
  }
}

async function addStock() {
  let sym = searchQuery.value.trim().toUpperCase(); if (!sym) return; if (!sym.endsWith('USDT')) sym += 'USDT'
  searchQuery.value = ''; isSearching.value = false
  if (cryptoWatchlist.value.some(s => s.symbol === sym)) { listTab.value = 'watchlist'; selectStock(sym); return }
  searchLoading.value = true
  try {
    await fetchTicker(sym); await loadStock(sym, sym.replace('USDT', ''));
    cryptoWatchlist.value.push({ symbol: sym, name: sym.replace('USDT', '') })
    listTab.value = 'watchlist'; selectedSymbol.value = sym; updateWSSubscription()
  } catch (e) { alert(`无法找到交易对: ${sym}`) } finally { searchLoading.value = false }
}

// ─── WebSocket ──────────────────────────────────────────
let ws: WebSocket | null = null; let reconnectTimer: any = null

function connectWS() {
  if (ws) ws.close(); wsStatus.value = 'connecting'
  ws = new WebSocket('wss://stream.binance.com:9443/ws')
  ws.onopen = () => { wsStatus.value = 'connected'; updateWSSubscription() }
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      if (data.e === '24hrTicker') {
        const stock = watchlist.value.find(s => s.symbol === data.s)
        if (stock && !stock.loading) {
          const newPrice = parseFloat(data.c)
          if (stock.price !== newPrice && stock.price > 0) {
            stock.wsBlinking = newPrice > stock.price ? 'up' : 'down'
            setTimeout(() => { if (stock) stock.wsBlinking = null }, 300)
          }
          stock.price = newPrice; stock.open = parseFloat(data.o); stock.dayHigh = parseFloat(data.h); stock.dayLow = parseFloat(data.l);
          stock.volume = parseFloat(data.v); stock.quoteVolume = parseFloat(data.q); stock.change = parseFloat(data.p); stock.changePercent = parseFloat(data.P); stock.previousClose = parseFloat(data.x)
          if (stock.klines.length > 0) {
             const k = stock.klines[stock.klines.length - 1]; k.c = newPrice; k.h = Math.max(k.h, newPrice); k.l = Math.min(k.l, newPrice)
          }
        }
      }
    } catch (e) {}
  }
  ws.onclose = () => { wsStatus.value = 'disconnected'; clearTimeout(reconnectTimer); reconnectTimer = setTimeout(connectWS, 3000) }
  ws.onerror = () => { wsStatus.value = 'disconnected' }
}

function updateWSSubscription() {
  if (!ws || ws.readyState !== WebSocket.OPEN) return
  const symbols = [...cryptoWatchlist.value.map(s => s.symbol)];
  if (!symbols.includes(selectedSymbol.value)) symbols.push(selectedSymbol.value);
  const streams = symbols.map(s => s.toLowerCase() + '@ticker')
  ws.send(JSON.stringify({ method: "SUBSCRIBE", params: streams, id: Date.now() }))
}

// ─── Formatting ─────────────────────────────────────────
const isUp = (s: CryptoData) => s.change >= 0
function fmt(v: number, decimals?: number) {
  if (v === undefined || v === null) return '--'
  if (decimals === undefined) decimals = v < 1 ? 4 : (v > 1000 ? 2 : 3)
  const str = v.toFixed(decimals)
  if (decimals > 2 && str.includes('.')) return str.replace(/\.?0+$/, '') || '0'
  return str
}
function fmtCurrency(v: number) {
  if (v >= 1e9)  return (v / 1e9).toFixed(2)  + ' B'
  if (v >= 1e6)  return (v / 1e6).toFixed(2)  + ' M'
  if (v >= 1e3)  return (v / 1e3).toFixed(2)  + ' K'
  return v.toFixed(2)
}

// ─── Lifecycle ──────────────────────────────────────────
let ro: ResizeObserver | null = null
onMounted(() => {
  if (containerRef.value) {
    ro = new ResizeObserver(([e]) => { containerWidth.value = e.contentRect.width })
    ro.observe(containerRef.value); containerWidth.value = containerRef.value.offsetWidth
  }
  Promise.all(cryptoWatchlist.value.map(({ symbol, name }) => loadStock(symbol, name))).then(() => { connectWS() })
})
onUnmounted(() => { ro?.disconnect(); clearTimeout(reconnectTimer); if (ws) ws.close() })
</script>

<template>
  <div ref="containerRef" class="crypto-app @container h-full w-full flex bg-[var(--fly-bg-primary)] text-[var(--fly-text-primary)] font-sans overflow-hidden relative select-none">

    <!-- ══════════════════ CORE SIDEBAR NAV ══════════════════ -->
    <nav class="w-14 shrink-0 flex flex-col items-center py-4 bg-[var(--fly-bg-glass)] border-r border-[var(--fly-border-system)] z-40 gap-6 backdrop-blur">
       <div class="h-8 w-8 bg-black dark:bg-white rounded-[var(--fly-radius-md)] flex items-center justify-center text-white dark:text-black mb-2 shadow-lg shadow-black/20 dark:shadow-white/20">
         <Activity :size="20" stroke-width="3" />
       </div>
       
       <button @click="appMode = 'terminal'" class="p-2 rounded-xl transition-all relative group" :class="appMode==='terminal' ? 'bg-accent/20 text-accent' : 'opacity-40 hover:opacity-100 hover:bg-black/5'">
          <LineChart :size="20" />
          <div v-if="appMode==='terminal'" class="absolute -left-1 top-1/2 -mt-2 w-1 h-4 bg-accent rounded-r-full"></div>
       </button>
       
       <button @click="appMode = 'grid'" class="p-2 rounded-xl transition-all relative group" :class="appMode==='grid' ? 'bg-accent/20 text-accent' : 'opacity-40 hover:opacity-100 hover:bg-black/5'">
          <LayoutGrid :size="20" />
          <div v-if="appMode==='grid'" class="absolute -left-1 top-1/2 -mt-2 w-1 h-4 bg-accent rounded-r-full"></div>
       </button>
       
       <button @click="appMode = 'heatmap'" class="p-2 rounded-xl transition-all relative group" :class="appMode==='heatmap' ? 'bg-accent/20 text-accent' : 'opacity-40 hover:opacity-100 hover:bg-black/5'">
          <MapIcon :size="20" />
          <div v-if="appMode==='heatmap'" class="absolute -left-1 top-1/2 -mt-2 w-1 h-4 bg-accent rounded-r-full"></div>
       </button>
       
       <button @click="appMode = 'portfolio'" class="p-2 rounded-xl transition-all relative group mt-auto mb-2" :class="appMode==='portfolio' ? 'bg-accent/20 text-accent' : 'opacity-40 hover:opacity-100 hover:bg-black/5'">
          <Wallet :size="20" />
          <div v-if="appMode==='portfolio'" class="absolute -left-1 top-1/2 -mt-2 w-1 h-4 bg-accent rounded-r-full"></div>
       </button>
    </nav>

    <!-- ══════════════════ WORKSPACE ══════════════════ -->
    <div class="flex-1 overflow-hidden relative">

       <!-- ====== SCENE 1: Terminal ====== -->
       <div v-if="appMode === 'terminal'" class="h-full w-full flex">
         
         <!-- TERMINAL SIDEBAR -> Lists -->
         <aside class="flex flex-col border-r border-[var(--fly-border-system)] bg-[var(--fly-bg-secondary)] shrink-0 z-20 transition-all h-full" :class="isMobile ? (mobileTab === 'list' ? 'w-full' : 'hidden') : 'w-72 lg:w-80'">
            <!-- List Controls (unchanged from pro version) -->
            <div class="px-4 pt-4 pb-2 border-b border-[var(--fly-border-system)]/50 shrink-0">
               <div v-if="isSearching" class="flex items-center gap-2 mb-2">
                 <input v-model="searchQuery" @keydown.enter="addStock" @keydown.escape="isSearching = false; searchQuery = ''" autofocus placeholder="代码 (如 SOL)" class="flex-1 text-xs font-bold uppercase bg-[var(--fly-bg-primary)] border border-[var(--fly-border-system)] rounded px-3 py-2 outline-none focus:border-accent" />
                 <button @click="addStock" :disabled="searchLoading" class="p-2 bg-accent text-white rounded active:scale-95"><RefreshCcw v-if="searchLoading" :size="14" class="animate-spin" /><Plus v-else :size="14" stroke-width="3" /></button>
                 <button @click="isSearching = false; searchQuery = ''" class="p-2 opacity-50 hover:opacity-100"><X :size="14" /></button>
               </div>
               <div v-else class="flex items-center justify-between mb-3">
                 <div class="flex items-center gap-2">
                   <h2 class="text-sm font-black uppercase tracking-widest opacity-80 flex items-center gap-1.5">终端列表</h2>
                   <div :class="['w-1.5 h-1.5 rounded-full', wsStatus === 'connected' ? 'bg-emerald-500' : wsStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500']"></div>
                 </div>
                 <button @click="isSearching = true" class="p-1.5 hover:bg-black/10 rounded-full opacity-50 hover:opacity-100"><Plus :size="16" stroke-width="3" /></button>
               </div>
               <div class="flex p-0.5 bg-[var(--fly-bg-primary)] rounded-[var(--fly-radius-md)] border border-[var(--fly-border-system)]/30 text-[10px] font-black tracking-widest uppercase">
                 <button @click="listTab = 'watchlist'" :class="listTab === 'watchlist' ? 'bg-[var(--fly-bg-secondary)] shadow-sm' : 'opacity-40'" class="flex-1 py-1 px-1 rounded transition-all truncate">自选</button>
                 <button @click="listTab = 'gainers'" :class="listTab === 'gainers' ? 'bg-emerald-500 text-white shadow-sm' : 'opacity-40'" class="flex-1 py-1 px-1 rounded transition-all truncate">涨幅</button>
                 <button @click="listTab = 'losers'" :class="listTab === 'losers' ? 'bg-red-500 text-white shadow-sm' : 'opacity-40'" class="flex-1 py-1 px-1 rounded transition-all truncate">跌幅</button>
               </div>
            </div>

            <!-- List Content -->
            <div class="flex-1 overflow-y-auto no-scrollbar pb-10">
               <template v-if="listTab === 'watchlist'">
                 <div v-for="stock in watchlist" :key="stock.symbol" @click="selectStock(stock.symbol)" :class="[ 'group flex items-center justify-between px-3 md:px-4 py-2 border-b border-[var(--fly-border-system)]/30 cursor-pointer', selectedSymbol === stock.symbol && !isMobile ? 'bg-accent/10' : 'hover:bg-black/5 dark:hover:bg-white/5' ]">
                   <div class="flex-1 min-w-0">
                     <div class="flex items-center gap-2 mb-0.5">
                       <span class="text-[13px] font-black uppercase">{{ stock.symbol.replace('USDT','') }}</span>
                       <span v-if="!stock.loading && !stock.error" class="text-[10px] font-black tabular-nums border px-1 rounded-[var(--fly-radius-sm)]" :class="isUp(stock) ? 'border-emerald-500/20 text-emerald-500 bg-emerald-500/10' : 'border-red-500/20 text-red-500 bg-red-500/10'">{{ isUp(stock) ? '+' : '' }}{{ fmt(stock.changePercent) }}%</span>
                     </div>
                   </div>
                   <div class="flex items-center">
                     <div v-if="stock.loading" class="animate-pulse opacity-30"><Activity :size="14" /></div>
                     <div v-else-if="!stock.error" class="text-right">
                       <span class="text-[14px] font-mono font-black tabular-nums px-1 rounded" :class="stockColor(stock)">{{ fmt(stock.price) }}</span>
                     </div>
                     <div class="w-0 overflow-hidden group-hover:w-12 flex items-center justify-end transition-all opacity-0 group-hover:opacity-100 ml-1">
                       <div class="flex flex-col"><button @click.stop="moveStock(stock.symbol, 'up')"><ChevronUp :size="10" stroke-width="3" /></button><button @click.stop="moveStock(stock.symbol, 'down')"><ChevronDown :size="10" stroke-width="3" /></button></div>
                       <button @click.stop="removeStock(stock.symbol)" class="ml-1 text-red-500"><X :size="14" stroke-width="3" /></button>
                     </div>
                   </div>
                 </div>
               </template>
               <template v-else>
                 <div v-if="discoveryLoading" class="p-10 opacity-30 flex flex-col items-center"><Activity :size="32" class="animate-spin mb-2" /></div>
                 <div v-else v-for="(coin, idx) in (listTab === 'gainers' ? gainers : losers)" :key="coin.symbol" @click="selectStock(coin.symbol)" :class="['flex items-center justify-between px-4 py-2 border-b border-[var(--fly-border-system)]/10 text-xs hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer', selectedSymbol === coin.symbol && !isMobile ? 'bg-accent/10' : '']">
                   <div class="flex items-center gap-3"><span class="opacity-20 font-mono w-4 font-black italic">{{ idx+1 }}</span><span class="font-black">{{ coin.symbol.replace('USDT','') }}</span></div>
                   <div class="flex flex-col items-end"><span class="font-mono font-bold">{{ parseFloat(coin.lastPrice).toFixed(4).replace(/\.?0+$/, '') }}</span><span class="font-bold tracking-tight" :class="listTab==='gainers'?'text-emerald-500':'text-red-500'">{{ parseFloat(coin.priceChangePercent) > 0 ? '+' : '' }}{{ parseFloat(coin.priceChangePercent).toFixed(2) }}%</span></div>
                 </div>
               </template>
            </div>
         </aside>

         <!-- TERMINAL MAIN -->
         <main class="flex-1 flex flex-col overflow-hidden h-full" :class="isMobile && mobileTab !== 'detail' ? 'hidden' : ''">
            <template v-if="selectedStock">
              <!-- Top Info Bar -->
              <div class="px-6 pt-5 pb-3 border-b border-[var(--fly-border-system)] bg-[var(--fly-bg-glass)] backdrop-blur-xl shrink-0">
                <div class="flex justify-between items-start gap-4">
                  <div>
                    <div class="flex items-center gap-2">
                      <button v-if="isMobile" @click="mobileTab = 'list'" class="mr-2"><ChevronUp class="-rotate-90" :size="20"/></button>
                      <h1 class="text-2xl md:text-3xl font-black tracking-tight uppercase">{{ selectedStock.symbol.replace('USDT','') }}</h1>
                      <span class="text-xs font-black opacity-30 tracking-widest mt-1">/ USDT</span>
                    </div>
                    <div class="flex gap-2.5 mt-3">
                      <button v-for="r in RANGES" :key="r.value" @click="changeRange(r)" class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest transition-colors" :class="selectedRange.value===r.value ? 'bg-[var(--fly-text-primary)] text-[var(--fly-bg-primary)]' : 'bg-black/5 dark:bg-white/5 opacity-50 hover:opacity-100'">{{ r.label }}</button>
                    </div>
                  </div>
                  <div class="text-right relative">
                    <div class="flex items-center gap-3 justify-end">
                      <div class="relative">
                        <button @click="showAlertDialog = !showAlertDialog" class="p-2 rounded-full" :class="activeAlerts.length ? 'text-orange-400 bg-orange-400/10' : 'opacity-40 hover:opacity-100 hover:bg-black/10'"><BellRing v-if="activeAlerts.length" :size="16" /><Bell v-else :size="16" /></button>
                        <div v-if="showAlertDialog" class="absolute z-50 p-4 border border-[var(--fly-border-system)] bg-[var(--fly-bg-primary)] shadow-2xl rounded-lg right-0 top-10 w-64 text-left">
                          <div class="flex justify-between items-center mb-4"><h4 class="font-black text-sm tracking-widest uppercase">价格铃铛</h4><X @click="showAlertDialog=false" :size="14" class="opacity-50 cursor-pointer"/></div>
                          <div class="space-y-2 mb-4 text-xs font-bold font-mono">
                            <div v-for="alt in activeAlerts" :key="alt.id" class="flex justify-between bg-black/5 p-2 rounded items-center">
                               <span><span :class="alt.condition==='above'?'text-emerald-500':'text-red-500'">{{ alt.condition === 'above' ? '>' : '<' }}</span> {{ alt.threshold }}</span>
                               <Trash2 @click="removeAlert(alt.id)" :size="12" class="text-red-500 opacity-50 cursor-pointer hover:opacity-100"/>
                            </div>
                          </div>
                          <div class="flex items-center gap-2 mb-3"><select v-model="alertForm.condition" class="bg-black/10 border-none outline-none rounded p-1 text-xs"><option value="above">&gt;</option><option value="below">&lt;</option></select><input v-model="alertForm.threshold" type="number" class="w-full bg-black/10 \border-none outline-none rounded p-1 font-mono text-xs"/></div>
                          <button @click="() => { addAlert(selectedSymbol, alertForm.condition, alertForm.threshold); showAlertDialog=false }" class="w-full py-1 bg-accent text-white font-black uppercase text-xs rounded">新建</button>
                        </div>
                      </div>
                      <div class="text-3xl md:text-5xl font-black font-mono tracking-tighter" :class="stockColor(selectedStock)">{{ fmt(selectedStock.price) }}</div>
                    </div>
                    <div class="flex justify-end gap-2 text-xs font-black mt-1" :class="isUp(selectedStock) ? 'text-emerald-500' : 'text-red-500'">
                      <span>{{ isUp(selectedStock) ? '+' : '' }}{{ fmt(selectedStock.change) }}</span><span class="px-1 bg-current opacity-80 text-white rounded">{{ isUp(selectedStock) ? '+' : '' }}{{ fmt(selectedStock.changePercent) }}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Main Workspace Content -->
              <div class="flex-1 overflow-y-auto no-scrollbar p-2 sm:p-4 md:p-6 pb-20 flex flex-col gap-4">
                 
                 <!-- Chart Base -->
                 <div class="flex flex-col bg-[var(--fly-bg-primary)] h-[280px] md:h-[400px] shrink-0 w-full relative group">
                    <div class="absolute right-2 top-2 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button @click="chartType = 'line'" class="p-1 rounded text-xs bg-[var(--fly-bg-secondary)] border border-[var(--fly-border-system)]" :class="chartType==='line'?'shadow opacity-100':'opacity-40'">折线</button>
                      <button @click="chartType = 'candle'" class="p-1 rounded text-xs bg-[var(--fly-bg-secondary)] border border-[var(--fly-border-system)]" :class="chartType==='candle'?'shadow opacity-100':'opacity-40'">专业K线</button>
                    </div>
                    <CryptoChart :klines="selectedStock.klines" :loading="selectedStock.loading" :type="chartType" class="w-full h-full border-none !bg-transparent rounded-none" />
                 </div>
                 
                 <!-- Bottom Panels -->
                 <div class="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0 px-2 lg:px-4">
                   <FearGreedIndex class="col-span-2 rounded-[var(--fly-radius-md)] border border-[var(--fly-border-system)]/30 shadow-sm" />
                   <div class="col-span-2 flex flex-col justify-center bg-[var(--fly-bg-secondary)] rounded-[var(--fly-radius-md)] p-4 border border-[var(--fly-border-system)]/30">
                     <p class="text-[10px] uppercase font-black tracking-widest opacity-40 mb-1">24H RANGE (USDT)</p>
                     <div class="flex justify-between text-xs font-mono font-bold mt-1 mb-2">
                       <span class="opacity-50">{{ selectedStock.dayLow }}</span>
                       <span class="text-emerald-500">Vol: {{ fmtCurrency(selectedStock.volume) }}</span>
                       <span class="opacity-50">{{ selectedStock.dayHigh }}</span>
                     </div>
                     <div class="w-full h-1 bg-black/10 dark:bg-white/10 relative rounded-full"><div class="absolute w-2 h-2 rounded-full bg-accent top-1/2 -mt-1 shadow" :style="{ left: `calc(${((selectedStock.price - selectedStock.dayLow) / (selectedStock.dayHigh - selectedStock.dayLow || 1)) * 100}% - 4px)` }"></div></div>
                     
                     <button v-if="isMobile" @click="mobileTab = 'depth'" class="mt-4 text-xs font-black bg-accent text-white py-2 rounded">查看深度 & 成交 (Depth)</button>
                   </div>
                 </div>

              </div>
            </template>
            <div v-else class="flex-1 flex flex-col items-center justify-center opacity-10"><BarChart :size="64" class="mb-4" /><p class="text-xs font-black tracking-widest uppercase">Select an Asset</p></div>
         </main>

         <!-- TERMINAL DEPTH SIDEBAR -->
         <template v-if="selectedSymbol && (!isMobile || mobileTab === 'depth')">
           <div v-if="isMobile && mobileTab === 'depth'" class="absolute inset-0 bg-[var(--fly-bg-primary)] z-30 flex flex-col">
              <div class="p-4 border-b flex items-center gap-2"><button @click="mobileTab = 'detail'"><ChevronUp class="-rotate-90" :size="20"/></button><span class="font-black uppercase">Orderbook - {{ selectedSymbol.replace('USDT', '') }}</span></div>
              <CryptoOrderbook :symbol="selectedSymbol" class="flex-1 w-full" />
           </div>
           <CryptoOrderbook v-else :symbol="selectedSymbol" class="hidden xl:flex" />
         </template>

       </div>

       <!-- ====== SCENE 2: Heatmap ====== -->
       <CryptoHeatmap v-else-if="appMode === 'heatmap'" />

       <!-- ====== SCENE 3: Grid ====== -->
       <CryptoGrid v-else-if="appMode === 'grid'" />

       <!-- ====== SCENE 4: Portfolio ====== -->
       <CryptoPortfolio v-else-if="appMode === 'portfolio'" />

    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
</style>

<script lang="ts">
function stockColor(selectedStock: any) {
  if (selectedStock.wsBlinking === 'up') return 'bg-emerald-500 text-white'
  if (selectedStock.wsBlinking === 'down') return 'bg-red-500 text-white'
  return selectedStock.change >= 0 ? 'text-emerald-500' : 'text-red-500'
}
</script>
