<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Plus, RefreshCcw, X, BarChart2, Activity } from 'lucide-vue-next'

// ─── Types ───────────────────────────────────────────────────────────────────
interface StockData {
  symbol: string
  displayName: string
  price: number
  previousClose: number
  open: number
  dayHigh: number
  dayLow: number
  volume: number
  week52High: number
  week52Low: number
  marketCap?: number
  trailingPE?: number
  change: number
  changePercent: number
  prices: number[]
  timestamps: number[]
  currency: string
  loading: boolean
  error: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────
const RANGES = [
  { label: '1日', value: '1d',  interval: '2m'  },
  { label: '5日', value: '5d',  interval: '15m' },
  { label: '1月', value: '1mo', interval: '1d'  },
  { label: '6月', value: '6mo', interval: '1wk' },
  { label: '1年', value: '1y',  interval: '1mo' },
]

const DEFAULT_WATCHLIST = [
  { symbol: '000001.SS', name: '上证指数' },
  { symbol: '399001.SZ', name: '深成指'  },
  { symbol: 'AAPL',      name: 'Apple'   },
  { symbol: 'NVDA',      name: 'Nvidia'  },
  { symbol: 'TSLA',      name: 'Tesla'   },
  { symbol: 'MSFT',      name: 'Microsoft' },
  { symbol: 'AMZN',      name: 'Amazon'  },
]

// ─── State ────────────────────────────────────────────────────────────────────
const containerRef   = ref<HTMLElement | null>(null)
const containerWidth = ref(800)
const isMobile  = computed(() => containerWidth.value < 600)
const mobileTab = ref<'list' | 'detail'>('list')

const watchlist     = ref<StockData[]>([])
const selectedSymbol = ref('000001.SS')
const selectedRange  = ref(RANGES[0])

const searchQuery = ref('')
const isSearching = ref(false)
const searchLoading = ref(false)

const selectedStock = computed(() =>
  watchlist.value.find(s => s.symbol === selectedSymbol.value) ?? null
)

// ─── API ──────────────────────────────────────────────────────────────────────
async function fetchStockData(symbol: string, range: string, interval: string): Promise<Partial<StockData>> {
  // 依次尝试 query1 / query2 两个 Yahoo Finance 子域
  const urls = [
    `/api/yahoo-finance/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}&includePrePost=false&events=div%2Csplit`,
    `/api/yahoo-finance2/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}&includePrePost=false`,
  ]

  let json: any = null
  for (const url of urls) {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
    })
    if (res.ok) { json = await res.json(); break }
  }
  if (!json) throw new Error('所有数据源均不可用，请稍后重试')

  const result = json?.chart?.result?.[0]
  if (!result) {
    const errMsg = json?.chart?.error?.description ?? '数据格式异常'
    throw new Error(errMsg)
  }

  const meta   = result.meta
  const closes: (number | null)[] = result.indicators?.quote?.[0]?.close ?? []
  const tsList: number[]          = result.timestamp ?? []

  // 过滤掉空值（非交易时段产生的 null）
  const prices: number[] = []
  const timestamps: number[] = []
  closes.forEach((c, i) => {
    if (c != null && c > 0) { prices.push(c); timestamps.push(tsList[i] ?? 0) }
  })

  // 如果 intraday 价格序列为空，用 meta 字段补一个数据点
  const price = meta.regularMarketPrice ?? (prices.length ? prices[prices.length - 1] : 0)
  if (prices.length === 0 && price > 0) prices.push(price)

  const prev  = meta.chartPreviousClose ?? meta.previousClose ?? price

  return {
    price,
    previousClose: prev,
    open:     meta.regularMarketOpen    ?? prices[0] ?? price,
    dayHigh:  meta.regularMarketDayHigh ?? (prices.length ? Math.max(...prices) : price),
    dayLow:   meta.regularMarketDayLow  ?? (prices.length ? Math.min(...prices) : price),
    volume:   meta.regularMarketVolume  ?? 0,
    week52High: meta.fiftyTwoWeekHigh   ?? price,
    week52Low:  meta.fiftyTwoWeekLow    ?? price,
    marketCap:  meta.marketCap,
    trailingPE: meta.trailingPE,
    change:        +(price - prev).toFixed(4),
    changePercent: prev > 0 ? +((price - prev) / prev * 100).toFixed(4) : 0,
    prices,
    timestamps,
    currency: meta.currency ?? 'USD',
  }
}

async function loadStock(symbol: string, name: string) {
  let stock = watchlist.value.find(s => s.symbol === symbol)
  if (!stock) {
    const newStock: StockData = {
      symbol, displayName: name,
      price: 0, previousClose: 0, open: 0, dayHigh: 0, dayLow: 0,
      volume: 0, week52High: 0, week52Low: 0,
      change: 0, changePercent: 0,
      prices: [], timestamps: [],
      currency: 'USD', loading: true, error: false,
    }
    watchlist.value.push(newStock)
    stock = watchlist.value[watchlist.value.length - 1]
  }
  if (!stock) return
  stock.loading = true
  stock.error   = false
  try {
    const r = selectedRange.value;
    const data = await fetchStockData(symbol, r?.value || '1d', r?.interval || '1h')
    Object.assign(stock, data, { loading: false })
  } catch (e) {
    console.error(`[Stocks] ${symbol}:`, e)
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
    const data = await fetchStockData(s.symbol, range.value, range.interval)
    Object.assign(s, data, { loading: false })
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
  if (selectedSymbol.value === symbol && watchlist.value.length > 0) {
    const first = watchlist.value[0];
    if (first) selectedSymbol.value = first.symbol;
  }
}

async function addStock() {
  const sym = searchQuery.value.trim().toUpperCase()
  searchQuery.value = ''
  isSearching.value = false
  if (!sym || watchlist.value.some(s => s.symbol === sym)) return
  await loadStock(sym, sym)
  selectedSymbol.value = sym
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

// Mini sparkline for list items (smaller)
function miniSpark(prices: number[]) {
  return sparkPath(prices, 64, 28)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const isUp = (s: StockData) => s.change >= 0

function fmt(v: number, d = 2) { return (v ?? 0).toFixed(d) }

function fmtVol(v: number) {
  if (v >= 1e8) return (v / 1e8).toFixed(2) + '亿'
  if (v >= 1e4) return (v / 1e4).toFixed(0) + '万'
  return v.toLocaleString()
}

function fmtMkCap(v?: number) {
  if (!v) return '--'
  if (v >= 1e12) return (v / 1e12).toFixed(2) + 'T'
  if (v >= 1e9)  return (v / 1e9).toFixed(2)  + 'B'
  return (v / 1e6).toFixed(0) + 'M'
}

function fmtTs(ts: number) {
  const d = new Date(ts * 1000)
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

// ─── Resize Observer ──────────────────────────────────────────────────────────
let ro: ResizeObserver | null = null
onMounted(() => {
  if (containerRef.value) {
    ro = new ResizeObserver((entries) => {
      const e = entries[0];
      if (e) containerWidth.value = e.contentRect.width;
    });
    ro.observe(containerRef.value)
    containerWidth.value = containerRef.value.offsetWidth
  }
  DEFAULT_WATCHLIST.forEach(({ symbol, name }) => loadStock(symbol, name))
})
onUnmounted(() => ro?.disconnect())
</script>

<template>
  <div ref="containerRef" class="stocks-app @container h-full w-full flex bg-[var(--fly-bg-primary)] text-[var(--fly-text-primary)] font-sans overflow-hidden relative select-none">

    <!-- ══════════════════ SIDEBAR ══════════════════ -->
    <aside
      class="flex flex-col border-r border-[var(--fly-border-system)] bg-[var(--fly-bg-secondary)] shrink-0 z-10 overflow-hidden"
      :class="isMobile ? (mobileTab === 'list' ? 'w-full' : 'hidden') : 'w-72'"
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
            placeholder="输入代码，如 AAPL / 600519.SS"
            class="flex-1 text-xs font-bold bg-[var(--fly-bg-primary)] border border-[var(--fly-border-system)] rounded-[var(--fly-radius-sm)] px-3 py-2 outline-none focus:ring-2 focus:ring-accent/20 placeholder:opacity-30"
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
          <h2 class="text-sm font-black uppercase tracking-widest opacity-50">自选股</h2>
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
              <span v-if="!stock.loading && !stock.error" class="text-[13px] font-mono font-black tabular-nums ml-2 shrink-0" :class="isUp(stock) ? 'text-emerald-500' : 'text-red-500'">
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
            <svg width="64" height="28" viewBox="0 0 64 28">
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

          <!-- Remove -->
          <button
            @click.stop="removeStock(stock.symbol)"
            class="shrink-0 opacity-0 group-hover:opacity-30 hover:!opacity-100 p-0.5 rounded transition-all text-red-500"
          >
            <X :size="12" />
          </button>
        </div>

        <div v-if="watchlist.length === 0" class="py-16 text-center opacity-20 text-xs font-black uppercase tracking-widest">
          暂无自选股
        </div>
      </div>
    </aside>

    <!-- ══════════════════ MAIN CONTENT ══════════════════ -->
    <main
      class="flex-1 flex flex-col overflow-hidden"
      :class="isMobile && mobileTab === 'list' ? 'hidden' : ''"
    >

      <template v-if="selectedStock">
        <!-- Price Header -->
        <div class="px-6 pt-6 pb-4 border-b border-[var(--fly-border-system)] bg-[var(--fly-bg-glass)] backdrop-blur-xl">
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <!-- Left: back (mobile) + name -->
          <div class="flex flex-col gap-1">
            <button v-if="isMobile" @click="mobileTab = 'list'" class="flex items-center gap-1.5 text-[11px] font-black text-accent uppercase tracking-widest mb-1 hover:opacity-70 transition-opacity w-fit">
              <span>←</span> 返回列表
            </button>
            <p class="text-[11px] font-black opacity-30 uppercase tracking-[0.2em]">{{ selectedStock.symbol }}</p>
            <h1 class="text-2xl font-black tracking-tight">{{ selectedStock.displayName }}</h1>
          </div>
            <div class="text-right">
              <div v-if="selectedStock.loading" class="text-3xl font-black opacity-20 animate-pulse">Loading...</div>
              <template v-else-if="!selectedStock.error">
                <div class="text-4xl font-black font-mono tabular-nums" :class="isUp(selectedStock) ? 'text-emerald-500' : 'text-red-500'">
                  {{ fmt(selectedStock.price) }}
                  <span class="text-base ml-1 opacity-60">{{ selectedStock.currency }}</span>
                </div>
                <div class="flex items-center justify-end gap-2 mt-1">
                  <span class="px-2.5 py-1 rounded-md text-sm font-black" :class="isUp(selectedStock) ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'">
                    {{ isUp(selectedStock) ? '+' : '' }}{{ fmt(selectedStock.change) }}
                    ({{ isUp(selectedStock) ? '+' : '' }}{{ fmt(selectedStock.changePercent) }}%)
                  </span>
                  <button @click="loadStock(selectedStock.symbol, selectedStock.displayName)" class="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-all active:rotate-180 duration-500">
                    <RefreshCcw :size="16" class="opacity-40" />
                  </button>
                </div>
              </template>
              <div v-else class="text-red-400 text-sm font-black">数据获取失败</div>
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
                selectedRange?.value === r.value
                  ? 'bg-accent text-white shadow-md shadow-accent/20'
                  : 'opacity-30 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
              ]"
            >{{ r.label }}</button>
          </div>
        </div>

        <!-- Chart + Metrics scroll area -->
        <div class="flex-1 overflow-y-auto no-scrollbar">
          <!-- SVG Price Chart -->
          <div class="px-6 pt-6">
            <div class="relative rounded-[var(--fly-radius-md)] bg-[var(--fly-bg-glass)] border border-[var(--fly-border-glass)] overflow-hidden" style="height: 200px;">
              <div v-if="selectedStock.loading" class="absolute inset-0 flex items-center justify-center opacity-20">
                <RefreshCcw class="animate-spin" :size="32" />
              </div>
              <div v-else-if="selectedStock.prices.length < 2" class="absolute inset-0 flex items-center justify-center opacity-20">
                <BarChart2 :size="48" stroke-width="1" />
              </div>
              <svg v-else class="w-full h-full" preserveAspectRatio="none" viewBox="0 0 600 180">
                <defs>
                  <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   :stop-color="isUp(selectedStock) ? '#10b981' : '#ef4444'" stop-opacity="0.25"/>
                    <stop offset="100%" :stop-color="isUp(selectedStock) ? '#10b981' : '#ef4444'" stop-opacity="0"/>
                  </linearGradient>
                </defs>
                <path :d="sparkPath(selectedStock.prices, 600, 160).area" fill="url(#chart-area-grad)" />
                <path
                  :d="sparkPath(selectedStock.prices, 600, 160).line"
                  :stroke="isUp(selectedStock) ? '#10b981' : '#ef4444'"
                  stroke-width="2"
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <!-- Latest price dot -->
                <circle
                  v-if="selectedStock.prices.length"
                  :cx="600"
                  :cy="(() => {
                    const ps = selectedStock.prices;
                    const lo = Math.min(...ps), hi = Math.max(...ps);
                    const last = ps[ps.length - 1];
                    if (last === undefined) return 0;
                    return 160 - ((last - lo) / (hi - lo || 1)) * 160
                  })()"
                  r="4"
                  :fill="isUp(selectedStock) ? '#10b981' : '#ef4444'"
                />
              </svg>

              <!-- Time labels -->
              <div v-if="selectedStock.timestamps.length > 1" class="absolute bottom-2 left-4 right-4 flex justify-between text-[9px] font-black opacity-30 uppercase">
                <span>{{ fmtTs(selectedStock.timestamps[0] ?? 0) }}</span>
                <span>{{ fmtTs(selectedStock.timestamps[selectedStock.timestamps.length - 1] ?? 0) }}</span>
              </div>
            </div>
          </div>

          <!-- Key Metrics Grid -->
          <div class="px-6 py-6 grid grid-cols-2 @lg:grid-cols-3 gap-px bg-[var(--fly-border-system)]/20">
            <template v-if="!selectedStock.error">
              <div v-for="metric in [
                { label: '开盘价',    val: fmt(selectedStock.open) },
                { label: '最高价',    val: fmt(selectedStock.dayHigh) },
                { label: '最低价',    val: fmt(selectedStock.dayLow) },
                { label: '成交量',    val: fmtVol(selectedStock.volume) },
                { label: '52周最高', val: fmt(selectedStock.week52High) },
                { label: '52周最低', val: fmt(selectedStock.week52Low) },
                { label: '市值',      val: fmtMkCap(selectedStock.marketCap) },
                { label: 'P/E (TTM)', val: selectedStock.trailingPE ? fmt(selectedStock.trailingPE, 1) : '--' },
                { label: '前收盘',    val: fmt(selectedStock.previousClose) },
              ]" :key="metric.label"
                class="bg-[var(--fly-bg-secondary)] px-4 py-4"
              >
                <p class="text-[10px] font-black opacity-30 uppercase tracking-widest mb-1">{{ metric.label }}</p>
                <p class="text-sm font-black font-mono tabular-nums">{{ metric.val }}</p>
              </div>
            </template>
          </div>

          <!-- Disclaimer -->
          <p class="px-6 py-4 text-[10px] opacity-20 font-bold italic">
            行情数据来源：Yahoo Finance，延迟约 15 分钟，仅供参考，不构成投资建议。
          </p>
        </div>
      </template>

      <div v-else class="flex-1 flex items-center justify-center opacity-10 flex-col gap-4">
        <BarChart2 :size="64" stroke-width="0.5" />
        <p class="text-xs font-black uppercase tracking-widest">选择股票查看行情</p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
</style>
