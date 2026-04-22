<template>
  <div ref="containerRef" class="clock-app-container h-full w-full bg-[var(--fly-bg-primary)] text-[var(--fly-text-primary)] flex flex-col font-sans overflow-hidden">
    
    <div class="clock-layout-wrapper flex-1 flex overflow-hidden min-h-0 relative">
      
      <!-- 1. Sidebar Navigation (Desktop) -->
      <aside class="clock-sidebar w-64 border-r border-[var(--fly-border-system)] bg-[var(--fly-bg-secondary)] flex flex-col p-4 shrink-0 overflow-y-auto no-scrollbar">
        <nav class="flex-1 space-y-1">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="w-full flex items-center gap-3 px-4 py-2.5 rounded-[var(--fly-radius-md)] transition-all duration-200 group relative"
            :class="activeTab === tab.id
              ? 'bg-accent/10 text-accent font-bold'
              : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-60 hover:opacity-100'"
          >
            <span v-if="activeTab === tab.id" class="absolute left-0 w-1 h-4 bg-accent rounded-full"></span>
            <component :is="tab.icon" class="w-4.5 h-4.5 flex-shrink-0" stroke-width="2.5" />
            <span class="text-[13px] tracking-tight">{{ tab.name }}</span>
          </button>
        </nav>
      </aside>

      <!-- 2. Main Content Area -->
      <main class="clock-main flex-1 flex flex-col min-w-0 overflow-hidden">
        <header class="h-16 flex items-center justify-between px-6 border-b border-[var(--fly-border-system)] bg-[var(--fly-bg-glass)] backdrop-blur-md sticky top-0 z-10 shrink-0 w-full mobile-header hidden">
          <h2 class="text-base font-black tracking-tight">{{ tabs.find(t => t.id === activeTab)?.name }}</h2>
          <button v-if="activeTab === 'world'" class="p-2 bg-accent text-white rounded-xl shadow-lg shadow-accent/20 active:scale-95 transition-all">
            <PlusIcon class="w-5 h-5" />
          </button>
        </header>

        <div class="flex-1 overflow-y-auto p-6 sm:p-10 no-scrollbar scroll-smooth">
          
          <!-- 2.1 时钟视图 -->
          <div v-if="activeTab === 'clock'" class="h-full flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-400 py-10">
            <div class="clock-face-container relative mb-12">
              <div class="absolute inset-0 rounded-full border-[6px] border-[var(--fly-border-system)] shadow-2xl bg-gradient-to-br from-[var(--fly-bg-secondary)] to-transparent opacity-50"></div>
              <!-- Numbers/Ticks -->
              <div v-for="i in 12" :key="i" class="absolute inset-0 p-3 sm:p-5" :style="{ transform: `rotate(${i * 30}deg)` }">
                <div class="w-1 h-3 sm:h-4 bg-[var(--fly-text-primary)] opacity-20 mx-auto rounded-full"></div>
              </div>
              <!-- Hands -->
              <div class="hand hour" :style="hourStyle"></div>
              <div class="hand min" :style="minStyle"></div>
              <div class="hand sec" :style="secStyle"></div>
              <!-- Center Dot -->
              <div class="absolute top-1/2 left-1/2 w-4 h-4 bg-accent rounded-full -translate-x-1/2 -translate-y-1/2 z-10 shadow-lg shadow-accent/40 ring-4 ring-[var(--fly-bg-primary)]"></div>
            </div>
            
            <div class="text-center">
              <div class="text-6xl sm:text-8xl font-black tracking-tighter mb-4 leading-none bg-gradient-to-br from-[var(--fly-text-primary)] to-[var(--fly-text-secondary)] bg-clip-text text-transparent">
                {{ digitalTime }}
              </div>
              <div class="text-[12px] sm:text-sm font-black opacity-30 uppercase tracking-widest">{{ dateString }}</div>
            </div>
          </div>

          <!-- 2.2 世界时钟 -->
          <div v-if="activeTab === 'world'" class="animate-in fade-in slide-in-from-bottom-4 duration-400 max-w-5xl mx-auto">
            <div class="flex justify-between items-center mb-10 desktop-only">
              <h2 class="text-2xl font-black tracking-tight">全球时间</h2>
              <button class="px-6 py-2.5 bg-accent text-white rounded-xl hover:brightness-110 shadow-lg shadow-accent/20 transition-all active:scale-95 font-bold text-xs uppercase tracking-wider">
                添加城市
              </button>
            </div>
            <div class="world-clock-grid grid gap-6">
              <div v-for="city in worldClocks" :key="city.name"
                   class="p-6 bg-[var(--fly-bg-glass)] backdrop-blur-xl rounded-[var(--fly-radius-md)] border border-[var(--fly-border-glass)] flex justify-between items-center group hover:shadow-2xl hover:border-accent/30 transition-all duration-300">
                <div class="min-w-0">
                  <div class="text-[10px] font-black opacity-30 uppercase tracking-[0.2em] mb-2">{{ city.offset }}</div>
                  <div class="text-xl font-black tracking-tight truncate">{{ city.name }}</div>
                  <div class="text-[11px] font-bold opacity-30 mt-1 uppercase tracking-wider">{{ city.date }}</div>
                </div>
                <div class="text-4xl font-black tracking-tighter text-accent">{{ city.time }}</div>
              </div>
            </div>
          </div>

          <!-- 2.3 秒表 -->
          <div v-if="activeTab === 'stopwatch'" class="h-full flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-400 max-w-xl mx-auto">
            <div class="text-7xl sm:text-9xl font-black font-mono my-12 tracking-tighter leading-none opacity-90">
              {{ formatStopwatch(stopwatchTime) }}
            </div>
            
            <div class="flex gap-8 mb-16">
              <button @click="toggleStopwatch" :class="['w-20 h-20 sm:w-24 sm:h-24 rounded-[32px] flex items-center justify-center transition-all shadow-2xl active:scale-90',
                isRunning ? 'bg-orange-500 shadow-orange-500/30 text-white' : 'bg-accent shadow-accent/30 text-white']">
                <PauseIcon v-if="isRunning" class="w-10 h-10" stroke-width="3" />
                <PlayIcon v-else class="w-10 h-10 ml-1" stroke-width="3" />
              </button>
              <button @click="lapOrReset" class="w-20 h-20 sm:w-24 sm:h-24 rounded-[32px] bg-[var(--fly-bg-secondary)] border border-[var(--fly-border-system)] flex items-center justify-center shadow-lg active:scale-90 transition-all text-[var(--fly-text-secondary)] hover:text-[var(--fly-text-primary)]">
                <RotateCcwIcon v-if="!isRunning && stopwatchTime > 0" class="w-8 h-8" stroke-width="2.5" />
                <FlagIcon v-else class="w-8 h-8" stroke-width="2.5" />
              </button>
            </div>

            <div class="w-full bg-[var(--fly-bg-glass)] rounded-[var(--fly-radius-md)] overflow-hidden border border-[var(--fly-border-glass)] backdrop-blur-xl">
              <div v-if="laps.length === 0" class="py-12 text-center opacity-20 font-black text-[11px] uppercase tracking-widest">目前没有计次数据</div>
              <div v-for="(lap, index) in laps" :key="index"
                   class="flex justify-between px-8 py-4.5 border-b border-[var(--fly-border-system)] last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <span class="text-[10px] font-black uppercase tracking-widest opacity-30">计次 {{ laps.length - index }}</span>
                <span class="font-mono font-black text-base opacity-70">{{ formatStopwatch(lap) }}</span>
              </div>
            </div>
          </div>

          <!-- 2.4 计时器 -->
          <div v-if="activeTab === 'timer'" class="h-full flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-400 max-w-2xl mx-auto">
            <div v-if="timerValue === 0" class="timer-grid grid grid-cols-2 sm:grid-cols-3 gap-6 w-full">
              <button v-for="t in [1, 5, 10, 15, 30, 60]" :key="t"
                      @click="startPresetTimer(t)"
                      class="p-10 sm:p-12 bg-[var(--fly-bg-glass)] rounded-[var(--fly-radius-lg)] border border-[var(--fly-border-glass)] hover:border-accent hover:scale-[1.03] transition-all text-center group shadow-sm hover:shadow-2xl">
                <span class="text-4xl sm:text-5xl font-black group-hover:text-accent transition-colors">{{ t }}</span>
                <span class="text-[10px] block font-black opacity-30 mt-3 uppercase tracking-[0.3em]">Minutes</span>
              </button>
            </div>
            
            <div v-if="timerValue > 0" class="flex flex-col items-center w-full">
              <div class="relative w-72 h-72 sm:w-96 sm:h-96 mb-16 flex items-center justify-center">
                <!-- Inner Ring -->
                <div class="absolute inset-4 rounded-full border-[10px] border-[var(--fly-border-system)] opacity-40"></div>
                <div class="absolute inset-4 rounded-full border-[10px] border-accent border-t-transparent animate-spin duration-3000"></div>
                <!-- Running Text -->
                <div class="text-6xl sm:text-8xl font-black font-mono tracking-tighter opacity-90">
                  {{ formatTimer(timerValue) }}
                </div>
              </div>
              <button @click="timerValue = 0" class="px-12 py-3.5 bg-red-500 text-white rounded-2xl font-black shadow-2xl shadow-red-500/30 hover:brightness-110 active:scale-95 transition-all uppercase tracking-widest text-xs"> 取消计时 </button>
            </div>
          </div>

        </div>
      </main>

      <!-- 3. Bottom Navigation (Mobile Only) -->
      <nav class="clock-bottom-nav absolute bottom-0 left-0 right-0 h-16 bg-[var(--fly-bg-glass)] backdrop-blur-2xl border-t border-[var(--fly-border-system)] flex items-center justify-around px-2 z-50 hidden">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="flex flex-col items-center gap-1 transition-all flex-1 py-1"
          :class="activeTab === tab.id ? 'text-accent font-black scale-105' : 'opacity-40'"
        >
          <component :is="tab.icon" class="w-5 h-5 flex-shrink-0" stroke-width="2.5" />
          <span class="text-[10px] font-bold tracking-tight">{{ tab.name }}</span>
        </button>
      </nav>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, markRaw } from 'vue';
import {
  ClockIcon, GlobeIcon, TimerIcon as TimerIconLucide, PlayIcon, PauseIcon,
  RotateCcwIcon, FlagIcon, PlusIcon, HourglassIcon
} from 'lucide-vue-next';

const containerRef = ref(null);
const containerWidth = ref(1000);
const activeTab = ref('clock');

const tabs = [
  { id: 'clock', name: '时钟', icon: markRaw(ClockIcon) },
  { id: 'world', name: '世界时间', icon: markRaw(GlobeIcon) },
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

<style scoped>
.clock-app-container {
  container-type: inline-size;
  container-name: clock-app;
  user-select: none;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.clock-face-container {
  width: 320px;
  height: 320px;
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

.hour { width: 8px; height: 28%; z-index: 3; background: var(--fly-text-primary); }
.min { width: 5px; height: 38%; opacity: 0.5; z-index: 2; background: var(--fly-text-primary); }
.sec { width: 2.5px; height: 45%; background: var(--accent-color); z-index: 4; transition: transform 0.1s linear; }

@container clock-app (max-width: 650px) {
  .clock-sidebar { display: none !important; }
  .clock-bottom-nav { display: flex !important; }
  .mobile-header { display: flex !important; }
  .desktop-only { display: none !important; }
  
  .clock-face-container {
    width: 240px;
    height: 240px;
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
</style>
