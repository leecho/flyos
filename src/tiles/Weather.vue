<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { 
  WifiOff, Wind, Droplets, Sun, CloudSun, Cloud, Haze, 
  CloudRain, Snowflake, CloudLightning, HelpCircle 
} from 'lucide-vue-next';

// --- STATE ---
const weather = ref<any>(null)
const loading = ref(true)
const error = ref<string | null>(null)

// --- API & DATA FETCHING ---
onMounted(() => {
  fetchWeatherData()
})

function fetchWeatherData() {
  loading.value = true
  error.value = null

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords
      try {
        const [weatherRes, locationRes] = await Promise.all([
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`),
          fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
        ])

        if (!weatherRes.ok || !locationRes.ok) {
          throw new Error('Failed to fetch data')
        }

        const weatherData = await weatherRes.json()
        const locationData = await locationRes.json()

        if (weatherData.error) {
          throw new Error(weatherData.reason)
        }

        weather.value = {
          city: locationData.city || 'Current Location',
          country: locationData.countryName,
          temp: Math.round(weatherData.current.temperature_2m),
          weatherCode: weatherData.current.weather_code,
          windSpeed: Math.round(weatherData.current.wind_speed_10m),
          humidity: weatherData.current.relative_humidity_2m,
          tempMax: Math.round(weatherData.daily.temperature_2m_max[0]),
          tempMin: Math.round(weatherData.daily.temperature_2m_min[0]),
        }
      } catch (e: any) {
        error.value = '无法加载天气'
        console.error(e)
      } finally {
        loading.value = false
      }
    },
    (err) => {
      error.value = '请允许位置访问'
      loading.value = false
    }
  )
}

// --- COMPUTED & HELPERS ---
const weatherInterpretation = computed(() => {
  if (!weather.value) return { text: '', icon: HelpCircle }
  const code = weather.value.weatherCode;
  let text = '未知';
  let icon: any = HelpCircle;

  switch (code) {
    case 0: text = '晴天'; icon = Sun; break;
    case 1: text = '大部晴朗'; icon = CloudSun; break;
    case 2: text = '局部多云'; icon = Cloud; break;
    case 3: text = '阴天'; icon = Cloud; break;
    case 45: case 48: text = '雾'; icon = Haze; break;
    default:
        if (code >= 51 && code <= 67) { text = '雨'; icon = CloudRain; }
        else if (code >= 71 && code <= 86) { text = '雪'; icon = Snowflake; }
        else if (code >= 95) { text = '雷暴'; icon = CloudLightning; }
        break;
  }
   return { text, icon };
})

const backgroundClass = computed(() => {
  if (!weather.value) return 'weather-bg-cloudy' // Default background
  const code = weather.value.weatherCode
  return (code >= 0 && code <= 1) ? 'weather-bg-sunny' : 'weather-bg-cloudy'
});

</script>

<template>
  <div class="h-full w-full p-4 flex flex-col text-white transition-colors duration-500"
       :class="backgroundClass">
    
    <!-- Loading State -->
    <div v-if="loading" class="m-auto flex flex-col items-center justify-center text-center">
      <p class="text-sm">正在加载天气...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="m-auto flex flex-col items-center justify-center text-center">
        <WifiOff class="mb-2 opacity-70" :size="32"/>
        <p class="font-semibold">{{ error }}</p>
    </div>

    <!-- Content: Three distinct views for different sizes -->
    <template v-else-if="weather">
      <!-- View for 1x1 tile (Small) -->
      <div class="view-small h-full flex-col items-center justify-center text-center">
          <component :is="weatherInterpretation.icon" :size="64" class="opacity-90" />
          <p class="text-5xl font-light">{{ weather.temp }}°</p>
          <p class="text-sm font-semibold mt-1 leading-tight">{{ weather.city }}</p>
      </div>

      <!-- View for 2x1 tile (Medium) -->
      <div class="view-medium h-full w-full flex-col justify-between">
        <div class="flex justify-between items-start">
            <div>
                <p class="font-bold text-lg leading-tight">{{ weather.city }}</p>
                <p class="text-sm opacity-80">{{ weatherInterpretation.text }}</p>
            </div>
            <component :is="weatherInterpretation.icon" :size="28" class="text-white" />
        </div>
        <div class="flex justify-between items-end">
            <p class="text-sm opacity-80">H:{{ weather.tempMax }}° L:{{ weather.tempMin }}°</p>
            <p class="text-5xl font-thin leading-none">{{ weather.temp }}°</p>
        </div>
      </div>

      <!-- View for 2x2 tile (Large) -->
      <div class="view-large h-full w-full flex-col justify-between">
           <!-- Top Part -->
            <div class="flex justify-between items-start">
                <div>
                    <p class="font-bold text-2xl leading-tight">{{ weather.city }}</p>
                    <p class="text-lg opacity-80">{{ weatherInterpretation.text }}</p>
                </div>
                <div class="flex justify-center items-center">
                <component :is="weatherInterpretation.icon" :size="48" class="opacity-90" />
            </div>
                
            </div>

            <!-- Middle Part -->
            <div class="flex justify-center items-center">
              <p class="text-7xl font-thin">{{ weather.temp }}°</p>
            </div>

            <!-- Bottom Part -->
            <div class="flex justify-between items-end text-sm w-full">
                
                <div class="flex items-center gap-2">
                    <Droplets :size="16" class="opacity-80" />
                    <span>{{ weather.humidity }} %</span>
                </div>
                <div class="text-right">
                    <p>H: {{ weather.tempMax }}° L: {{ weather.tempMin }}°</p>
                </div>
            </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.weather-bg-sunny { background: linear-gradient(135deg, #60a5fa, #2563eb); }
.weather-bg-cloudy { background: linear-gradient(135deg, #64748b, #334155); }

/* Hide all views by default */
.view-small, .view-medium, .view-large {
    display: none;
}

/* 
  Show the correct view based on the class provided by the parent Tile.vue,
  which is determined by the tile's `size` property in appStore.ts.
*/
.tile-small .view-small,
.tile-medium .view-medium,
.tile-large .view-large {
    display: flex;
}
</style>
