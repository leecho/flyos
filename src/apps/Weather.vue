<script setup lang="ts">
import { ref, onMounted, watch, computed, shallowRef, onUnmounted } from 'vue'
import { 
  Plus, Trash2, MapPin, X, Search, Wind, Droplets, 
  Sun, Moon, CloudSun, CloudMoon, Cloud, Cloudy, Haze, CloudRain, 
  CloudDrizzle, CloudSnow, Snowflake, CloudLightning, HelpCircle,
  Menu as MenuIcon, ChevronLeft
} from 'lucide-vue-next'

// --- TYPES ---
interface City {
  id: number
  name: string
  region: string
  country: string
  latitude: number
  longitude: number
  isCurrentLocation?: boolean
}

interface WeatherData {
  current: {
    temperature: number
    weatherCode: number
    windSpeed: number,
    humidity: number,
    isDay: number,
  }
  daily: {
    time: string[]
    weatherCode: number[]
    temperatureMax: number[]
    temperatureMin: number[]
  },
  hourly: {
    time: string[],
    temperature: number[],
    weatherCode: number[],
  }
}

// --- STATE ---
const cities = ref<City[]>([])
const activeCity = ref<City | null>(null)
const weatherData = ref<WeatherData | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const showAddCityModal = ref(false)
const newCityName = ref('')
const searchResults = ref<any[]>([])
const isSearching = ref(false)

const containerRef = ref<HTMLElement | null>(null)
const containerWidth = ref(1000)
const mobileView = ref<'list' | 'weather'>('weather')

const isMobile = computed(() => containerWidth.value < 650)

// --- LIFECYCLE ---
const updateSize = () => {
  if (containerRef.value) containerWidth.value = containerRef.value.offsetWidth
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (containerRef.value) {
    resizeObserver = new ResizeObserver(updateSize)
    resizeObserver.observe(containerRef.value)
    updateSize()
  }

  loadCitiesFromLocalStorage()
  if (cities.value.length === 0) {
    getUserLocation()
  } else {
    setActiveCity(cities.value[0])
  }
})

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect()
})

// --- WATCHERS ---
watch(activeCity, (newCity) => {
  if (newCity) {
    fetchWeatherData(newCity)
  }
})

// --- API & DATA HANDLING ---
function getUserLocation() {
  loading.value = true
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords
      const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
      const data = await res.json()
      const currentLocation: City = {
        id: Date.now(),
        name: data.city || 'Current Location',
        region: data.principalSubdivision,
        country: data.countryName,
        latitude,
        longitude,
        isCurrentLocation: true
      }
      cities.value.unshift(currentLocation)
      setActiveCity(currentLocation)
      saveCitiesToLocalStorage()
    },
    (err) => {
      error.value = "无法获取您的位置。请允许位置访问权限或手动添加城市。"
      loading.value = false
    }
  )
}

async function fetchWeatherData(city: City) {
  loading.value = true
  error.value = null
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`)
    const data = await res.json()
    if (data.error) {
      throw new Error(data.reason)
    }
    weatherData.value = {
      current: {
        temperature: Math.round(data.current.temperature_2m),
        weatherCode: data.current.weather_code,
        windSpeed: Math.round(data.current.wind_speed_10m),
        humidity: data.current.relative_humidity_2m,
        isDay: data.current.is_day,
      },
      daily: {
        time: data.daily.time,
        weatherCode: data.daily.weather_code,
        temperatureMax: data.daily.temperature_2m_max.map(Math.round),
        temperatureMin: data.daily.temperature_2m_min.map(Math.round),
      },
      hourly: {
        time: data.hourly.time.slice(0, 24).map((t: string) => new Date(t).getHours() + ':00'),
        temperature: data.hourly.temperature_2m.slice(0, 24).map(Math.round),
        weatherCode: data.hourly.weather_code.slice(0, 24),
      }
    }
  } catch (e: any) {
    error.value = `无法加载天气数据: ${e.message}`
    weatherData.value = null
  } finally {
    loading.value = false
  }
}

async function searchCity() {
  if (newCityName.value.trim().length < 2) {
    searchResults.value = []
    return
  }
  isSearching.value = true
  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(newCityName.value)}&count=5&language=en&format=json`)
    const data = await res.json()
    searchResults.value = data.results || []
  } catch (e) {
    console.error("城市搜索失败:", e)
  } finally {
    isSearching.value = false
  }
}

// --- CITY MANAGEMENT ---
function addCity(cityData: any) {
  const newCity: City = {
    id: cityData.id,
    name: cityData.name,
    region: cityData.admin1 || '',
    country: cityData.country,
    latitude: cityData.latitude,
    longitude: cityData.longitude,
  }
  if (!cities.value.some(c => c.id === newCity.id)) {
    cities.value.push(newCity)
    saveCitiesToLocalStorage()
    setActiveCity(newCity)
  }
  closeModal()
}

function removeCity(cityToRemove: City) {
  cities.value = cities.value.filter(c => c.id !== cityToRemove.id)
  saveCitiesToLocalStorage()
  if (activeCity.value?.id === cityToRemove.id) {
    setActiveCity(cities.value.length > 0 ? cities.value[0] : null)
    if (cities.value.length === 0) {
      getUserLocation()
    }
  }
}

function setActiveCity(city: City | null) {
  if (city) {
    activeCity.value = city
    if (isMobile.value) {
      mobileView.value = 'weather'
    }
  }
}

function closeModal() {
  showAddCityModal.value = false
  newCityName.value = ''
  searchResults.value = []
}

// --- LOCAL STORAGE ---
function saveCitiesToLocalStorage() {
  localStorage.setItem('weather_cities', JSON.stringify(cities.value))
}

function loadCitiesFromLocalStorage() {
  const savedCities = localStorage.getItem('weather_cities')
  if (savedCities) {
    cities.value = JSON.parse(savedCities)
  }
}

// --- COMPUTED & HELPERS ---
function getWeatherIcon(code: number, isDay?: number | null) {
    const day = isDay === null || isDay === undefined ? true : isDay === 1;
    switch (code) {
        case 0: return day ? Sun : Moon;
        case 1: return day ? CloudSun : CloudMoon;
        case 2: return day ? Cloudy : Cloud;
        case 3: return Cloud;
        case 45: case 48: return Haze;
        case 51: case 53: case 55: return CloudDrizzle;
        case 56: case 57: return CloudDrizzle; 
        case 61: case 63: case 65: return CloudRain;
        case 66: case 67: return CloudRain; 
        case 71: case 73: case 75: return Snowflake;
        case 77: return CloudSnow;
        case 80: case 81: case 82: return CloudRain; 
        case 85: case 86: return CloudSnow; 
        case 95: case 96: case 99: return CloudLightning;
        default: return HelpCircle;
    }
}

const weatherInterpretation = computed(() => {
  if (!weatherData.value) return { text: '', icon: HelpCircle }
  const { weatherCode, isDay } = weatherData.value.current;
  let text = '未知';
   switch (weatherCode) {
        case 0: text = '晴天'; break;
        case 1: text = '大部晴朗'; break;
        case 2: text = '局部多云'; break;
        case 3: text = '阴天'; break;
        case 45: case 48: text = '雾'; break;
        case 51: case 53: case 55: text = '毛毛雨'; break;
        case 56: case 57: text = '冻毛毛雨'; break;
        case 61: case 63: case 65: text = '雨'; break;
        case 66: case 67: text = '冻雨'; break;
        case 71: case 73: case 75: text = '雪'; break;
        case 77: text = '米雪'; break;
        case 80: case 81: case 82: text = '阵雨'; break;
        case 85: case 86: text = '阵雪'; break;
        case 95: text = '雷暴'; break;
        case 96: case 99: text = '雷暴伴有冰雹'; break;
    }
    return { text, icon: getWeatherIcon(weatherCode, isDay) };
})

const backgroundClass = computed(() => {
  if (!weatherData.value) return 'bg-gray-400';
  const code = weatherData.value.current.weatherCode;
  const isDay = weatherData.value.current.isDay;
  
  if (isDay) {
    if ([0, 1].includes(code)) return 'bg-gradient-to-br from-sky-400 to-blue-600'; 
    if ([2, 3].includes(code)) return 'bg-gradient-to-br from-slate-400 to-gray-600'; 
    if (code >= 51 && code <= 67) return 'bg-gradient-to-br from-slate-500 to-gray-700'; 
    if (code >= 71) return 'bg-gradient-to-br from-slate-300 to-gray-500'; 
  } else {
    if ([0, 1].includes(code)) return 'bg-gradient-to-br from-gray-800 to-blue-900'; 
    return 'bg-gradient-to-br from-gray-800 to-gray-900'; 
  }
  return 'bg-gradient-to-br from-slate-400 to-gray-600';
});
</script>

<template>
  <div ref="containerRef" class="weather-app h-full w-full flex text-white overflow-hidden transition-colors duration-500 border-0" :class="backgroundClass">
    
    <!-- City List Sidebar -->
    <div 
      class="sidebar bg-black/20 backdrop-blur-md p-4 flex flex-col h-full border-r border-white/10 shrink-0 transition-all duration-300"
      v-if="!isMobile || mobileView === 'list'"
      :class="isMobile ? 'w-full' : 'w-64'"
    >
      <button @click="showAddCityModal = true" class="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 rounded-lg py-2 mb-4 transition-colors">
        <Plus :size="16" /> 添加城市
      </button>
      <div class="flex-1 overflow-y-auto -mr-2 pr-2 custom-scrollbar">
        <div v-for="city in cities" :key="city.id" 
             @click="setActiveCity(city)"
             class="p-3 rounded-lg cursor-pointer mb-2 transition-colors flex justify-between items-center"
             :class="activeCity?.id === city.id ? 'bg-white/20' : 'hover:bg-white/10'">
          <div>
            <p class="font-semibold flex items-center gap-1">
              <MapPin v-if="city.isCurrentLocation" :size="14" />
              {{ city.name }}
            </p>
            <p class="text-xs opacity-70">{{ city.country }}</p>
          </div>
          <button @click.stop="removeCity(city)" class="p-1 rounded-full hover:bg-red-500/50 opacity-50 hover:opacity-100 transition-opacity">
             <Trash2 :size="16" />
          </button>
        </div>
      </div>
    </div>

    <!-- Main Weather Display -->
    <div 
      class="flex-1 overflow-y-auto"
      v-if="!isMobile || mobileView === 'weather'"
    >
      <div v-if="loading" class="flex items-center justify-center h-full">
        <p class="opacity-50">正在加载天气数据...</p>
      </div>
      <div v-else-if="error" class="flex items-center justify-center h-full p-4 text-center">
        <p class="bg-red-500/50 p-4 rounded-lg">{{ error }}</p>
      </div>
      <div v-else-if="activeCity && weatherData" class="p-6 lg:p-8">
        <!-- Dashboard Header (Mobile only) -->
        <div v-if="isMobile" class="flex justify-between items-center mb-6">
          <button @click="mobileView = 'list'" class="p-2 -ml-2 hover:bg-white/10 rounded-lg transition-colors">
            <MenuIcon :size="20" />
          </button>
          <button @click="showAddCityModal = true" class="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <Plus :size="20" />
          </button>
        </div>

        <!-- Current Weather -->
        <div class="mb-8 text-center md:text-left">
          <h2 class="text-3xl font-bold">{{ activeCity.name }}</h2>
          <div class="flex justify-center md:justify-start items-end gap-4 mt-2">
            <p class="text-8xl font-thin tracking-tighter leading-none">{{ weatherData.current.temperature }}°</p>
            <p class="text-2xl opacity-80 pb-2">{{ weatherInterpretation.text }}</p>
          </div>
        </div>

        <!-- Hourly Forecast -->
        <div class="mb-8 bg-black/20 backdrop-blur-md rounded-xl p-4">
            <h3 class="font-semibold text-sm mb-3 opacity-80 border-b border-white/10 pb-2 uppercase tracking-wider">每小时预报</h3>
            <div class="flex overflow-x-auto -mx-4 px-4 pb-2 no-scrollbar gap-2">
              <div v-for="(temp, i) in weatherData.hourly.temperature" :key="i" class="flex flex-col items-center flex-shrink-0 w-16 text-center py-2 rounded-lg hover:bg-white/5 transition-colors">
                <p class="text-[10px] opacity-60 uppercase">{{ weatherData.hourly.time[i] }}</p>
                <component :is="getWeatherIcon(weatherData.hourly.weatherCode[i])" class="w-8 h-8 my-2 text-white" />
                <p class="font-bold">{{ temp }}°</p>
              </div>
            </div>
        </div>
        
        <!-- 7-Day Forecast & Details Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="bg-black/20 backdrop-blur-md rounded-xl p-4">
              <h3 class="font-semibold text-sm mb-3 opacity-80 border-b border-white/10 pb-2 uppercase tracking-wider">7天预报</h3>
              <div class="space-y-3">
                <div v-for="i in 7" :key="i" class="flex items-center justify-between text-sm py-1">
                  <p class="w-1/3">{{ i === 1 ? '今天' : new Date(weatherData.daily.time[i-1]).toLocaleDateString('zh-CN', { weekday: 'long' }) }}</p>
                  <div class="w-1/3 flex justify-center">
                    <component :is="getWeatherIcon(weatherData.daily.weatherCode[i-1])" class="w-7 h-7 text-white" />
                  </div>
                  <div class="w-1/3 text-right">
                    <span class="font-bold mr-2">{{ weatherData.daily.temperatureMax[i-1] }}°</span>
                    <span class="opacity-40 text-xs">{{ weatherData.daily.temperatureMin[i-1] }}°</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-black/20 backdrop-blur-md rounded-xl p-6 space-y-6">
                <div class="flex items-center gap-5">
                  <Wind :size="24" class="text-white/50" />
                  <div>
                    <p class="text-xs opacity-60">风速</p>
                    <p class="text-xl font-bold">{{ weatherData.current.windSpeed }} <span class="text-xs font-normal opacity-40">km/h</span></p>
                  </div>
                </div>
                <div class="flex items-center gap-5">
                  <Droplets :size="24" class="text-white/50" />
                  <div>
                    <p class="text-xs opacity-60">湿度</p>
                    <p class="text-xl font-bold">{{ weatherData.current.humidity }} <span class="text-xs font-normal opacity-40">%</span></p>
                  </div>
                </div>
                <div class="flex items-center gap-5 pt-2">
                  <component :is="weatherData.current.isDay ? Sun : Moon" :size="24" class="text-white/50"/>
                  <div>
                    <p class="text-xs opacity-60">今日气温</p>
                    <p class="text-lg font-bold">
                       {{ weatherData.daily.temperatureMax[0] }}° <span class="mx-1 opacity-20">/</span> <span class="text-sm opacity-60">{{ weatherData.daily.temperatureMin[0] }}°</span>
                    </p>
                  </div>
                </div>
            </div>
        </div>

      </div>
    </div>
    
    <!-- Add City Modal -->
    <transition name="fade">
        <div v-if="showAddCityModal" class="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click="closeModal">
          <div class="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" @click.stop>
            <div class="p-5 border-b border-white/5 flex justify-between items-center">
              <h2 class="text-lg font-bold">添加城市</h2>
              <button @click="closeModal" class="p-1 hover:bg-white/10 rounded-full transition-colors"><X :size="18"/></button>
            </div>
            <div class="p-5">
              <div class="relative">
                <input type="text" v-model="newCityName" @input="searchCity" placeholder="搜索城市..." class="w-full bg-gray-700/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all">
                <Search :size="18" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"/>
              </div>
            </div>
            <div class="px-5 pb-5 h-64 overflow-y-auto custom-scrollbar">
              <div v-if="isSearching" class="text-center p-4 opacity-50 text-sm">正在加载结果...</div>
              <div v-else-if="searchResults.length > 0" class="space-y-1">
                <div v-for="result in searchResults" :key="result.id" @click="addCity(result)" class="p-3 rounded-xl hover:bg-white/10 cursor-pointer transition-colors border border-transparent hover:border-white/5">
                  <p class="font-bold">{{ result.name }}</p>
                  <p class="text-xs opacity-40">{{ result.admin1 ? `${result.admin1}, ` : '' }}{{ result.country }}</p>
                </div>
              </div>
               <div v-else-if="newCityName" class="text-center p-4 opacity-50 text-sm">未找到相关城市</div>
            </div>
          </div>
        </div>
    </transition>
  </div>
</template>

<style scoped>
.weather-app {
  container-type: inline-size;
  container-name: weather-app;
  user-select: none;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
