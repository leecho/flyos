<template>
  <div class="clock-app flex flex-col h-full bg-[#f3f3f3] dark:bg-[#1a1a1a] text-gray-800 dark:text-gray-200 overflow-hidden font-sans">

    <!-- 侧边导航栏 -->
    <div class="flex flex-1 overflow-hidden">
      <nav class="w-16 md:w-48 flex flex-col border-r border-gray-300 dark:border-white/10 bg-white/50 dark:bg-black/20 backdrop-blur-md">
        <div class="p-4 hidden md:block text-xl font-bold tracking-tight">时钟</div>
        <div class="flex flex-col gap-1 p-2">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="['flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                    activeTab === tab.id ? 'bg-accent text-white shadow-lg' : 'hover:bg-gray-200 dark:hover:bg-white/10']"
          >
            <component :is="tab.icon" class="w-5 h-5" />
            <span class="hidden md:block text-sm font-medium">{{ tab.name }}</span>
          </button>
        </div>
      </nav>

      <!-- 内容区 -->
      <main class="flex-1 overflow-y-auto p-6 custom-scrollbar">

        <!-- 1. 时钟视图 -->
        <div v-if="activeTab === 'clock'" class="h-full flex flex-col items-center justify-center animate-fade-in">
          <div class="relative w-64 h-64 mb-8">
            <div class="absolute inset-0 rounded-full border-4 border-gray-300 dark:border-white/10 shadow-inner"></div>
            <!-- 刻度 -->
            <div v-for="i in 12" :key="i" class="absolute inset-0 p-2" :style="{ transform: `rotate(${i * 30}deg)` }">
              <div class="w-1 h-3 bg-gray-400 dark:bg-white/30 mx-auto rounded-full"></div>
            </div>
            <!-- 指针 -->
            <div class="hand hour" :style="hourStyle"></div>
            <div class="hand min" :style="minStyle"></div>
            <div class="hand sec" :style="secStyle"></div>
            <div class="absolute top-1/2 left-1/2 w-3 h-3 bg-accent rounded-full -translate-x-1/2 -translate-y-1/2 z-10"></div>
          </div>
          <div class="text-6xl font-light tracking-tighter mb-2">{{ digitalTime }}</div>
          <div class="text-lg opacity-60">{{ dateString }}</div>
        </div>

        <!-- 2. 世界时钟 -->
        <div v-if="activeTab === 'world'" class="animate-fade-in space-y-4">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-semibold">世界时钟</h2>
            <button @click="addCity" class="p-2 bg-accent text-white rounded-full hover:bg-opacity-80 transition-colors">
              <PlusIcon class="w-5 h-5" />
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="city in worldClocks" :key="city.name"
                 class="p-4 bg-white dark:bg-white/5 rounded-xl border border-white/10 flex justify-between items-center group">
              <div>
                <div class="text-sm opacity-60">{{ city.offset }}</div>
                <div class="text-xl font-bold">{{ city.name }}</div>
                <div class="text-xs opacity-40">{{ city.date }}</div>
              </div>
              <div class="text-3xl font-mono">{{ city.time }}</div>
            </div>
          </div>
        </div>

        <!-- 3. 秒表 -->
        <div v-if="activeTab === 'stopwatch'" class="h-full flex flex-col items-center animate-fade-in">
          <div class="text-7xl font-mono font-thin my-12 tracking-tight">
            {{ formatStopwatch(stopwatchTime) }}
          </div>
          <div class="flex gap-4 mb-8">
            <button @click="toggleStopwatch" :class="['w-16 h-16 rounded-full flex items-center justify-center transition-all text-white',
              isRunning ? 'bg-orange-500' : 'bg-green-600']">
              <PauseIcon v-if="isRunning" class="w-8 h-8" />
              <PlayIcon v-else class="w-8 h-8 ml-1" />
            </button>
            <button @click="lapOrReset" class="w-16 h-16 rounded-full bg-gray-300 dark:bg-white/10 flex items-center justify-center">
              <RotateCcwIcon v-if="!isRunning && stopwatchTime > 0" class="w-6 h-6" />
              <FlagIcon v-else class="w-6 h-6" />
            </button>
          </div>
          <div class="w-full max-w-md bg-white/50 dark:bg-black/20 rounded-xl overflow-hidden">
            <div v-for="(lap, index) in laps" :key="index"
                 class="flex justify-between px-6 py-3 border-b border-gray-300 dark:border-white/5 last:border-0">
              <span class="opacity-40">计次 {{ laps.length - index }}</span>
              <span class="font-mono">{{ formatStopwatch(lap) }}</span>
            </div>
          </div>
        </div>

        <!-- 4. 计时器 -->
        <div v-if="activeTab === 'timer'" class="animate-fade-in flex flex-col items-center">
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-lg mb-8">
            <button v-for="t in [1, 5, 10, 15, 30, 60]" :key="t"
                    @click="startPresetTimer(t)"
                    class="p-6 bg-white dark:bg-white/5 rounded-xl border border-white/10 hover:border-accent transition-all text-center">
              <span class="text-2xl font-bold">{{ t }}</span>
              <span class="text-xs block opacity-50">分钟</span>
            </button>
          </div>
          <div v-if="timerValue > 0" class="text-center">
            <div class="text-6xl font-mono mb-4">{{ formatStopwatch(timerValue * 1000) }}</div>
            <button @click="timerValue = 0" class="px-6 py-2 bg-accent/80 text-white rounded-full hover:bg-accent">取消</button>
          </div>
        </div>

      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import {
  ClockIcon, GlobeIcon, TimerIcon, PlayIcon, PauseIcon,
  RotateCcwIcon, FlagIcon, PlusIcon, HourglassIcon
} from 'lucide-vue-next';

// 导航配置
const activeTab = ref('clock');
const tabs = [
  { id: 'clock', name: '时钟', icon: ClockIcon },
  { id: 'world', name: '世界时钟', icon: GlobeIcon },
  { id: 'stopwatch', name: '秒表', icon: TimerIcon },
  { id: 'timer', name: '计时器', icon: HourglassIcon },
];

// --- 核心时间逻辑 ---
const now = ref(new Date());
let mainTimer = null;

onMounted(() => {
  mainTimer = setInterval(() => {
    now.value = new Date();
    if (timerValue.value > 0) timerValue.value -= 1;
  }, 1000);
});

onUnmounted(() => {
  clearInterval(mainTimer);
  stopStopwatch();
});

// 时钟指针样式
const hourStyle = computed(() => ({ transform: `rotate(${(now.value.getHours() % 12) * 30 + now.value.getMinutes() * 0.5}deg)` }));
const minStyle = computed(() => ({ transform: `rotate(${now.value.getMinutes() * 6}deg)` }));
const secStyle = computed(() => ({ transform: `rotate(${now.value.getSeconds() * 6}deg)` }));

const digitalTime = computed(() => now.value.toLocaleTimeString('zh-CN', { hour12: false }));
const dateString = computed(() => now.value.toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));

// --- 世界时钟数据 ---
const worldClocks = computed(() => {
  const cities = [
    { name: '伦敦', zone: 'Europe/London' },
    { name: '纽约', zone: 'America/New_York' },
    { name: '东京', zone: 'Asia/Tokyo' },
    { name: '悉尼', zone: 'Australia/Sydney' }
  ];
  return cities.map(city => {
    const timeStr = now.value.toLocaleTimeString('zh-CN', { timeZone: city.zone, hour12: false });
    const dateStr = now.value.toLocaleDateString('zh-CN', { timeZone: city.zone, month: 'short', day: 'numeric' });
    return { ...city, time: timeStr, date: dateStr, offset: '当地时间' };
  });
});

// --- 秒表逻辑 ---
const stopwatchTime = ref(0); // 毫秒
const isRunning = ref(false);
const laps = ref([]);
let stopwatchInterval = null;

const formatStopwatch = (ms) => {
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  const centi = Math.floor((ms % 1000) / 10);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(centi).padStart(2, '0')}`;
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

// --- 计时器逻辑 ---
const timerValue = ref(0);
const startPresetTimer = (mins) => {
  timerValue.value = mins * 60;
  activeTab.value = 'timer';
};
</script>

<style scoped>
.clock-app {
  user-select: none;
}

.hand {
  position: absolute;
  bottom: 50%;
  left: 50%;
  transform-origin: bottom center;
  border-radius: 99px;
  background: currentColor;
  transition: transform 0.1s cubic-bezier(0.4, 2.08, 0.55, 0.44);
}

.hour { width: 4px; height: 25%; z-index: 3; }
.min { width: 3px; height: 35%; opacity: 0.8; z-index: 2; }
.sec { width: 2px; height: 42%; background: var(--accent-color); z-index: 4; }

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(128, 128, 128, 0.2);
  border-radius: 10px;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
