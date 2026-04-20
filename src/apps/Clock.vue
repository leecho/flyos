<template>
  <div ref="containerRef" class="clock-app-container h-full w-full bg-[#f3f3f3] dark:bg-gray-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans overflow-hidden">
    
    <div class="clock-layout-wrapper flex-1 flex overflow-hidden min-h-0 relative">
      
      <!-- 1. Sidebar Navigation (Desktop) -->
      <aside class="clock-sidebar w-64 border-r border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-gray-900/50 backdrop-blur-xl flex flex-col p-4 shrink-0 overflow-y-auto">
        <div class="flex items-center gap-3 px-3 py-6 mb-4">
          <div class="w-10 h-10 rounded-2xl bg-accent shadow-lg shadow-accent/20 flex items-center justify-center text-white">
            <ClockIcon class="w-5 h-5" />
          </div>
          <div class="min-w-0">
            <h2 class="text-sm font-black tracking-tight">时钟</h2>
            <p class="text-[10px] opacity-50 font-medium tracking-wider uppercase">FlyOS Clock</p>
          </div>
        </div>

        <nav class="flex-1 space-y-1">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group relative"
            :class="activeTab === tab.id
              ? 'bg-accent text-white shadow-lg shadow-accent/20'
              : 'hover:bg-slate-200/50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 font-medium'"
          >
            <component :is="tab.icon" class="w-4.5 h-4.5 flex-shrink-0" />
            <span class="text-[13px] font-bold">{{ tab.name }}</span>
          </button>
        </nav>
      </aside>

      <!-- 2. Main Content Area -->
      <main class="clock-main flex-1 flex flex-col min-w-0 overflow-hidden bg-white/20 dark:bg-transparent">
        <header class="h-16 flex items-center justify-between px-6 border-b border-slate-200/40 dark:border-white/5 backdrop-blur-md sticky top-0 z-10 shrink-0 w-full mobile-header hidden">
          <h2 class="text-base font-black tracking-tight">{{ tabs.find(t => t.id === activeTab)?.name }}</h2>
          <!-- Mobile Specific Add Button for World Clock -->
          <button v-if="activeTab === 'world'" class="p-2 bg-accent text-white rounded-xl shadow-lg shadow-accent/20 active:scale-95 transition-all">
            <PlusIcon class="w-5 h-5" />
          </button>
        </header>

        <div class="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar scroll-smooth">
          
          <!-- 2.1 时钟视图 -->
          <div v-if="activeTab === 'clock'" class="h-full flex flex-col items-center justify-center animate-fade-in py-10">
            <div class="clock-face-container relative mb-12">
              <div class="absolute inset-0 rounded-full border-[6px] border-slate-200 dark:border-white/10 shadow-2xl bg-gradient-to-br from-white/50 to-white/10 dark:from-white/5 dark:to-transparent"></div>
              <!-- Numbers/Ticks -->
              <div v-for="i in 12" :key="i" class="absolute inset-0 p-3 sm:p-5" :style="{ transform: `rotate(${i * 30}deg)` }">
                <div class="w-1 h-3 sm:h-4 bg-slate-300 dark:bg-white/20 mx-auto rounded-full"></div>
              </div>
              <!-- Hands -->
              <div class="hand hour" :style="hourStyle"></div>
              <div class="hand min" :style="minStyle"></div>
              <div class="hand sec" :style="secStyle"></div>
              <!-- Center Dot -->
              <div class="absolute top-1/2 left-1/2 w-4 h-4 bg-accent rounded-full -translate-x-1/2 -translate-y-1/2 z-10 shadow-lg shadow-accent/40 ring-4 ring-white dark:ring-gray-900"></div>
            </div>
            
            <div class="text-center">
              <div class="text-5xl sm:text-7xl font-black tracking-tighter mb-3 leading-none bg-gradient-to-br from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                {{ digitalTime }}
              </div>
              <div class="text-[13px] sm:text-base font-bold opacity-40 uppercase tracking-widest">{{ dateString }}</div>
            </div>
          </div>

          <!-- 2.2 世界时钟 -->
          <div v-if="activeTab === 'world'" class="animate-fade-in max-w-5xl mx-auto">
            <div class="flex justify-between items-center mb-8 desktop-only">
              <h2 class="text-xl sm:text-2xl font-black tracking-tight">世界时钟</h2>
              <button class="p-3 bg-accent text-white rounded-2xl hover:brightness-110 shadow-lg shadow-accent/20 transition-all active:scale-95">
                <PlusIcon class="w-5 h-5" />
              </button>
            </div>
            <div class="world-clock-grid grid gap-4">
              <div v-for="city in worldClocks" :key="city.name"
                   class="p-5 sm:p-6 bg-white/60 dark:bg-white/5 backdrop-blur-md rounded-3xl border border-slate-200/60 dark:border-white/5 flex justify-between items-center group hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                <div class="min-w-0">
                  <div class="text-[10px] font-black opacity-40 uppercase tracking-[0.15em] mb-1">{{ city.offset }}</div>
                  <div class="text-lg sm:text-xl font-black tracking-tight truncate">{{ city.name }}</div>
                  <div class="text-[10px] sm:text-xs font-bold opacity-30 mt-1">{{ city.date }}</div>
                </div>
                <div class="text-3xl sm:text-4xl font-black tracking-tighter text-accent">{{ city.time }}</div>
              </div>
            </div>
          </div>

          <!-- 2.3 秒表 -->
          <div v-if="activeTab === 'stopwatch'" class="h-full flex flex-col items-center justify-center animate-fade-in max-w-xl mx-auto">
            <div class="text-6xl sm:text-8xl font-black font-mono my-10 sm:my-14 tracking-tighter leading-none">
              {{ formatStopwatch(stopwatchTime) }}
            </div>
            
            <div class="flex gap-6 mb-12">
              <button @click="toggleStopwatch" :class="['w-16 h-16 sm:w-20 sm:h-20 rounded-[32px] flex items-center justify-center transition-all shadow-xl active:scale-90',
                isRunning ? 'bg-orange-500 shadow-orange-500/20 text-white' : 'bg-accent shadow-accent/20 text-white']">
                <PauseIcon v-if="isRunning" class="w-8 h-8 sm:w-10 sm:h-10" />
                <PlayIcon v-else class="w-8 h-8 sm:w-10 sm:h-10 ml-1" />
              </button>
              <button @click="lapOrReset" class="w-16 h-16 sm:w-20 sm:h-20 rounded-[32px] bg-slate-200 dark:bg-white/10 flex items-center justify-center shadow-lg active:scale-90 transition-all">
                <RotateCcwIcon v-if="!isRunning && stopwatchTime > 0" class="w-6 h-6 sm:w-8 sm:h-8" />
                <FlagIcon v-else class="w-6 h-6 sm:w-8 sm:h-8" />
              </button>
            </div>

            <div class="w-full bg-slate-100/50 dark:bg-white/5 rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 backdrop-blur-md">
              <div v-if="laps.length === 0" class="py-10 text-center opacity-30 font-bold text-sm">计次记录将显示在这里</div>
              <div v-for="(lap, index) in laps" :key="index"
                   class="flex justify-between px-8 py-4 border-b border-slate-200 dark:border-white/5 last:border-0 hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                <span class="text-xs font-black uppercase tracking-widest opacity-30">计次 {{ laps.length - index }}</span>
                <span class="font-mono font-bold">{{ formatStopwatch(lap) }}</span>
              </div>
            </div>
          </div>

          <!-- 2.4 计时器 -->
          <div v-if="activeTab === 'timer'" class="h-full flex flex-col items-center justify-center animate-fade-in max-w-2xl mx-auto">
            <div v-if="timerValue === 0" class="timer-grid grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
              <button v-for="t in [1, 5, 10, 15, 30, 60]" :key="t"
                      @click="startPresetTimer(t)"
                      class="p-8 sm:p-10 bg-white/60 dark:bg-white/5 rounded-[40px] border border-slate-200 dark:border-white/5 hover:border-accent hover:scale-[1.03] transition-all text-center group shadow-sm hover:shadow-xl">
                <span class="text-3xl sm:text-4xl font-black group-hover:text-accent transition-colors">{{ t }}</span>
                <span class="text-[10px] sm:text-xs block font-black opacity-30 mt-2 uppercase tracking-[0.2em]">分钟</span>
              </button>
            </div>
            
            <div v-if="timerValue > 0" class="flex flex-col items-center w-full">
              <div class="relative w-64 h-64 sm:w-80 sm:h-80 mb-12 flex items-center justify-center">
                <!-- Inner Ring -->
                <div class="absolute inset-4 rounded-full border-8 border-slate-100 dark:border-white/5"></div>
                <!-- Running Text -->
                <div class="text-5xl sm:text-7xl font-black font-mono tracking-tighter">
                  {{ formatTimer(timerValue) }}
                </div>
              </div>
              <button @click="timerValue = 0" class="px-10 py-3 bg-red-500 text-white rounded-2xl font-black shadow-lg shadow-red-500/20 hover:brightness-110 active:scale-95 transition-all">取消</button>
            </div>
          </div>

        </div>
      </main>

      <!-- 3. Bottom Navigation (Mobile Only) -->
      <nav class="clock-bottom-nav absolute bottom-0 left-0 right-0 h-16 bg-white/80 dark:bg-gray-900/90 backdrop-blur-2xl border-t border-slate-200 dark:border-white/10 flex items-center justify-around px-2 z-50 hidden">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="flex flex-col items-center gap-1 transition-all flex-1 py-1"
          :class="activeTab === tab.id ? 'text-accent scale-105' : 'text-slate-400'"
        >
          <component :is="tab.icon" class="w-5 h-5 flex-shrink-0" />
          <span class="text-[10px] font-black tracking-tight">{{ tab.name }}</span>
        </button>
      </nav>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import {
  ClockIcon, GlobeIcon, TimerIcon as TimerIconLucide, PlayIcon, PauseIcon,
  RotateCcwIcon, FlagIcon, PlusIcon, HourglassIcon
} from 'lucide-vue-next';

const containerRef = ref(null);
const containerWidth = ref(1000);
const activeTab = ref('clock');

const tabs = [
  { id: 'clock', name: '时钟', icon: markRaw(ClockIcon) },
  { id: 'world', name: '世界时钟', icon: markRaw(GlobeIcon) },
  { id: 'stopwatch', name: '秒表', icon: markRaw(TimerIconLucide) },
  { id: 'timer', name: '计时器', icon: markRaw(HourglassIcon) },
];

// --- Responsive Detect ---
const updateSize = () => {
  if (containerRef.value) containerWidth.value = containerRef.value.offsetWidth;
};

let resizeObserver = null;
onMounted(() => {
  if (containerRef.value) {
    resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(containerRef.value);
    updateSize();
  }
});

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect();
  clearInterval(mainTimer);
  stopStopwatch();
});

// --- Core Logic ---
const now = ref(new Date());
let mainTimer = null;

onMounted(() => {
  mainTimer = setInterval(() => {
    now.value = new Date();
    if (timerValue.value > 0) timerValue.value -= 1;
  }, 1000);
});

const hourStyle = computed(() => ({ transform: `rotate(${(now.value.getHours() % 12) * 30 + now.value.getMinutes() * 0.5}deg)` }));
const minStyle = computed(() => ({ transform: `rotate(${now.value.getMinutes() * 6}deg)` }));
const secStyle = computed(() => ({ transform: `rotate(${now.value.getSeconds() * 6}deg)` }));

const digitalTime = computed(() => now.value.toLocaleTimeString('zh-CN', { hour12: false }));
const dateString = computed(() => now.value.toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' }));

// --- World Clocks ---
const worldClocks = computed(() => {
  const cities = [
    { name: '北京', zone: 'Asia/Shanghai' },
    { name: '伦敦', zone: 'Europe/London' },
    { name: '纽约', zone: 'America/New_York' },
    { name: '东京', zone: 'Asia/Tokyo' }
  ];
  return cities.map(city => {
    const timeStr = now.value.toLocaleTimeString('zh-CN', { timeZone: city.zone, hour12: false, hour: '2-digit', minute: '2-digit' });
    const dateStr = now.value.toLocaleDateString('zh-CN', { timeZone: city.zone, month: 'short', day: 'numeric' });
    const localHour = now.value.getHours();
    const cityHour = parseInt(timeStr.split(':')[0]);
    const diff = cityHour - localHour;
    return { ...city, time: timeStr, date: dateStr, offset: diff === 0 ? '本地时间' : `${diff > 0 ? '+' : ''}${diff} 小时` };
  });
});

// --- Stopwatch ---
const stopwatchTime = ref(0);
const isRunning = ref(false);
const laps = ref([]);
let stopwatchInterval = null;

const formatStopwatch = (ms) => {
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  const centi = Math.floor((ms % 1000) / 10);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(centi).padStart(2, '0')}`;
};

const formatTimer = (s) => {
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const toggleStopwatch = () => {
  if (isRunning.value) {
    stopStopwatch();
  } else {
    const start = Date.now() - stopwatchTime.value;
    stopwatchInterval = setInterval(() => {
      stopwatchTime.value = Date.now() - start;
    }, 10);
    isRunning.value = true;
  }
};

const stopStopwatch = () => {
  clearInterval(stopwatchInterval);
  isRunning.value = false;
};

const lapOrReset = () => {
  if (!isRunning.value) {
    stopwatchTime.value = 0;
    laps.value = [];
  } else {
    laps.value.unshift(stopwatchTime.value);
  }
};

// --- Timer ---
const timerValue = ref(0);
const startPresetTimer = (mins) => {
  timerValue.value = mins * 60;
};
</script>

<script>
// Non-setup script for markRaw if needed, but we used functional imports
import { markRaw } from 'vue';
</script>

<style scoped>
.clock-app-container {
  container-type: inline-size;
  container-name: clock-app;
  user-select: none;
}

.clock-face-container {
  width: 280px;
  height: 280px;
}

.hand {
  position: absolute;
  bottom: 50%;
  left: 50%;
  transform-origin: bottom center;
  border-radius: 99px;
  background: currentColor;
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.hour { width: 6px; height: 28%; z-index: 3; background: #333; }
.dark .hour { background: #fff; }
.min { width: 4px; height: 38%; opacity: 0.7; z-index: 2; }
.sec { width: 2px; height: 45%; background: var(--accent-color); z-index: 4; transition: transform 0.1s linear; }

@container clock-app (max-width: 600px) {
  .clock-sidebar { display: none !important; }
  .clock-bottom-nav { display: flex !important; }
  .mobile-header { display: flex !important; }
  .desktop-only { display: none !important; }
  
  .clock-face-container {
    width: 220px;
    height: 220px;
  }
  
  .world-clock-grid {
    grid-template-columns: 1fr !important;
  }
  
  .timer-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

@container clock-app (min-width: 900px) {
  .world-clock-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(128, 128, 128, 0.2); border-radius: 10px; }

.animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.2, 0, 0.2, 1); }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
