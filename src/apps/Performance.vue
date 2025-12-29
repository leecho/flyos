<template>
  <div class="system-monitor flex flex-col h-full text-gray-800 dark:text-gray-200 overflow-hidden font-sans">

    <!-- 顶部状态概览 -->
    <header class="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/50 dark:bg-black/20 backdrop-blur-md border-b border-gray-300 dark:border-white/10">
      <div v-for="stat in mainStats" :key="stat.label" class="flex flex-col">
        <span class="text-xs font-medium opacity-60 uppercase tracking-wider">{{ stat.label }}</span>
        <div class="flex items-end gap-2">
          <span class="text-2xl font-light tracking-tight">{{ stat.value }}{{ stat.unit }}</span>
          <span :class="['text-xs mb-1', stat.trend >= 0 ? 'text-emerald-500' : 'text-rose-500']">
            {{ stat.trend >= 0 ? '↑' : '↓' }}{{ Math.abs(stat.trend) }}%
          </span>
        </div>
        <div class="w-full h-1 bg-gray-200 dark:bg-white/10 rounded-full mt-2 overflow-hidden">
          <div class="h-full bg-blue-500 transition-all duration-500" :style="{ width: stat.value + '%' }"></div>
        </div>
      </div>
    </header>

    <div class="flex-1 flex flex-col md:flex-row overflow-hidden">
      <!-- 左侧实时图表 -->
      <section class="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-8">
        <div>
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-sm font-bold flex items-center gap-2">
              <ActivityIcon class="w-4 h-4 text-blue-500" />
              性能实时曲线 (CPU & RAM)
            </h3>
            <div class="flex gap-4 text-[10px] uppercase opacity-50">
              <span class="flex items-center gap-1"><span class="w-2 h-2 bg-blue-500 rounded-full"></span> CPU</span>
              <span class="flex items-center gap-1"><span class="w-2 h-2 bg-purple-500 rounded-full"></span> 内存</span>
            </div>
          </div>

          <div class="h-40 w-full bg-white dark:bg-black/30 rounded-xl border border-gray-300 dark:border-white/10 relative overflow-hidden p-2">
            <svg viewBox="0 0 100 40" preserveAspectRatio="none" class="w-full h-full">
              <!-- 网格线 -->
              <line v-for="i in 4" :key="i" x1="0" :y1="i * 10" x2="100" :y2="i * 10" stroke="currentColor" stroke-width="0.1" class="opacity-10" />
              <!-- CPU 曲线 -->
              <path :d="cpuPath" fill="none" stroke="#3b82f6" stroke-width="0.5" class="transition-all duration-300" />
              <path :d="cpuPath + ' L 100 40 L 0 40 Z'" fill="url(#cpuGradient)" class="opacity-20" />
              <!-- 内存曲线 -->
              <path :d="ramPath" fill="none" stroke="#a855f7" stroke-width="0.5" class="transition-all duration-300" />

              <defs>
                <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#3b82f6" />
                  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        <!-- 硬件信息卡片 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="p-4 bg-white dark:bg-white/5 rounded-xl border border-gray-300 dark:border-white/10">
            <h4 class="text-xs font-bold mb-3 opacity-60">处理器信息</h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between"><span>名称</span><span class="font-medium text-xs">Intel(R) Core(TM) i9-12900K</span></div>
              <div class="flex justify-between"><span>核心/线程</span><span class="font-medium">16 / 24</span></div>
              <div class="flex justify-between"><span>基准频率</span><span class="font-medium">3.20 GHz</span></div>
            </div>
          </div>
          <div class="p-4 bg-white dark:bg-white/5 rounded-xl border border-gray-300 dark:border-white/10">
            <h4 class="text-xs font-bold mb-3 opacity-60">显卡信息</h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between"><span>名称</span><span class="font-medium text-xs">NVIDIA GeForce RTX 4080</span></div>
              <div class="flex justify-between"><span>显存</span><span class="font-medium">16 GB GDDR6X</span></div>
              <div class="flex justify-between"><span>驱动版本</span><span class="font-medium">546.17</span></div>
            </div>
          </div>
        </div>
      </section>

      <!-- 右侧进程列表 -->
      <aside class="w-full md:w-72 border-l border-gray-300 dark:border-white/10 bg-gray-50/50 dark:bg-black/10 p-4">
        <h3 class="text-xs font-bold mb-4 opacity-60 flex items-center gap-2">
          <ListIcon class="w-3 h-3" />
          高负载进程
        </h3>
        <div class="space-y-2">
          <div v-for="proc in processes" :key="proc.name"
               class="flex items-center justify-between p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-white/5 transition-colors">
            <div class="flex items-center gap-3">
              <div class="w-2 h-2 rounded-full" :class="proc.cpu > 15 ? 'bg-rose-500 animate-pulse' : 'bg-blue-500'"></div>
              <span class="text-xs font-medium truncate w-24">{{ proc.name }}</span>
            </div>
            <div class="flex gap-3 text-[10px] font-mono opacity-60">
              <span class="w-8 text-right">{{ proc.cpu }}%</span>
              <span class="w-12 text-right">{{ proc.ram }}MB</span>
            </div>
          </div>
        </div>
        <button class="w-full mt-6 py-2 text-[11px] font-medium border border-gray-300 dark:border-white/10 rounded-md hover:bg-white dark:hover:bg-white/5">
          打开任务管理器
        </button>
      </aside>
    </div>

    <!-- 底部状态栏 -->
    <footer class="px-4 py-2 border-top border-gray-300 dark:border-white/10 text-[10px] flex justify-between opacity-50">
      <div class="flex gap-4">
        <span>运行时间: 02:14:55:12</span>
        <span>内核版本: 6.5.0-generic</span>
      </div>
      <div>
        <span>最后更新: {{ lastUpdate }}</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ActivityIcon, ListIcon } from 'lucide-vue-next';

// 核心数据状态
const cpuHistory = ref(Array(20).fill(20));
const ramHistory = ref(Array(20).fill(45));
const lastUpdate = ref(new Date().toLocaleTimeString());

// 顶部指标
const mainStats = ref([
  { label: 'CPU 利用率', value: 24, unit: '%', trend: 2 },
  { label: '内存使用', value: 48, unit: '%', trend: -1 },
  { label: '磁盘活动', value: 12, unit: '%', trend: 5 },
  { label: '网络下行', value: 4.2, unit: 'MB/s', trend: 12 }
]);

// 进程数据
const processes = ref([
  { name: 'System Idle', cpu: 74, ram: 0 },
  { name: 'Chrome Browser', cpu: 12.4, ram: 1450 },
  { name: 'Visual Studio Code', cpu: 6.2, ram: 890 },
  { name: 'Window Manager', cpu: 3.1, ram: 120 },
  { name: 'Spotify Music', cpu: 1.5, ram: 240 },
  { name: 'Discord', cpu: 0.8, ram: 310 }
]);

// 计算 SVG 路径
const cpuPath = computed(() => {
  return generatePath(cpuHistory.value);
});

const ramPath = computed(() => {
  return generatePath(ramHistory.value);
});

function generatePath(data) {
  const step = 100 / (data.length - 1);
  return data.reduce((acc, val, i) => {
    const x = i * step;
    const y = 40 - (val / 100 * 40); // 映射到 40px 高度
    return acc + (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
  }, "");
}

// 模拟实时更新
let interval = null;
onMounted(() => {
  interval = setInterval(() => {
    // 更新历史曲线
    cpuHistory.value.push(Math.max(10, Math.min(90, cpuHistory.value[cpuHistory.value.length - 1] + (Math.random() * 20 - 10))));
    cpuHistory.value.shift();

    ramHistory.value.push(Math.max(40, Math.min(55, ramHistory.value[ramHistory.value.length - 1] + (Math.random() * 2 - 1))));
    ramHistory.value.shift();

    // 更新主要指标
    mainStats.value[0].value = Math.round(cpuHistory.value[cpuHistory.value.length - 1]);
    mainStats.value[1].value = Math.round(ramHistory.value[ramHistory.value.length - 1]);

    // 更新进程模拟数据
    processes.value.forEach(p => {
      if(p.name !== 'System Idle') {
        p.cpu = parseFloat((p.cpu + (Math.random() * 1 - 0.5)).toFixed(1));
        if(p.cpu < 0) p.cpu = 0;
      }
    });

    lastUpdate.value = new Date().toLocaleTimeString();
  }, 1000);
});

onUnmounted(() => {
  clearInterval(interval);
});
</script>

<style scoped>
.system-monitor {
  user-select: none;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(128, 128, 128, 0.2);
  border-radius: 10px;
}

/* 渐变过渡效果 */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 500ms;
}
</style>
