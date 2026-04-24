<script setup lang="ts">
import { ref, computed, reactive, onMounted, onUnmounted, watch } from 'vue'
import { cryptoWatchlist, moveCryptoConf } from '@/stores/cryptoStore'
import { Plus, X, BarChart2, Activity, RefreshCcw, Wifi, WifiOff, ChevronUp, ChevronDown } from 'lucide-vue-next'

// ─── Types ───────────────────────────────────────────────────────────────────
interface CryptoData {
  symbol: string
  displayName: string
  price: number
  previousClose: number
  open: number
  dayHigh: number
  dayLow: number
  volume: number
  quoteVolume: number
  change: number
  changePercent: number
  prices: number[]
  timestamps: number[]
  loading: boolean
  error: boolean
  wsBlinking?: 'up' | 'down' | null
}

// ─── Constants ────────────────────────────────────────────────────────────────
const RANGES = [
  { label: '24小时', value: '1d',  interval: '1h', limit: 24 },
  { label: '7天',   value: '7d',  interval: '4h', limit: 42 },
  { label: '1月',   value: '1M',  interval: '1d', limit: 30 },
  { label: '3月',   value: '3M',  interval: '1d', limit: 90 },
  { label: '1年',   value: '1y',  interval: '1w', limit: 52 },
]

// ─── State ────────────────────────────────────────────────────────────────────
const containerRef   = ref<HTMLElement | null>(null)
const containerWidth = ref(800)
const isMobile  = computed(() => containerWidth.value < 600)
const mobileTab = ref<'list' | 'detail'>('list')

const watchlist     = ref<CryptoData[]>([])
const selectedSymbol = ref('BTCUSDT')
const selectedRange  = ref(RANGES[0])

const searchQuery = ref('')
const isSearching = ref(false)
const searchLoading = ref(false)

const wsStatus = ref<'connecting' | 'connected' | 'disconnected'>('disconnected')

const selectedStock = computed(() =>
  watchlist.value.find(s => s.symbol === selectedSymbol.value) ?? null
)

// ─── API: REST ────────────────────────────────────────────────────────────────
async function fetchTicker(symbol: string): Promise<Partial<CryptoData>> {
  // Use proxy to avoid any potential cors or rate limiting issues
  const res = await fetch(`/api/binance/api/v3/ticker/24hr?symbol=${symbol}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return {
    price: parseFloat(data.lastPrice),
    previousClose: parseFloat(data.prevClosePrice),
    open: parseFloat(data.openPrice),
    dayHigh: parseFloat(data.highPrice),
    dayLow: parseFloat(data.lowPrice),
    volume: parseFloat(data.volume),
    quoteVolume: parseFloat(data.quoteVolume),
    change: parseFloat(data.priceChange),
    changePercent: parseFloat(data.priceChangePercent),
  }
}

async function fetchKlines(symbol: string, range: typeof RANGES[number]): Promise<{ prices: number[], timestamps: number[] }> {
  const res = await fetch(`/api/binance/api/v3/klines?symbol=${symbol}&interval=${range.interval}&limit=${range.limit}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = await res.json()
  
  const prices: number[] = []
  const timestamps: number[] = []
  
  json.forEach((kline: any) => {
    timestamps.push(kline[0] / 1000)
    prices.push(parseFloat(kline[4])) // close price
  })
  
  return { prices, timestamps }
}

async function loadStock(symbol: string, name: string) {
  let stock = watchlist.value.find(s => s.symbol === symbol)
  if (!stock) {
    const newStock: CryptoData = {
      symbol, displayName: name,
      price: 0, previousClose: 0, open: 0, dayHigh: 0, dayLow: 0,
      volume: 0, quoteVolume: 0,
      change: 0, changePercent: 0,
      prices: [], timestamps: [],
      loading: true, error: false, wsBlinking: null
    }
    watchlist.value.push(newStock)
    stock = watchlist.value.at(-1)!
  }
  
  stock.loading = true
  stock.error   = false
  
  try {
    const [ticker, klines] = await Promise.all([
      fetchTicker(symbol),
      fetchKlines(symbol, selectedRange.value)
    ])
    Object.assign(stock, ticker, klines, { loading: false })
  } catch (e) {
    console.error(`[Crypto] ${symbol}:`, e)
    stock.loading = false
    stock.error   = true
  }
}

async function changeRange(range: typeof RANGES[number]) {
  selectedRange.value = range
  const s = selectedStock.value
  if (!s) return
  s.loading = true
  try {
    const klines = await fetchKlines(s.symbol, range)
    Object.assign(s, klines, { loading: false })
  } catch { s.loading = false; s.error = true }
}

function selectStock(symbol: string) {
  selectedSymbol.value = symbol
  if (isMobile.value) mobileTab.value = 'detail'
  const s = watchlist.value.find(x => x.symbol === symbol)
  if (s && s.prices.length === 0 && !s.loading) loadStock(symbol, s.displayName)
}

function removeStock(symbol: string) {
  watchlist.value = watchlist.value.filter(s => s.symbol !== symbol)
  cryptoWatchlist.value = cryptoWatchlist.value.filter(s => s.symbol !== symbol)
  updateWSSubscription()
  if (selectedSymbol.value === symbol && watchlist.value.length > 0)
    selectedSymbol.value = watchlist.value[0].symbol
}

function moveStock(symbol: string, direction: 'up' | 'down') {
  const wsIndex = watchlist.value.findIndex(s => s.symbol === symbol)
  const storeIndex = cryptoWatchlist.value.findIndex(s => s.symbol === symbol)
  
  if (direction === 'up' && wsIndex > 0) {
    const tempWs = watchlist.value[wsIndex];
    watchlist.value[wsIndex] = watchlist.value[wsIndex - 1];
    watchlist.value[wsIndex - 1] = tempWs;
    moveCryptoConf(storeIndex, direction)
  } else if (direction === 'down' && wsIndex < watchlist.value.length - 1) {
    const tempWs = watchlist.value[wsIndex];
    watchlist.value[wsIndex] = watchlist.value[wsIndex + 1];
    watchlist.value[wsIndex + 1] = tempWs;
    moveCryptoConf(storeIndex, direction)
  }
}

async function addStock() {
  let sym = searchQuery.value.trim().toUpperCase()
  if (!sym) return
  if (!sym.endsWith('USDT')) sym += 'USDT' // Autocomplete USDT
  
  searchQuery.value = ''
  isSearching.value = false
  
  if (watchlist.value.some(s => s.symbol === sym)) {
    selectStock(sym)
    return
  }
  
  searchLoading.value = true
  try {
    // Validate if symbol exists via ticker
    await fetchTicker(sym)
    await loadStock(sym, sym.replace('USDT', ''))
    
    // Add to persistent store
    if (!cryptoWatchlist.value.some(s => s.symbol === sym)) {
      cryptoWatchlist.value.push({ symbol: sym, name: sym.replace('USDT', '') })
    }
    
    selectedSymbol.value = sym
    updateWSSubscription()
  } catch (e) {
    alert(`无法找到交易对: ${sym}`)
  } finally {
    searchLoading.value = false
  }
}

// ─── API: WebSocket ───────────────────────────────────────────────────────────
let ws: WebSocket | null = null
let reconnectTimer: any = null

function connectWS() {
  if (ws) ws.close()
  wsStatus.value = 'connecting'
  
  ws = new WebSocket('wss://stream.binance.com:9443/ws')
  
  ws.onopen = () => {
    wsStatus.value = 'connected'
    updateWSSubscription()
  }
  
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      if (data.e === '24hrTicker') {
        const stock = watchlist.value.find(s => s.symbol === data.s)
        if (stock && !stock.loading) {
          const newPrice = parseFloat(data.c)
          if (stock.price !== newPrice && stock.price > 0) {
            stock.wsBlinking = newPrice > stock.price ? 'up' : 'down'
            setTimeout(() => { if (stock) stock.wsBlinking = null }, 400)
          }
          
          stock.price = newPrice
          stock.open = parseFloat(data.o)
          stock.dayHigh = parseFloat(data.h)
          stock.dayLow = parseFloat(data.l)
          stock.volume = parseFloat(data.v)
          stock.quoteVolume = parseFloat(data.q)
          stock.change = parseFloat(data.p)
          stock.changePercent = parseFloat(data.P)
          stock.previousClose = parseFloat(data.x)
          
          // Update last price point in chart live
          if (stock.prices.length > 0) {
             stock.prices[stock.prices.length - 1] = newPrice
          }
        }
      }
    } catch (e) {}
  }
  
  ws.onclose = () => {
    wsStatus.value = 'disconnected'
    // Auto reconnect
    clearTimeout(reconnectTimer)
    reconnectTimer = setTimeout(connectWS, 3000)
  }
  
  ws.onerror = () => {
    wsStatus.value = 'disconnected'
  }
}

function updateWSSubscription() {
  if (!ws || ws.readyState !== WebSocket.OPEN) return
  
  const streams = watchlist.value.map(s => s.symbol.toLowerCase() + '@ticker')
  const msg = {
    method: "SUBSCRIBE",
    params: streams,
    id: Date.now()
  }
  ws.send(JSON.stringify(msg))
}

// ─── SVG Chart ────────────────────────────────────────────────────────────────
function sparkPath(prices: number[], W = 300, H = 60) {
  if (prices.length < 2) return { line: '', area: '' }
  const lo = Math.min(...prices), hi = Math.max(...prices)
  const rng = hi - lo || 1
  const pts = prices.map((p, i) => {
    const x = ((i / (prices.length - 1)) * W).toFixed(1)
    const y = (H - ((p - lo) / rng) * H).toFixed(1)
    return `${x},${y}`
  })
  const line = `M${pts.join('L')}`
  const area = `${line}L${W},${H}L0,${H}Z`
  return { line, area }
}

function miniSpark(prices: number[]) {
  return sparkPath(prices, 64, 28)
}

// ─── Formatter ──────────────────────────────────────────────────────────────────
const isUp = (s: CryptoData) => s.change >= 0

function fmt(v: number, decimals?: number) {
  if (v === undefined || v === null) return '--'
  if (decimals === undefined) decimals = v < 1 ? 4 : 2
  
  const str = v.toFixed(decimals)
  // Strip trailing zeros for small numbers
  if (decimals > 2 && str.includes('.')) {
    return str.replace(/\.?0+$/, '') || '0'
  }
  return str
}

function fmtCurrency(v: number) {
  if (v >= 1e9)  return (v / 1e9).toFixed(2)  + ' B'
  if (v >= 1e6)  return (v / 1e6).toFixed(2)  + ' M'
  if (v >= 1e3)  return (v / 1e3).toFixed(2)  + ' K'
  return v.toFixed(2)
}

function fmtTs(ts: number) {
  const d = new Date(ts * 1000)
  return `${d.getMonth()+1}/${d.getDate()} ${d.toTimeString().substring(0, 5)}`
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────
let ro: ResizeObserver | null = null
onMounted(() => {
  if (containerRef.value) {
    ro = new ResizeObserver(([e]) => { containerWidth.value = e.contentRect.width })
    ro.observe(containerRef.value)
    containerWidth.value = containerRef.value.offsetWidth
  }
  
  Promise.all(cryptoWatchlist.value.map(({ symbol, name }) => loadStock(symbol, name))).then(() => {
    connectWS()
  })
})

onUnmounted(() => {
  ro?.disconnect()
  clearTimeout(reconnectTimer)
  if (ws) ws.close()
})
</script>

<template>
  <div ref="containerRef" class="crypto-app @container h-full w-full flex bg-[var(--fly-bg-primary)] text-[var(--fly-text-primary)] font-sans overflow-hidden relative select-none">

    <!-- ══════════════════ SIDEBAR ══════════════════ -->
    <aside
      class="flex flex-col border-r border-[var(--fly-border-system)] bg-[var(--fly-bg-secondary)] shrink-0 z-10 overflow-hidden transition-all"
      :class="isMobile ? (mobileTab === 'list' ? 'w-full' : 'hidden') : 'w-72 lg:w-80'"
    >
      <!-- Header -->
      <div class="p-4 border-b border-[var(--fly-border-system)]">
        <!-- Search -->
        <div v-if="isSearching" class="flex items-center gap-2">
          <input
            v-model="searchQuery"
            @keydown.enter="addStock"
            @keydown.escape="isSearching = false; searchQuery = ''"
            autofocus
            placeholder="代码 (如 BTC)"
            class="flex-1 text-xs font-bold uppercase bg-[var(--fly-bg-primary)] border border-[var(--fly-border-system)] rounded-[var(--fly-radius-sm)] px-3 py-2 outline-none focus:ring-2 focus:ring-accent/20 placeholder:opacity-30"
          />
          <button @click="addStock" :disabled="searchLoading" class="p-2 bg-accent text-white rounded-[var(--fly-radius-sm)] active:scale-90 transition-all">
            <RefreshCcw v-if="searchLoading" :size="14" class="animate-spin" />
            <Plus v-else :size="14" />
          </button>
          <button @click="isSearching = false; searchQuery = ''" class="p-2 opacity-40 hover:opacity-100 rounded-full transition-all">
            <X :size="14" />
          </button>
        </div>
        <!-- Title bar -->
        <div v-else class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <h2 class="text-sm font-black uppercase tracking-widest opacity-60">加密货币</h2>
            <div :class="[
              'w-2 h-2 rounded-full',
              wsStatus === 'connected' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
              wsStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
            ]" :title="wsStatus"></div>
          </div>
          <button @click="isSearching = true" class="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-all active:scale-90">
            <Plus :size="16" class="opacity-60" />
          </button>
        </div>
      </div>

      <!-- List -->
      <div class="flex-1 overflow-y-auto no-scrollbar">
        <div
          v-for="stock in watchlist"
          :key="stock.symbol"
          @click="selectStock(stock.symbol)"
          :class="[
            'group flex items-center gap-3 px-4 py-3 cursor-pointer transition-all border-b border-[var(--fly-border-system)]/30',
            selectedSymbol === stock.symbol && !isMobile
              ? 'bg-accent/10 border-l-2 border-l-accent'
              : 'hover:bg-black/3 dark:hover:bg-white/3'
          ]"
        >
          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-baseline mb-0.5">
              <span class="text-[13px] font-black tracking-tight truncate">{{ stock.displayName }}</span>
              <!-- Blinking Price -->
              <span 
                v-if="!stock.loading && !stock.error" 
                class="text-[13px] font-mono font-black tabular-nums transition-colors duration-150 ml-2 shrink-0 rounded px-1 -mr-1"
                :class="[
                  stock.wsBlinking === 'up' ? 'bg-emerald-500 text-white' : 
                  stock.wsBlinking === 'down' ? 'bg-red-500 text-white' : 
                  (isUp(stock) ? 'text-emerald-500' : 'text-red-500')
                ]"
              >
                {{ fmt(stock.price) }}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-[10px] font-bold opacity-30 uppercase tracking-wider">{{ stock.symbol }}</span>
              <span v-if="!stock.loading && !stock.error" class="text-[10px] font-black tabular-nums" :class="isUp(stock) ? 'text-emerald-500' : 'text-red-500'">
                {{ isUp(stock) ? '+' : '' }}{{ fmt(stock.changePercent) }}%
              </span>
            </div>
          </div>

          <!-- Mini Sparkline -->
          <div v-if="!stock.loading && !stock.error && stock.prices.length > 1" class="shrink-0">
            <svg width="60" height="24" viewBox="0 0 64 28">
              <defs>
                <linearGradient :id="`mg-${stock.symbol}`" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" :stop-color="isUp(stock) ? '#10b981' : '#ef4444'" stop-opacity="0.3"/>
                  <stop offset="100%" :stop-color="isUp(stock) ? '#10b981' : '#ef4444'" stop-opacity="0"/>
                </linearGradient>
              </defs>
              <path :d="miniSpark(stock.prices).area" :fill="`url(#mg-${stock.symbol})`" />
              <path :d="miniSpark(stock.prices).line" :stroke="isUp(stock) ? '#10b981' : '#ef4444'" stroke-width="1.5" fill="none" stroke-linecap="round" />
            </svg>
          </div>

          <!-- Loading / Error -->
          <div v-if="stock.loading" class="shrink-0 opacity-20 animate-pulse">
            <Activity :size="16" />
          </div>
          <div v-if="stock.error" class="shrink-0 text-red-400 opacity-60 text-[10px] font-black">ERR</div>

          <!-- Controls (Sort & Remove) -->
          <div class="shrink-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ml-1">
            <div class="flex flex-col gap-0.5">
              <button @click.stop="moveStock(stock.symbol, 'up')" class="hover:bg-black/10 dark:hover:bg-white/10 rounded p-px text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                <ChevronUp :size="12" stroke-width="3" />
              </button>
              <button @click.stop="moveStock(stock.symbol, 'down')" class="hover:bg-black/10 dark:hover:bg-white/10 rounded p-px text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                <ChevronDown :size="12" stroke-width="3" />
              </button>
            </div>
            <button
              @click.stop="removeStock(stock.symbol)"
              class="ml-1 p-1 hover:bg-red-500/10 rounded transition-all text-red-500 opacity-50 hover:opacity-100"
            >
              <X :size="14" stroke-width="2.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>

    <!-- ══════════════════ MAIN CONTENT ══════════════════ -->
    <main
      class="flex-1 flex flex-col overflow-hidden"
      :class="isMobile && mobileTab === 'list' ? 'hidden' : ''"
    >

      <template v-if="selectedStock">
        <!-- Header & Realtime Value -->
        <div class="px-6 pt-6 pb-4 border-b border-[var(--fly-border-system)] bg-[var(--fly-bg-glass)] backdrop-blur-xl shrink-0">
          <div class="flex items-start justify-between gap-4 flex-wrap">
            
            <div class="flex flex-col gap-1">
              <button v-if="isMobile" @click="mobileTab = 'list'" class="flex items-center gap-1.5 text-[11px] font-black text-accent uppercase tracking-widest mb-1 hover:opacity-70 transition-opacity w-fit">
                <span>←</span> 市场列表
              </button>
              <div class="flex items-center gap-2">
                <p class="text-[11px] font-black opacity-30 uppercase tracking-[0.2em]">{{ selectedStock.symbol }}</p>
                <!-- Binance Link Icon -->
                <a :href="`https://www.binance.com/en/trade/${selectedStock.symbol}?type=spot`" target="_blank" class="opacity-20 hover:opacity-100 transition-opacity">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M11 2.21l-8 4.6v9.18l8 4.6 8-4.6V6.81l-8-4.6zm6.8 13.06l-6.8 3.91-6.8-3.91V7.74l6.8-3.91 6.8 3.91v7.53zm-6.8-7.9l4.53 2.6v5.21l-4.53 2.6-4.53-2.6V9.97l4.53-2.6zm3.33 3.3L11 9.38l-3.33 1.91v3.83L11 17l3.33-1.92v-3.8z"/></svg>
                </a>
              </div>
              <h1 class="text-2xl font-black tracking-tight">{{ selectedStock.displayName }}</h1>
            </div>

            <div class="text-right">
              <div v-if="selectedStock.loading && selectedStock.price === 0" class="text-3xl font-black opacity-20 animate-pulse">Wait...</div>
              <template v-else-if="!selectedStock.error">
                <!-- Blinking Main Price -->
                <div 
                  class="text-4xl font-black font-mono tabular-nums transition-colors duration-150 inline-block rounded-md px-2 -mr-2"
                  :class="[
                    selectedStock.wsBlinking === 'up' ? 'bg-emerald-500 text-white' : 
                    selectedStock.wsBlinking === 'down' ? 'bg-red-500 text-white' : 
                    (isUp(selectedStock) ? 'text-emerald-500' : 'text-red-500')
                  ]"
                >
                  {{ fmt(selectedStock.price) }}
                </div>
                <!-- 24h Change Stats -->
                <div class="flex items-center justify-end gap-2 mt-1">
                  <span class="px-2.5 py-1 rounded-md text-sm font-black transition-colors" :class="isUp(selectedStock) ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'">
                    {{ isUp(selectedStock) ? '+' : '' }}{{ fmt(selectedStock.change) }}
                    ({{ isUp(selectedStock) ? '+' : '' }}{{ fmt(selectedStock.changePercent) }}%)
                  </span>
                  
                  <!-- Connections Status Indicator -->
                  <div class="p-1.5 rounded-full transition-all flex items-center justify-center opacity-40">
                    <Wifi v-if="wsStatus === 'connected'" :size="16" class="text-emerald-500" />
                    <WifiOff v-else :size="16" class="text-red-500 animate-pulse" />
                  </div>
                </div>
              </template>
              <div v-else class="text-red-400 text-sm font-black">无法连接币安接口</div>
            </div>
          </div>

          <!-- Range Selector -->
          <div class="flex gap-1.5 mt-4">
            <button
              v-for="r in RANGES"
              :key="r.value"
              @click="changeRange(r)"
              :class="[
                'px-3 py-1 rounded-full text-xs font-black transition-all uppercase tracking-widest',
                selectedRange.value === r.value
                  ? 'bg-accent text-white shadow-md shadow-accent/20'
                  : 'opacity-30 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
              ]"
            >{{ r.label }}</button>
          </div>
        </div>

        <!-- Chart + Metrics Scroll Area -->
        <div class="flex-1 overflow-y-auto no-scrollbar relative flex flex-col">
          <!-- SVG Price Chart -->
          <div class="px-6 pt-6 shrink-0">
            <div class="relative rounded-[var(--fly-radius-md)] bg-[var(--fly-bg-glass)] border border-[var(--fly-border-glass)] overflow-hidden" style="height: 240px;">
              <div v-if="selectedStock.loading" class="absolute inset-0 flex items-center justify-center opacity-20">
                <Activity class="animate-spin" :size="32" />
              </div>
              <div v-else-if="selectedStock.prices.length < 2" class="absolute inset-0 flex items-center justify-center opacity-20">
                <BarChart2 :size="48" stroke-width="1" />
              </div>
              <svg v-else class="w-full h-full" preserveAspectRatio="none" viewBox="0 0 600 200">
                <defs>
                  <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   :stop-color="isUp(selectedStock) ? '#10b981' : '#ef4444'" stop-opacity="0.3"/>
                    <stop offset="100%" :stop-color="isUp(selectedStock) ? '#10b981' : '#ef4444'" stop-opacity="0.0"/>
                  </linearGradient>
                </defs>
                <path :d="sparkPath(selectedStock.prices, 600, 180).area" fill="url(#chart-area-grad)" />
                <path
                  :d="sparkPath(selectedStock.prices, 600, 180).line"
                  :stroke="isUp(selectedStock) ? '#10b981' : '#ef4444'"
                  stroke-width="2.5"
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <!-- Current Price live indicator dot -->
                <circle
                  v-if="selectedStock.prices.length"
                  :cx="600"
                  :cy="(() => {
                    const ps = selectedStock.prices
                    const lo = Math.min(...ps), hi = Math.max(...ps)
                    return 180 - ((ps.at(-1)! - lo) / (hi - lo || 1)) * 180
                  })()"
                  r="5"
                  :fill="isUp(selectedStock) ? '#10b981' : '#ef4444'"
                  class="animate-pulse shadow-lg"
                />
              </svg>

              <!-- Time labels -->
              <div v-if="selectedStock.timestamps.length > 1" class="absolute bottom-2 left-4 right-4 flex justify-between text-[10px] font-black opacity-30 uppercase">
                <span>{{ fmtTs(selectedStock.timestamps[0]) }}</span>
                <span>{{ fmtTs(selectedStock.timestamps.at(-1) ?? 0) }}</span>
              </div>
            </div>
          </div>

          <!-- Key Metrics Grid -->
          <div class="p-6 pb-8 grid grid-cols-2 @lg:grid-cols-4 gap-px bg-[var(--fly-border-system)]/20 mt-6 border-t border-[var(--fly-border-system)]/20">
            <template v-if="!selectedStock.error">
              <div v-for="metric in [
                { label: '24小时最高', val: fmt(selectedStock.dayHigh) },
                { label: '24小时最低', val: fmt(selectedStock.dayLow) },
                { label: '24小时成交量', val: fmtCurrency(selectedStock.volume) },
                { label: '24小时成交额 (USDT)', val: fmtCurrency(selectedStock.quoteVolume) },
              ]" :key="metric.label"
                class="bg-[var(--fly-bg-secondary)] px-4 py-4"
              >
                <p class="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">{{ metric.label }}</p>
                <p class="text-[15px] font-black font-mono tabular-nums truncate text-ellipsis">{{ metric.val }}</p>
              </div>
            </template>
          </div>

        </div>
      </template>

      <div v-else class="flex-1 flex items-center justify-center opacity-10 flex-col gap-4">
        <Activity :size="64" stroke-width="1.5" />
        <p class="text-xs font-black uppercase tracking-widest">请在左侧选择加密货币</p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
</style>
