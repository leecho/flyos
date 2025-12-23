<template>
  <div class="weather-app h-full flex flex-col overflow-hidden relative" :class="themeClass">
    <!-- 动态背景装饰 -->
    <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-20 -right-20 w-64 h-64 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute top-1/2 -left-20 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
    </div>

    <!-- 顶部操作栏 -->
    <header class="relative z-10 flex items-center justify-between px-6 py-4">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-white/20 backdrop-blur-md rounded-xl shadow-inner">
          <span class="text-2xl">{{ currentWeather.icon }}</span>
        </div>
        <div>
          <h2 class="text-lg font-bold flex items-center gap-1">
            {{ city }}
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </h2>
          <p class="text-xs opacity-70">最后更新: 刚刚</p>
        </div>
      </div>
      <div class="flex gap-2">
        <button class="p-2 rounded-full hover:bg-white/20 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/><path d="M22 2v20"/></svg>
        </button>
      </div>
    </header>

    <!-- 主体滚动区域 -->
    <main class="relative z-10 flex-1 overflow-y-auto custom-scrollbar px-6 pb-8">
      <!-- 当前天气大看板 -->
      <section class="py-8 flex flex-col items-center text-center">
        <div class="text-7xl font-light tracking-tighter mb-2 relative">
          {{ currentWeather.temp }}<span class="text-4xl absolute top-2 -right-6">°</span>
        </div>
        <p class="text-xl font-medium opacity-90">{{ currentWeather.description }}</p>
        <div class="mt-4 flex gap-4 text-sm font-medium bg-white/10 px-4 py-2 rounded-full backdrop-blur-md">
          <span>最高 {{ currentWeather.high }}°</span>
          <span class="opacity-40">|</span>
          <span>最低 {{ currentWeather.low }}°</span>
        </div>
      </section>

      <!-- 逐小时预报 -->
      <section class="mb-8">
        <h3 class="text-sm font-bold opacity-60 mb-4 px-1 uppercase tracking-wider">24小时预报</h3>
        <div class="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          <div
            v-for="(hour, index) in hourlyForecast"
            :key="index"
            class="flex-shrink-0 flex flex-col items-center gap-3 px-4 py-4 rounded-2xl bg-white/5 border border-white/10 min-w-[80px]"
          >
            <span class="text-xs opacity-60">{{ hour.time }}</span>
            <span class="text-xl">{{ hour.icon }}</span>
            <span class="font-bold">{{ hour.temp }}°</span>
          </div>
        </div>
      </section>

      <!-- 详情格点 -->
      <section class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div v-for="stat in stats" :key="stat.label" class="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex flex-col gap-2">
          <div class="flex items-center gap-2 opacity-60">
            <component :is="stat.icon" class="w-4 h-4" />
            <span class="text-xs font-bold uppercase">{{ stat.label }}</span>
          </div>
          <div class="text-xl font-bold">{{ stat.value }}</div>
          <div class="text-[10px] opacity-50">{{ stat.desc }}</div>
        </div>
      </section>

      <!-- 未来五天简报 -->
      <section class="mt-8 p-5 rounded-3xl bg-black/5 dark:bg-white/5 border border-white/5">
        <h3 class="text-sm font-bold opacity-60 mb-4 uppercase tracking-wider">未来 5 天预报</h3>
        <div class="space-y-4">
          <div v-for="day in dailyForecast" :key="day.date" class="flex items-center justify-between">
            <span class="w-20 font-medium">{{ day.date }}</span>
            <span class="text-xl">{{ day.icon }}</span>
            <div class="flex items-center gap-3 w-32 justify-end">
              <span class="opacity-40 text-sm">{{ day.low }}°</span>
              <div class="flex-1 h-1.5 bg-white/10 rounded-full relative overflow-hidden">
                <div class="absolute h-full bg-gradient-to-r from-blue-400 to-yellow-400 rounded-full" :style="{left: '20%', width: '60%'}"></div>
              </div>
              <span class="font-bold text-sm">{{ day.high }}°</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const city = ref('上海市')

const currentWeather = ref({
  temp: 22,
  description: '多云转晴',
  icon: '⛅',
  high: 26,
  low: 18,
  type: 'cloudy' // 用于背景切换
})

const themeClass = computed(() => {
  const themes = {
    sunny: 'bg-gradient-to-br from-sky-400 to-blue-600 text-white',
    cloudy: 'bg-gradient-to-br from-slate-400 to-zinc-600 text-white',
    rainy: 'bg-gradient-to-br from-indigo-700 to-slate-900 text-white',
    night: 'bg-gradient-to-br from-gray-900 to-black text-white'
  }
  return themes[currentWeather.value.type] || themes.sunny
})

const hourlyForecast = [
  { time: '现在', temp: 22, icon: '⛅' },
  { time: '14:00', temp: 24, icon: '☀️' },
  { time: '15:00', temp: 25, icon: '☀️' },
  { time: '16:00', temp: 25, icon: '☀️' },
  { time: '17:00', temp: 23, icon: '🌤️' },
  { time: '18:00', temp: 21, icon: '🌥️' },
  { time: '19:00', temp: 19, icon: '🌙' },
  { time: '20:00', temp: 18, icon: '🌙' },
]

const dailyForecast = [
  { date: '明天', icon: '☀️', high: 28, low: 19 },
  { date: '周四', icon: '⛅', high: 26, low: 18 },
  { date: '周五', icon: '🌧️', high: 22, low: 16 },
  { date: '周六', icon: '⛈️', high: 20, low: 15 },
  { date: '周日', icon: '🌤️', high: 24, low: 17 },
]

const stats = [
  { label: '紫外线', value: '4 中等', desc: '建议涂抹防晒霜', icon: 'SunIcon' },
  { label: '湿度', value: '62%', desc: '露点目前为 16°', icon: 'DropletsIcon' },
  { label: '能见度', value: '15 km', desc: '视线非常清晰', icon: 'EyeIcon' },
  { label: '气压', value: '1012 hPa', desc: '正在缓慢下降', icon: 'GaugeIcon' }
]

// 模拟图标组件 (在实际项目中可使用 lucide-vue-next)
const SunIcon = { template: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>' }
const DropletsIcon = { template: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7c0-1.8 1.4-3.2 3.2-3.2C12.5 3.8 19 12 19 12s-7 9-10 9c-3 0-5.5-2.5-5.5-5.5 0-2 2-4 3.5-6.5Z"/></svg>' }
const EyeIcon = { template: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>' }
const GaugeIcon = { template: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>' }
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}

@keyframes pulse-slow {
  0%, 100% { opacity: 0.2; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(1.1); }
}
.animate-pulse {
  animation: pulse-slow 8s infinite;
}
</style>
