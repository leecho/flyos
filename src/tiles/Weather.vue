<template>
  <div class="w-full h-full relative group">
    <!-- 加载状态 -->
    <div v-if="loading" class="w-full h-full flex items-center justify-center">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
    </div>

    <!-- 错误处理 -->
    <div v-else-if="error" class="w-full h-full flex items-center justify-center p-2 text-[10px]">
      数据获取失败
    </div>

    <!-- 天气展示 -->
    <LiveTile v-else :items="displayPages" :interval="6000" animationType="slide-up">
      <template #default="{ item }">
        <!-- 页面 1: 当前实时天气 -->
        <div v-if="item.type === 'current'" class="w-full h-full p-3 flex flex-col justify-between items-center bg-gradient-to-br from-blue-400/20 to-transparent">
          <div class="flex flex-col items-center mt-2">
            <component :is="getWeatherIcon(item.data.weathercode)" :size="48" class="text-yellow-300 drop-shadow-md" />
            <span class="text-3xl font-light mt-1">{{ Math.round(item.data.temperature) }}°</span>
          </div>
          <div class="text-center pb-4">
            <p class="text-[10px] font-bold tracking-wider opacity-90 uppercase">{{ cityName }}</p>
            <p class="text-[9px] opacity-70">{{ getWeatherText(item.data.weathercode) }}</p>
          </div>
        </div>

        <!-- 页面 2: 未来预报 -->
        <div v-else class="w-full h-full p-3 flex flex-col justify-center space-y-2 bg-white/5">
          <div v-for="(day, index) in item.data" :key="index" class="flex items-center justify-between border-b border-white/10 pb-1 last:border-0">
            <span class="text-[10px] w-8">{{ formatDay(day.date) }}</span>
            <component :is="getWeatherIcon(day.code)" :size="14" class="text-blue-200" />
            <span class="text-[10px] font-medium w-10 text-right">{{ Math.round(day.min) }}° / {{ Math.round(day.max) }}°</span>
          </div>
        </div>
      </template>

      <!-- 叠加层：更新时间 -->
      <template #overlay>
        <div class="absolute top-2 right-2 opacity-30">
          <RefreshCw :size="10" @click="fetchWeather" class="cursor-pointer hover:rotate-180 transition-transform duration-500" />
        </div>
      </template>
    </LiveTile>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Sun, Cloud, CloudRain, CloudLightning, Snowflake, CloudFog, RefreshCw } from 'lucide-vue-next';
import LiveTile from '../components/LiveTile.vue';

// --- 状态管理 ---
const loading = ref(true);
const error = ref(false);
const cityName = ref('当前位置');
const weatherData = ref<any>(null);

// --- 模拟坐标（实际可使用 navigator.geolocation） ---
const lat = 31.23; // 上海
const lon = 121.47;

// --- 获取数据 ---
async function fetchWeather() {
  loading.value = true;
  error.value = false;
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`
    );
    const data = await response.json();
    weatherData.value = data;
  } catch (e) {
    error.value = true;
    console.error('Weather Fetch Error:', e);
  } finally {
    loading.value = false;
  }
}

// --- 数据格式化 ---
const displayPages = computed(() => {
  if (!weatherData.value) return [];

  // 构造页面 1：当前
  const currentPage = {
    type: 'current',
    data: weatherData.value.current_weather
  };

  // 构造页面 2：预报 (取前 3 天)
  const forecastPage = {
    type: 'forecast',
    data: weatherData.value.daily.time.slice(1, 4).map((time: string, i: number) => ({
      date: time,
      max: weatherData.value.daily.temperature_2m_max[i+1],
      min: weatherData.value.daily.temperature_2m_min[i+1],
      code: weatherData.value.daily.weathercode[i+1]
    }))
  };

  return [currentPage, forecastPage];
});

// --- 辅助函数 ---
function getWeatherIcon(code: number) {
  if (code <= 1) return Sun;
  if (code <= 3) return Cloud;
  if (code <= 48) return CloudFog;
  if (code <= 67) return CloudRain;
  if (code <= 77) return Snowflake;
  if (code <= 99) return CloudLightning;
  return Cloud;
}

function getWeatherText(code: number) {
  const map: Record<number, string> = {
    0: '晴朗', 1: '晴间多云', 2: '多云', 3: '阴天',
    45: '雾', 48: '雾', 51: '毛毛雨', 61: '小雨',
    71: '小雪', 80: '阵雨', 95: '雷阵雨'
  };
  return map[code] || '多云';
}

function formatDay(dateStr: string) {
  const date = new Date(dateStr);
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return days[date.getDay()];
}

onMounted(() => {
  fetchWeather();
});
</script>

<style scoped>
.drop-shadow-md {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}
</style>
