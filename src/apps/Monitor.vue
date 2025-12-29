<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import About from '@/apps/About.vue'
import Performance from '@/apps/Performance.vue'

const props = defineProps(['initialDark']);

const isDark = ref(!!props.initialDark);
const activeTab = ref('performance');
const uptime = ref('00:00:00');
const cpuLoad = ref(0);
const historyData = ref(Array(40).fill(20));
const startTime = Date.now();

// 网络模拟数据
const netDown = ref(1.2);
const netUp = ref(0.4);
const netHistory = ref(Array(30).fill(5));

const tabs = [
  { id: 'performance', name: '性能', icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>` },
  { id: 'processes', name: '进程', icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>` },
  { id: 'storage', name: '存储', icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>` },
  { id: 'network', name: '网络', icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>` },
  { id: 'devices', name: '设备', icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>` },
];

const mainStats = computed(() => [
  { label: '处理器', value: cpuLoad.value, unit: '%', percent: cpuLoad.value, color: '#3b82f6', icon: '⚡' },
  { label: '内存', value: '8.4', unit: 'GB', percent: 52, color: '#8b5cf6', icon: '🧠' },
  { label: '网络下行', value: netDown.value, unit: 'MB/s', percent: 30, color: '#10b981', icon: '⬇️' }
]);

const processes = ref([
  { pid: 1420, name: 'Google Chrome', cpu: 12.5, mem: 1240, icon: '🌐' },
  { pid: 3291, name: 'VS Code', cpu: 5.2, mem: 840, icon: '📝' },
  { pid: 410, name: 'System Shell', cpu: 0.1, mem: 45, icon: '🐚' },
  { pid: 902, name: 'Window Manager', cpu: 1.8, mem: 210, icon: '🖼️' },
]);

const disks = ref([
  { label: '系统盘', name: 'C:', total: 512, used: 224, usedPercent: 44 },
  { label: '数据盘', name: 'D:', total: 1024, used: 842, usedPercent: 82 }
]);

// 硬件设备信息
const hardwareInfo = [
  { group: '计算核心', items: [
      { name: '处理器', value: 'Intel Core i9-13900K', icon: '🔳' },
      { name: '显卡', value: 'NVIDIA GeForce RTX 4090', icon: '🎮' },
      { name: '主板', value: 'ROG MAXIMUS Z790 HERO', icon: '📋' }
    ]},
  { group: '外部设备', items: [
      { name: '显示器', value: '3840 x 2160 @ 144Hz', icon: '🖥️' },
      { name: '键盘', value: 'Custom Mech 87 Key', icon: '⌨️' },
      { name: '音频', value: 'High Definition Audio Device', icon: '🔊' }
    ]}
];

const chartPath = (data, width, height, closed) => {
  const len = data.length;
  let d = `M 0,${height - data[0]}`;
  for (let i = 1; i < len; i++) {
    const x = (i / (len - 1)) * width;
    const y = height - data[i];
    d += ` L ${x},${y}`;
  }
  if (closed) d += ` L ${width},${height} L 0,${height} Z`;
  return d;
};

let timer;
const updateData = () => {
  const newLoad = Math.floor(Math.random() * 40) + 10;
  cpuLoad.value = newLoad;
  historyData.value.push(newLoad);
  if (historyData.value.length > 40) historyData.value.shift();

  // 更新网络模拟数据
  netDown.value = parseFloat((Math.random() * 5 + 0.5).toFixed(1));
  netUp.value = parseFloat((Math.random() * 1.2 + 0.1).toFixed(1));
  netHistory.value.push(netDown.value * 10);
  if (netHistory.value.length > 30) netHistory.value.shift();

  const diff = Math.floor((Date.now() - startTime) / 1000);
  const h = String(Math.floor(diff / 3600)).padStart(2, '0');
  const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
  const s = String(diff % 60).padStart(2, '0');
  uptime.value = `${h}:${m}:${s}`;
};

onMounted(() => {
  timer = setInterval(updateData, 1000);
});

onUnmounted(() => clearInterval(timer));
</script>

<template>
  <div :class="['monitor-root h-full flex flex-col', isDark ? 'dark' : '']">
    <div class="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-300 overflow-hidden">



      <div class="flex flex-1 overflow-hidden">
        <nav class="w-14 md:w-40 flex flex-col gap-1 p-2 border-r border-slate-200 dark:border-slate-800 shrink-0">
          <button v-for="tab in tabs" :key="tab.id"
                  @click="activeTab = tab.id"
                  :class="[
              'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200',
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
            ]">
            <span class="shrink-0" v-html="tab.icon"></span>
            <span class="hidden md:block text-xs font-semibold">{{ tab.name }}</span>
          </button>
        </nav>

        <main class="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50/50 dark:bg-slate-900/50">
          <transition name="fade-slide" mode="out-in">
            <!-- 性能视图 -->
            <div v-if="activeTab === 'performance'" key="perf" class="space-y-4">
              <Performance />
            </div>

            <!-- 进程视图 -->
            <div v-else-if="activeTab === 'processes'" key="proc">
              <div class="rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                <table class="w-full text-left text-[11px]">
                  <thead class="bg-slate-50 dark:bg-slate-900/50 text-slate-400">
                  <tr><th class="px-4 py-2 uppercase font-bold">应用</th><th class="px-4 py-2 uppercase font-bold text-right">CPU</th><th class="px-4 py-2 uppercase font-bold text-right">内存</th></tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 dark:divide-slate-700/50">
                  <tr v-for="p in processes" :key="p.pid" class="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td class="px-4 py-2 flex items-center gap-2"><span>{{ p.icon }}</span><span class="font-medium truncate">{{ p.name }}</span></td>
                    <td class="px-4 py-2 text-right font-mono text-blue-500 font-bold">{{ p.cpu }}%</td>
                    <td class="px-4 py-2 text-right opacity-60 font-mono">{{ p.mem }}MB</td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- 存储视图 -->
            <div v-else-if="activeTab === 'storage'" key="storage" class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div v-for="disk in disks" :key="disk.label" class="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-4 shadow-sm">
                <div class="w-12 h-12 flex-shrink-0 relative">
                  <svg viewBox="0 0 36 36" class="w-full h-full transform -rotate-90">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" class="text-slate-100 dark:text-slate-700" stroke-width="3" />
                    <circle cx="18" cy="18" r="16" fill="none" stroke="#6366f1" stroke-width="3" stroke-dasharray="100" :stroke-dashoffset="100 - disk.usedPercent" stroke-linecap="round" />
                  </svg>
                  <div class="absolute inset-0 flex items-center justify-center text-[10px] font-bold">{{ disk.usedPercent }}%</div>
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="text-xs font-bold truncate">{{ disk.label }} ({{ disk.name }})</h4>
                  <p class="text-[10px] opacity-50 uppercase tracking-tighter">{{ disk.used }}GB / {{ disk.total }}GB</p>
                </div>
              </div>
            </div>

            <!-- 网络视图 (New) -->
            <div v-else-if="activeTab === 'network'" key="network" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div class="flex justify-between items-center mb-4">
                    <h4 class="text-xs font-bold flex items-center gap-2"><span>⬇️</span> 下载流量</h4>
                    <span class="font-mono text-emerald-500 font-bold">{{ netDown }} MB/s</span>
                  </div>
                  <div class="h-16 w-full">
                    <svg viewBox="0 0 300 60" preserveAspectRatio="none" class="w-full h-full overflow-visible">
                      <path :d="chartPath(netHistory, 300, 60, false)" fill="none" stroke="#10b981" stroke-width="2" />
                    </svg>
                  </div>
                </div>
                <div class="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div class="flex justify-between items-center mb-4">
                    <h4 class="text-xs font-bold flex items-center gap-2"><span>⬆️</span> 上传流量</h4>
                    <span class="font-mono text-blue-500 font-bold">{{ netUp }} MB/s</span>
                  </div>
                  <div class="flex flex-col gap-2 mt-2">
                    <div class="flex justify-between text-[10px] opacity-60"><span>当日累计下行</span><span>24.8 GB</span></div>
                    <div class="flex justify-between text-[10px] opacity-60"><span>当日累计上行</span><span>4.2 GB</span></div>
                  </div>
                </div>
              </div>
              <div class="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <h4 class="text-xs font-bold mb-3 uppercase tracking-wider opacity-50">连接详情</h4>
                <div class="space-y-2">
                  <div class="flex justify-between text-[11px] py-1 border-b border-slate-50 dark:border-slate-700/50">
                    <span class="opacity-60">IPv4 地址</span><span class="font-mono">192.168.1.104</span>
                  </div>
                  <div class="flex justify-between text-[11px] py-1 border-b border-slate-50 dark:border-slate-700/50">
                    <span class="opacity-60">网关地址</span><span class="font-mono">192.168.1.1</span>
                  </div>
                  <div class="flex justify-between text-[11px] py-1">
                    <span class="opacity-60">网络状态</span><span class="text-emerald-500 font-bold">CONNECTED / GBPS</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 设备视图 (New) -->
            <div v-else-if="activeTab === 'devices'" key="devices" class="space-y-4">
              <div v-for="group in hardwareInfo" :key="group.group">
                <h4 class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">{{ group.group }}</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div v-for="item in group.items" :key="item.name" class="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                    <div class="w-8 h-8 rounded bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-lg">{{ item.icon }}</div>
                    <div class="min-w-0">
                      <p class="text-[10px] opacity-50">{{ item.name }}</p>
                      <p class="text-xs font-bold truncate">{{ item.value }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.2); border-radius: 10px; }
.fade-slide-enter-active, .fade-slide-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-slide-enter-from { opacity: 0; transform: translateY(8px); }
.fade-slide-leave-to { opacity: 0; transform: translateY(-8px); }
.dark { color-scheme: dark; }
</style>
