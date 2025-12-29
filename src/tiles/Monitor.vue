<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';

const container = ref(null);
const width = ref(0);
const height = ref(0);

// 模拟系统数据
const cpu = ref(24);
const mem = ref(42);
const temp = ref(38);
const disk = ref(65);
const history = ref(Array(20).fill(30));

// 尺寸类型判断
const sizeType = computed(() => {
  const w = width.value;
  const h = height.value;
  if (w < 140 || h < 140) return 'small'; // 1x1
  if (w > 280 && h < 180) return 'wide';  // 2x1
  return 'large'; // 2x2 或更大
});

// 数据更新循环
let timer;
const updateStats = () => {
  // 模拟数值波动
  cpu.value = Math.min(100, Math.max(5, cpu.value + (Math.random() * 10 - 5)));
  mem.value = Math.min(100, Math.max(5, mem.value + (Math.random() * 4 - 2)));
  temp.value = Math.min(90, Math.max(30, temp.value + (Math.random() * 2 - 1)));

  const nextHistory = [...history.value, cpu.value];
  if (nextHistory.length > 20) {
    nextHistory.shift();
  }
  history.value = nextHistory;
};

// 监听尺寸变化
let resizeObserver;
onMounted(() => {
  updateStats();
  timer = setInterval(updateStats, 1500);

  resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      width.value = entry.contentRect.width;
      height.value = entry.contentRect.height;
    }
  });

  if (container.value) {
    resizeObserver.observe(container.value);
  }
});

onUnmounted(() => {
  clearInterval(timer);
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});

// 计算 SVG 路径
const chartPath = computed(() => {
  if (history.value.length < 2) return '';
  const w = width.value || 200;
  const h = 40; // 绘图区域高度
  const points = history.value.map((v, i) => {
    const x = (i / (history.value.length - 1)) * w;
    const y = h - (v / 100) * h;
    return `${x},${y}`;
  });
  return `M ${points.join(' L ')}`;
});
</script>

<template>
  <div
    ref="container"
    class="relative w-full h-full overflow-hidden transition-all duration-500 text-white font-sans "
    :class="{
      'p-3': sizeType === 'small',
      'p-5': sizeType !== 'small'
    }"
  >
    <!-- 背景装饰光晕 -->

    <!-- 1. 小型磁贴模式 (1x1) -->
    <div v-if="sizeType === 'small'" class="h-full flex flex-col justify-between items-center text-center">
      <div class="text-[10px] font-bold opacity-40 uppercase tracking-widest">CPU</div>
      <div class="text-3xl font-black tabular-nums tracking-tighter leading-none text-blue-400">
        {{ Math.round(cpu) }}<span class="text-xs opacity-40 ml-0.5">%</span>
      </div>
      <div class="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div class="h-full bg-blue-500 transition-all duration-700" :style="{ width: cpu + '%' }"></div>
      </div>
    </div>

    <!-- 2. 宽型磁贴模式 (2x1) -->
    <div v-else-if="sizeType === 'wide'" class="h-full flex flex-col justify-between">
      <div class="flex justify-between items-start">
        <div>
          <h3 class="text-xs font-bold opacity-50 uppercase flex items-center gap-1.5 mb-1">
            <svg class="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            系统状态
          </h3>
          <div class="text-3xl font-black tabular-nums tracking-tight">
            {{ Math.round(cpu) }}<span class="text-sm font-medium opacity-40">%</span>
          </div>
        </div>
        <div class="flex flex-col items-end gap-1">
          <div class="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 text-[10px] font-mono border border-blue-500/20">
            MEM: {{ Math.round(mem) }}%
          </div>
          <div class="px-2 py-0.5 rounded bg-orange-500/10 text-orange-300 text-[10px] font-mono border border-orange-500/20">
            TMP: {{ Math.round(temp) }}°C
          </div>
        </div>
      </div>
      <!-- 底部波形 -->
      <div class="h-10 w-full mt-2">
        <svg class="w-full h-full overflow-visible" preserveAspectRatio="none">
          <path :d="chartPath" fill="none" stroke="url(#lineGrad)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="rgba(59, 130, 246, 0)" />
              <stop offset="100%" stop-color="rgba(59, 130, 246, 1)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>

    <!-- 3. 大型磁贴模式 (2x2) -->
    <div v-else class="h-full flex flex-col">
      <div class="flex justify-between items-center mb-5 shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shadow-inner">
            <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <div>
            <h2 class="text-sm font-bold leading-none mb-1">核心管理器</h2>
            <p class="text-[10px] opacity-30 font-mono tracking-tight">KERNEL 6.2.x-STABLE</p>
          </div>
        </div>
        <div class="animate-pulse flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-black border border-emerald-500/20">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          LIVE
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 flex-1 overflow-hidden">
        <!-- 进度条组 -->
        <div class="flex flex-col justify-around py-1">
          <div class="space-y-1.5">
            <div class="flex justify-between text-[10px] font-bold uppercase tracking-tighter opacity-40">
              <span>处理器</span>
              <span class="text-blue-400">{{ Math.round(cpu) }}%</span>
            </div>
            <div class="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div class="h-full bg-blue-500 rounded-full transition-all duration-700" :style="{ width: cpu + '%' }"></div>
            </div>
          </div>
          <div class="space-y-1.5">
            <div class="flex justify-between text-[10px] font-bold uppercase tracking-tighter opacity-40">
              <span>内存</span>
              <span class="text-purple-400">{{ Math.round(mem) }}%</span>
            </div>
            <div class="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div class="h-full bg-purple-500 rounded-full transition-all duration-700" :style="{ width: mem + '%' }"></div>
            </div>
          </div>
          <div class="space-y-1.5">
            <div class="flex justify-between text-[10px] font-bold uppercase tracking-tighter opacity-40">
              <span>存储</span>
              <span class="text-orange-400">{{ disk }}%</span>
            </div>
            <div class="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div class="h-full bg-orange-500 rounded-full transition-all duration-700" :style="{ width: disk + '%' }"></div>
            </div>
          </div>
        </div>

        <!-- 温度计卡片 -->
        <div class="bg-gradient-to-br from-white/5 to-transparent rounded-2xl p-4 flex flex-col justify-center items-center border border-white/5 shadow-inner">
          <div class="text-[10px] font-bold opacity-30 mb-1 tracking-widest uppercase">核心温度</div>
          <div class="text-4xl font-black text-white leading-none tracking-tighter">
            {{ Math.round(temp) }}<span class="text-xl text-blue-400">°</span>
          </div>
          <div class="text-[9px] text-emerald-400 font-bold mt-2 px-2 py-0.5 bg-emerald-500/5 rounded">OPTIMAL</div>
        </div>
      </div>

      <!-- 底部详细曲线 -->
      <div class="mt-5 h-12 w-full shrink-0">
        <svg class="w-full h-full opacity-50" preserveAspectRatio="none">
          <path :d="chartPath" fill="none" stroke="rgba(59, 130, 246, 0.4)" stroke-width="2" stroke-dasharray="4 2" />
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 禁止文字选中 */
.monitor-root {
  user-select: none;
}

/* 性能优化的平滑过渡 */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
