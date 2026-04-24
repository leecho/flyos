<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, reactive } from 'vue';
import { BarChart2, Activity } from 'lucide-vue-next';
import { calculateBB, calculateMACD, calculateRSI } from '../../utils/technicalAnalysis';

export interface KlineData {
  t: number; o: number; h: number; l: number; c: number; v: number;
}

const props = defineProps<{
  klines: KlineData[];
  loading: boolean;
  type: 'line' | 'candle';
}>();

const isUp = computed(() => {
  if (!props.klines || props.klines.length < 2) return true;
  return props.klines[props.klines.length - 1].c >= props.klines[0].c;
});

const wrapperRef = ref<HTMLElement | null>(null);
const hoverX = ref<number | null>(null);
const hoverY = ref<number | null>(null);
const containerW = ref(600);

// Use static heights for SVG rendering math, actual DOM flex box handles rendering size. SVG scales.
const SVG_W = 1000;
const MAIN_H = 400; 
const OSC_H = 150;

let ro: ResizeObserver | null = null;
onMounted(() => {
  if (wrapperRef.value) {
    ro = new ResizeObserver(([e]) => {
      containerW.value = e.contentRect.width;
    });
    ro.observe(wrapperRef.value);
    containerW.value = wrapperRef.value.offsetWidth;
  }
});
onUnmounted(() => { ro?.disconnect(); });

function handleMouseMove(e: MouseEvent) {
  if (!wrapperRef.value) return;
  const rect = wrapperRef.value.getBoundingClientRect();
  hoverX.value = e.clientX - rect.left;
  hoverY.value = e.clientY - rect.top;
}

function handleMouseLeave() {
  hoverX.value = null;
  hoverY.value = null;
}

// Global active element
const activeHoverIndex = computed(() => {
  if (hoverX.value === null || props.klines.length === 0) return null;
  // mapping hoverX over containerW to index
  const rawIdx = Math.floor((hoverX.value / containerW.value) * props.klines.length);
  return Math.max(0, Math.min(props.klines.length - 1, rawIdx));
});

const activeHoverCandle = computed(() => {
  if (activeHoverIndex.value === null) return null;
  return props.klines[activeHoverIndex.value];
});

// Indicators Toggle
const indicators = reactive({
  bb: false,
  macd: false,
  rsi: false
});

// MATH ENGINES
const pricesArray = computed(() => props.klines.map(k => k.c));

const bbMath = computed(() => {
  if (!indicators.bb) return null;
  return calculateBB(pricesArray.value, 20, 2);
});

const macdMath = computed(() => {
  if (!indicators.macd) return null;
  return calculateMACD(pricesArray.value, 12, 26, 9);
});

const rsiMath = computed(() => {
  if (!indicators.rsi) return null;
  return calculateRSI(pricesArray.value, 14);
});

// MAIN SVG MATH
const mainYScale = computed(() => {
  const klines = props.klines;
  if (!klines.length) return { min: 0, max: 1, rng: 1 };
  let minL = Math.min(...klines.map(k => k.l));
  let maxH = Math.max(...klines.map(k => k.h));
  
  if (indicators.bb && bbMath.value) {
    const bbUp = bbMath.value.upper.filter(x => x!==null) as number[];
    const bbDn = bbMath.value.lower.filter(x => x!==null) as number[];
    if (bbUp.length) maxH = Math.max(maxH, ...bbUp);
    if (bbDn.length) minL = Math.min(minL, ...bbDn);
  }
  return { min: minL, max: maxH, rng: maxH - minL || 1 };
});

const candles = computed(() => {
  if (props.klines.length < 1) return [];
  const { min, rng } = mainYScale.value;
  const candleH = MAIN_H * 0.8; // Top 80% for prices
  const widthPerCandle = Math.max(1, (SVG_W / props.klines.length) - 2);
  
  return props.klines.map((k, i) => {
    const cx = (i / Math.max(1, props.klines.length - 1)) * SVG_W;
    const yO = candleH - ((k.o - min) / rng) * candleH;
    const yC = candleH - ((k.c - min) / rng) * candleH;
    const yH = candleH - ((k.h - min) / rng) * candleH;
    const yL = candleH - ((k.l - min) / rng) * candleH;
    
    return {
      cx, rx: cx - widthPerCandle / 2, rw: widthPerCandle,
      yMax: Math.max(yO, yC), yMin: Math.min(yO, yC),
      hBase: Math.abs(yO - yC) < 1 ? 1 : Math.abs(yO - yC),
      yH, yL, isGreen: k.c >= k.o
    };
  });
});

const volumes = computed(() => {
  if (props.klines.length < 1) return [];
  const volH = MAIN_H * 0.2; // Bottom 20%
  const volYOffset = MAIN_H - volH;
  const maxV = Math.max(...props.klines.map(k => k.v));
  const rngV = maxV || 1;
  const widthPerCandle = Math.max(1, (SVG_W / props.klines.length) - 2);
  return props.klines.map((k, i) => {
    const cx = (i / Math.max(1, props.klines.length - 1)) * SVG_W;
    const hBase = (k.v / rngV) * volH;
    return { rx: cx - widthPerCandle / 2, rw: widthPerCandle, yMin: volYOffset + (volH - hBase), hBase, isGreen: k.c >= k.o };
  });
});

const ma7Path = computed(() => {
  if (props.klines.length < 7) return '';
  const { min, rng } = mainYScale.value;
  const candleH = MAIN_H * 0.8;
  const pts: string[] = [];
  for (let i = 6; i < props.klines.length; i++) {
    const sum = props.klines.slice(i - 6, i + 1).reduce((acc, k) => acc + k.c, 0);
    const avg = sum / 7;
    const cx = (i / Math.max(1, props.klines.length - 1)) * SVG_W;
    const cy = candleH - ((avg - min) / rng) * candleH;
    pts.push(`${cx.toFixed(1)},${cy.toFixed(1)}`);
  }
  return `M${pts.join('L')}`;
});

function linePath(arr: (number|null)[], color: string, isDashed=false): { path: string, style: object } {
  if (!arr || !arr.length) return { path: '', style: {} };
  const { min, rng } = mainYScale.value;
  const candleH = MAIN_H * 0.8;
  const pts: string[] = [];
  arr.forEach((v, i) => {
    if (v === null) return;
    const cx = (i / Math.max(1, arr.length - 1)) * SVG_W;
    const cy = candleH - ((v - min) / rng) * candleH;
    pts.push(`${pts.length===0?'M':'L'}${cx.toFixed(1)},${cy.toFixed(1)}`);
  });
  return { path: pts.join(''), style: isDashed ? { stroke: color, strokeWidth: '1.5', fill: 'none', strokeDasharray: '4 4' } : { stroke: color, strokeWidth: '1', fill: 'none' } };
}

// BB Visualization
const bbLines = computed(() => {
  if (!indicators.bb || !bbMath.value) return [];
  return [
    linePath(bbMath.value.upper, '#8b5cf6', false),
    linePath(bbMath.value.middle, '#f59e0b', true),
    linePath(bbMath.value.lower, '#8b5cf6', false)
  ];
});

const bbCloud = computed(() => {
   if (!indicators.bb || !bbMath.value) return '';
   const { min, rng } = mainYScale.value;
   const candleH = MAIN_H * 0.8;
   const upperPts: string[] = [];
   const lowerPts: string[] = [];
   const len = props.klines.length;
   
   for(let i=0; i<len; i++){
      const up = bbMath.value.upper[i];
      const dn = bbMath.value.lower[i];
      if (up !== null && dn !== null) {
         const cx = (i / Math.max(1, len - 1)) * SVG_W;
         const yUp = candleH - ((up - min) / rng) * candleH;
         const yDn = candleH - ((dn - min) / rng) * candleH;
         upperPts.push(`${cx.toFixed(1)},${yUp.toFixed(1)}`);
         lowerPts.unshift(`${cx.toFixed(1)},${yDn.toFixed(1)}`); // reverse for polygon
      }
   }
   if (upperPts.length === 0) return '';
   return `M${upperPts.join('L')} L${lowerPts.join('L')} Z`;
});

// SPARKLINE
const sparkPath = computed(() => {
  if (props.klines.length < 2) return { line: '', area: '' };
  const { min, rng } = mainYScale.value;
  const H = MAIN_H * 0.8;
  const prices = props.klines.map(k=>k.c);
  const pts = prices.map((p, i) => {
    const x = ((i / (prices.length - 1)) * SVG_W).toFixed(1);
    const y = (H - ((p - min) / rng) * H).toFixed(1);
    return `${x},${y}`;
  });
  return { line: `M${pts.join('L')}`, area: `M${pts.join('L')}L${SVG_W},${H}L0,${H}Z` };
});
const currentY = computed(() => {
  if (props.klines.length < 1) return MAIN_H * 0.8;
  return MAIN_H * 0.8 - ((props.klines[props.klines.length - 1].c - mainYScale.value.min) / mainYScale.value.rng) * (MAIN_H * 0.8);
});

// OSCILLATOR: MACD
const macdDraw = computed(() => {
  if (!indicators.macd || !macdMath.value) return null;
  const { macd, signal, histogram } = macdMath.value;
  // find min max
  const allVals = [...macd, ...signal, ...histogram].filter(x => x!==null) as number[];
  if (!allVals.length) return null;
  const maxAbs = Math.max(...allVals.map(Math.abs));
  const rng = maxAbs * 2 || 1;
  const min = -maxAbs;
  
  const hW = Math.max(1, (SVG_W / props.klines.length) - 2);
  const histBars = histogram.map((h, i) => {
    if (h === null) return null;
    const cx = (i / Math.max(1, props.klines.length - 1)) * SVG_W;
    const cyZero = OSC_H / 2;
    const cy = OSC_H - ((h - min)/rng) * OSC_H;
    return {
       x: cx - hW/2, w: hW,
       y: Math.min(cy, cyZero), height: Math.abs(cy - cyZero) || 0.5,
       color: h >= 0 ? '#10b981' : '#ef4444'
    };
  }).filter(x => x!==null) as any[];

  const macdStr = macd.map((v, i) => v===null ? '' : `${i===0?'M':'L'}${(i/(props.klines.length-1)*SVG_W).toFixed(1)},${(OSC_H - ((v-min)/rng)*OSC_H).toFixed(1)}`).join('');
  const sigStr =  signal.map((v, i) => v===null ? '' : `${i===0?'M':'L'}${(i/(props.klines.length-1)*SVG_W).toFixed(1)},${(OSC_H - ((v-min)/rng)*OSC_H).toFixed(1)}`).join('');

  return { histBars, macdStr: macdStr.replace(/LM/g, 'M'), sigStr: sigStr.replace(/LM/g, 'M') };
});

// OSCILLATOR: RSI
const rsiDraw = computed(() => {
  if (!indicators.rsi || !rsiMath.value) return null;
  const rsi = rsiMath.value; // fixed 0-100 range
  const str = rsi.map((v, i) => v===null ? '' : `${i===0?'M':'L'}${(i/(props.klines.length-1)*SVG_W).toFixed(1)},${(OSC_H - (v/100)*OSC_H).toFixed(1)}`).join('');
  
  // Levels: 70 and 30
  const y70 = OSC_H - (70/100)*OSC_H;
  const y30 = OSC_H - (30/100)*OSC_H;
  
  return { str: str.replace(/LM/g, 'M'), y70, y30 };
});

function fmtTs(ts: number) {
  const d = new Date(ts * 1000);
  return `${d.getMonth()+1}/${d.getDate()} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
}
</script>

<template>
  <div class="relative rounded-[var(--fly-radius-md)] bg-[var(--fly-bg-glass)] border border-[var(--fly-border-glass)] overflow-hidden w-full h-full flex flex-col group">
    
    <!-- Header Indicator Controls -->
    <div class="absolute left-2 top-2 z-20 flex gap-1 opacity-20 group-hover:opacity-100 transition-opacity flex-wrap w-full pr-12">
      <button @click="indicators.bb = !indicators.bb" class="px-1.5 py-0.5 rounded text-[10px] font-black tracking-widest uppercase transition-all" :class="indicators.bb ? 'bg-purple-600 text-white' : 'bg-[var(--fly-bg-secondary)] border border-[var(--fly-border-system)] opacity-80'">BB (20,2)</button>
      <button @click="indicators.macd = !indicators.macd" class="px-1.5 py-0.5 rounded text-[10px] font-black tracking-widest uppercase transition-all" :class="indicators.macd ? 'bg-blue-600 text-white' : 'bg-[var(--fly-bg-secondary)] border border-[var(--fly-border-system)] opacity-80'">MACD</button>
      <button @click="indicators.rsi = !indicators.rsi" class="px-1.5 py-0.5 rounded text-[10px] font-black tracking-widest uppercase transition-all" :class="indicators.rsi ? 'bg-orange-600 text-white' : 'bg-[var(--fly-bg-secondary)] border border-[var(--fly-border-system)] opacity-80'">RSI (14)</button>
    </div>

    <!-- Active Readout Tooltip -->
    <div v-if="hoverX !== null && activeHoverCandle && activeHoverIndex !== null" class="absolute top-8 left-2 z-20 pointer-events-none flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-mono tracking-widest max-w-[80%] opacity-90 backdrop-blur-md bg-[var(--fly-bg-glass)] border border-[var(--fly-border-system)] rounded px-2 py-1 shadow-md">
       <span class="font-bold text-accent">{{ fmtTs(activeHoverCandle.t) }}</span>
       <span><span class="opacity-40">O:</span><span :class="activeHoverCandle.c >= activeHoverCandle.o ?'text-emerald-500':'text-red-500'">{{ activeHoverCandle.o }}</span></span>
       <span><span class="opacity-40">H:</span><span :class="activeHoverCandle.c >= activeHoverCandle.o ?'text-emerald-500':'text-red-500'">{{ activeHoverCandle.h }}</span></span>
       <span><span class="opacity-40">L:</span><span :class="activeHoverCandle.c >= activeHoverCandle.o ?'text-emerald-500':'text-red-500'">{{ activeHoverCandle.l }}</span></span>
       <span><span class="opacity-40">C:</span><span :class="activeHoverCandle.c >= activeHoverCandle.o ?'text-emerald-500':'text-red-500'">{{ activeHoverCandle.c }}</span></span>
       <span v-if="indicators.macd && macdMath"><span class="opacity-40">MACD:</span><span class="text-blue-500">{{ macdMath.macd[activeHoverIndex]?.toFixed(3) || '-' }}</span></span>
       <span v-if="indicators.rsi && rsiMath"><span class="opacity-40">RSI:</span><span class="text-orange-500">{{ rsiMath[activeHoverIndex]?.toFixed(1) || '-' }}</span></span>
    </div>

    <div v-if="loading" class="absolute inset-0 flex items-center justify-center opacity-20"><Activity class="animate-spin" :size="32" /></div>
    <div v-else-if="klines.length < 2" class="absolute inset-0 flex items-center justify-center opacity-20"><BarChart2 :size="48" stroke-width="1" /></div>
    
    <!-- Multi-Pane Wrapper -->
    <div v-else ref="wrapperRef" class="flex-1 flex flex-col w-full h-full cursor-crosshair overflow-hidden relative" @mousemove="handleMouseMove" @mouseleave="handleMouseLeave">
       
       <!-- 1: MAIN PANE -->
       <div class="flex-1 min-h-0 relative">
          <svg preserveAspectRatio="none" class="w-full h-full block" :viewBox="`0 0 ${SVG_W} ${MAIN_H}`">
            <defs>
              <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   :stop-color="isUp ? '#10b981' : '#ef4444'" stop-opacity="0.3"/>
                <stop offset="100%" :stop-color="isUp ? '#10b981' : '#ef4444'" stop-opacity="0.0"/>
              </linearGradient>
            </defs>
            
            <template v-if="type === 'line'">
              <path v-if="indicators.bb" :d="bbCloud" fill="#8b5cf6" opacity="0.1" />
              <path :d="sparkPath.area" fill="url(#chart-area-grad)" />
              <path :d="sparkPath.line" :stroke="isUp ? '#10b981' : '#ef4444'" stroke-width="2" fill="none" stroke-linejoin="round" />
              <circle :cx="SVG_W" :cy="currentY" r="4" :fill="isUp ? '#10b981' : '#ef4444'" class="animate-pulse shadow-lg" />
              <path v-for="(ln, i) in bbLines" :key="'bb'+i" :d="ln.path" v-bind="ln.style" />
            </template>

            <template v-else-if="type === 'candle'">
              <path v-if="indicators.bb" :d="bbCloud" fill="#8b5cf6" opacity="0.1" />
              <!-- Candlesticks -->
              <g v-for="(c, idx) in candles" :key="idx">
                <line :x1="c.cx" :y1="c.yH" :x2="c.cx" :y2="c.yL" :stroke="c.isGreen ? '#10b981' : '#ef4444'" stroke-width="1" opacity="0.8"/>
                <rect :x="c.rx" :y="c.yMin" :width="Math.max(c.rw, 1)" :height="c.hBase" :fill="c.isGreen ? '#10b981' : '#ef4444'"/>
              </g>
              <!-- Volumes -->
              <g v-for="(v, idx) in volumes" :key="'v'+idx">
                <rect :x="v.rx" :y="v.yMin" :width="Math.max(v.rw, 1)" :height="v.hBase" :fill="v.isGreen ? '#10b981' : '#ef4444'" opacity="0.4"/>
              </g>
              
              <!-- MAs and BB -->
              <path :d="ma7Path" stroke="#f59e0b" stroke-width="2" fill="none" opacity="0.8" />
              <path v-for="(ln, i) in bbLines" :key="'bbc'+i" :d="ln.path" v-bind="ln.style" />
            </template>
          </svg>
       </div>

       <!-- 2: MACD PANE -->
       <div v-if="indicators.macd && macdDraw" class="h-[60px] md:h-[80px] shrink-0 border-t border-[var(--fly-border-system)]/50 relative bg-[var(--fly-bg-primary)]">
          <svg preserveAspectRatio="none" class="w-full h-full block" :viewBox="`0 0 ${SVG_W} ${OSC_H}`">
             <line :x1="0" :y1="OSC_H/2" :x2="SVG_W" :y2="OSC_H/2" stroke="currentColor" opacity="0.1" />
             <rect v-for="(b, i) in macdDraw.histBars" :key="'mh'+i" :x="b.x" :y="b.y" :width="b.w" :height="b.height" :fill="b.color" opacity="0.7"/>
             <path :d="macdDraw.macdStr" stroke="#3b82f6" stroke-width="1.5" fill="none" />
             <path :d="macdDraw.sigStr" stroke="#f59e0b" stroke-width="1.5" fill="none" />
          </svg>
          <span class="absolute left-2 top-0.5 text-[8px] font-black uppercase text-blue-500 opacity-60">MACD(12,26,9)</span>
       </div>

       <!-- 3: RSI PANE -->
       <div v-if="indicators.rsi && rsiDraw" class="h-[50px] shrink-0 border-t border-[var(--fly-border-system)]/50 relative bg-[var(--fly-bg-primary)]">
          <svg preserveAspectRatio="none" class="w-full h-full block" :viewBox="`0 0 ${SVG_W} ${OSC_H}`">
             <rect :x="0" :y="rsiDraw.y70" :width="SVG_W" :height="rsiDraw.y30 - rsiDraw.y70" fill="#f97316" opacity="0.05" />
             <line :x1="0" :y1="rsiDraw.y70" :x2="SVG_W" :y2="rsiDraw.y70" stroke="#f97316" opacity="0.3" stroke-dasharray="8 8" />
             <line :x1="0" :y1="rsiDraw.y30" :x2="SVG_W" :y2="rsiDraw.y30" stroke="#f97316" opacity="0.3" stroke-dasharray="8 8" />
             <path :d="rsiDraw.str" stroke="#ea580c" stroke-width="1.5" fill="none" />
          </svg>
          <span class="absolute left-2 top-0.5 text-[8px] font-black uppercase text-orange-500 opacity-60">RSI(14)</span>
       </div>

       <!-- GLOBAL CSS CROSSHAIR -->
       <div v-if="hoverX !== null" class="absolute top-0 bottom-0 pointer-events-none border-l border-dashed border-[var(--fly-text-primary)] opacity-40 z-30" :style="{ left: `${hoverX}px` }"></div>
    </div>
  </div>
</template>
