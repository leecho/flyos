<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { Sun, Cloud, CloudRain, CloudLightning, Snowflake, CloudFog, MapPin, Wind, Droplets } from 'lucide-vue-next';

interface Props {
  city?: string;
}

const props = withDefaults(defineProps<Props>(), {
  city: '上海'
});

const loading = ref(true);
const error = ref(false);
const weatherData = ref<any>(null);
const cityName = ref(props.city);

// LiveTile 轮播状态
const currentPageIndex = ref(0);
let timer: any = null;

async function fetchWeather() {
  try {
    loading.value = true;
    // 使用 Open-Meteo API
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=31.23&longitude=121.47&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`);
    const data = await res.json();
    weatherData.value = data;
    error.value = false;
  } catch (e) {
    error.value = true;
  } finally {
    loading.value = false;
  }
}

function startRotation() {
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    currentPageIndex.value = (currentPageIndex.value + 1) % 2;
  }, 5000);
}

onMounted(() => {
  fetchWeather();
  startRotation();
});

onUnmounted(() => clearInterval(timer));

// --- 渲染辅助 ---
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

const currentTemp = computed(() => Math.round(weatherData.value?.current_weather?.temperature || 0));
const weatherCode = computed(() => weatherData.value?.current_weather?.weathercode || 0);

const forecasts = computed(() => {
  if (!weatherData.value?.daily) return [];
  return weatherData.value.daily.time.slice(1, 5).map((time: string, i: number) => ({
    date: new Date(time).toLocaleDateString('zh-CN', { weekday: 'short' }),
    max: Math.round(weatherData.value.daily.temperature_2m_max[i+1]),
    min: Math.round(weatherData.value.daily.temperature_2m_min[i+1]),
    code: weatherData.value.daily.weathercode[i+1]
  }));
});
</script>

<template>
  <!-- 容器使用 container-type 以便子元素根据其尺寸调整布局 -->
  <div
    class="weather-tile-container relative w-full h-full overflow-hidden select-none text-white transition-all duration-700"
    :class="[weatherCode === 0 ? 'weather-bg-sunny' : 'weather-bg-cloudy']"
  >
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center">
      <div class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
    </div>

    <div v-else-if="weatherData" class="weather-content h-full w-full p-3">

      <!-- 1. 极致精简布局 (针对 small 尺寸) -->
      <div class="view-small hidden flex-col items-center justify-center h-full gap-1">
        <component :is="getWeatherIcon(weatherCode)" :size="20" />
        <span class="text-sm font-bold">{{ currentTemp }}°</span>
      </div>

      <!-- 2. 标准磁贴布局 (针对 medium 尺寸) -->
      <div class="view-medium hidden h-full flex-col justify-between">
        <Transition name="tile-flip" mode="out-in">
          <div v-if="currentPageIndex === 0" key="a" class="flex flex-col h-full justify-between">
            <div class="flex justify-between items-start">
              <component :is="getWeatherIcon(weatherCode)" :size="28" />
              <div class="text-right">
                <div class="text-xl font-medium leading-none">{{ currentTemp }}°</div>
                <div class="text-[9px] opacity-70">{{ getWeatherText(weatherCode) }}</div>
              </div>
            </div>
            <div class="text-[10px] flex items-center gap-1 opacity-90"><MapPin :size="10"/>{{ cityName }}</div>
          </div>
          <div v-else key="b" class="flex flex-col h-full justify-center gap-1.5">
            <div class="flex items-center gap-2 text-[10px]"><Wind :size="12" class="opacity-60"/>风速: {{ weatherData.current_weather.windspeed }}km/h</div>
            <div class="flex items-center gap-2 text-[10px]"><Droplets :size="12" class="opacity-60"/>湿度: 65%</div>
          </div>
        </Transition>
      </div>

      <!-- 3. 看板布局 (针对 large 尺寸) -->
      <div class="view-large hidden flex-col h-full">
        <div class="flex justify-between items-start mb-4">
          <div>
            <div class="text-sm font-bold flex items-center gap-1"><MapPin :size="12"/>{{ cityName }}</div>
            <div class="text-[10px] opacity-60">今日天气</div>
          </div>
          <div class="text-right">
            <div class="text-3xl font-thin leading-none">{{ currentTemp }}°</div>
            <div class="text-[10px] uppercase tracking-tighter">{{ getWeatherText(weatherCode) }}</div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2 mb-4">
          <div class="bg-white/10 rounded p-1.5 flex items-center gap-2">
            <Wind :size="14" />
            <span class="text-[10px]">{{ weatherData.current_weather.windspeed }} km/h</span>
          </div>
          <div class="bg-white/10 rounded p-1.5 flex items-center gap-2">
            <Droplets :size="14" />
            <span class="text-[10px]">65%</span>
          </div>
        </div>

        <div class="mt-auto pt-2 border-t border-white/10 flex justify-between">
          <div v-for="day in forecasts" :key="day.date" class="flex flex-col items-center">
            <span class="text-[9px] opacity-50 mb-1">{{ day.date }}</span>
            <component :is="getWeatherIcon(day.code)" :size="16" />
            <span class="text-[10px] font-bold mt-1">{{ day.max }}°</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* 使用容器查询 API 自动切换显示状态 */
.weather-tile-container {
  container-type: size;
}

/* 默认背景 */
.weather-bg-sunny { background: linear-gradient(135deg, #60a5fa, #2563eb); }
.weather-bg-cloudy { background: linear-gradient(135deg, #64748b, #334155); }

/* --- 尺寸适配逻辑 --- */

/* 当宽度和高度都较小时 (1x1) */
@container (max-width: 120px) {
  .view-small { display: flex; }
  .view-medium, .view-large { display: none !important; }
}

/* 当宽度适中，高度较小时 (2x1 或 2x2) */
@container (min-width: 121px) and (max-height: 180px) {
  .view-medium { display: flex; }
  .view-small, .view-large { display: none !important; }
}

/* 当宽度和高度都较大时 (2x2 以上) */
@container (min-width: 181px) and (min-height: 181px) {
  .view-large { display: flex; }
  .view-small, .view-medium { display: none !important; }
}

/* 动画效果 */
.tile-flip-enter-active, .tile-flip-leave-active {
  transition: all 0.5s ease;
}
.tile-flip-enter-from { opacity: 0; transform: translateY(10px); }
.tile-flip-leave-to { opacity: 0; transform: translateY(-10px); }
</style>
