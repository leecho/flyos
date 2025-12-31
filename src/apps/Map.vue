<template>
  <div class="w-full h-full bg-gray-100 dark:bg-gray-900 flex flex-col md:flex-row overflow-hidden">
    <!-- Sidebar -->
    <aside class="w-full md:w-80 h-full bg-white dark:bg-gray-800 dark:bg-opacity-80 backdrop-blur-sm flex-shrink-0 overflow-y-auto flex flex-col shadow-lg z-10">
      <div class="p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white bg-opacity-80 dark:bg-gray-800 dark:bg-opacity-80 backdrop-blur-md">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">位置</h3>
        <div class="relative mt-3">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索位置..."
            class="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-transparent focus:ring-2 focus:ring-accent focus:border-accent transition"
          >
          <i class="icofont-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
        </div>
      </div>
      <ul v-if="filteredLocations.length" class="flex-grow divide-y divide-gray-200 dark:divide-gray-700">
        <li
          v-for="location in filteredLocations"
          :key="location.id"
          @click="selectLocation(location)"
          class="p-4 cursor-pointer transition-colors duration-200"
          :class="selectedLocation?.id === location.id ? 'bg-accent/10' : 'hover:bg-gray-50 dark:hover:bg-gray-700 dark:hover:bg-opacity-50'"
        >
          <h4 class="font-semibold text-gray-800 dark:text-white">{{ location.name }}</h4>
          <p class="text-sm text-gray-500 dark:text-gray-400 truncate">{{ location.address }}</p>
        </li>
      </ul>
      <div v-else class="flex-grow flex items-center justify-center text-center text-gray-500">
        <div>
          <i class="icofont-not-found text-5xl"></i>
          <p class="mt-2">未找到任何位置。</p>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col bg-gray-200 dark:bg-gray-900 relative">
      <!-- Map Area -->
      <div class="flex-grow bg-cover bg-center" :style="{ backgroundImage: `url(${mapImage})` }">
        <!-- This is a placeholder for a real map library -->
        <div class="w-full h-full flex items-center justify-center backdrop-brightness-75">
          <div class="text-center text-white bg-black bg-opacity-50 p-6 rounded-xl">
             <i class="icofont-map text-6xl"></i>
             <h2 class="text-2xl font-bold mt-4">地图视图</h2>
             <p class="text-lg mt-1">交互式地图占位符</p>
          </div>
        </div>
      </div>
        <!-- Map controls -->
      <div class="absolute top-4 right-4 space-y-2">
          <button @click="recenterMap" class="p-3 rounded-full bg-white bg-opacity-80 dark:bg-gray-800 dark:bg-opacity-80 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-gray-700 transition">
              <i class="icofont-location-pin text-xl text-gray-800 dark:text-white"></i>
          </button>
      </div>


      <!-- Selected Location Info -->
      <transition name="slide-up">
        <div v-if="selectedLocation" class="absolute bottom-0 left-0 right-0 p-5 bg-white bg-opacity-80 dark:bg-gray-800 dark:bg-opacity-80 backdrop-blur-md rounded-t-2xl shadow-[0_-25px_50px_-12px_rgba(0,0,0,0.25)]">
           <button @click="selectedLocation = null" class="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
               <i class="icofont-close-line text-xl"></i>
           </button>
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ selectedLocation.name }}</h3>
          <div class="flex items-center text-gray-600 dark:text-gray-400 text-sm mb-4">
            <i class="icofont-tack-pin mr-2"></i>
            <span>{{ selectedLocation.address }}</span>
            <span class="mx-2">|</span>
            <i class="icofont-map-pins mr-2"></i>
            <span>{{ selectedLocation.coords.lat.toFixed(4) }}, {{ selectedLocation.coords.lng.toFixed(4) }}</span>
          </div>
          <p class="text-gray-700 dark:text-gray-300 leading-relaxed">{{ selectedLocation.description }}</p>
          <div class="mt-4 flex gap-4">
              <button class="px-5 py-2 bg-accent text-white rounded-lg font-semibold hover:bg-accent/90 transition-colors">导航</button>
              <button class="px-5 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">保存</button>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Location {
  id: number;
  name: string;
  address: string;
  coords: { lat: number; lng: number };
  description: string;
}

const mapImage = ref('https://images.pexels.com/photos/3972755/pexels-photo-3972755.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2');
const searchQuery = ref('');
const locations = ref<Location[]>([
  {
    id: 1,
    name: '埃菲尔铁塔',
    address: '法国巴黎战神广场, 5 Av. Anatole France, 75007',
    coords: { lat: 48.8584, lng: 2.2945 },
    description: '一座位于法国巴黎战神广场的镂空结构铁塔，以其设计师古斯塔夫·埃菲尔的名字命名。'
  },
  {
    id: 2,
    name: '自由女神像',
    address: '美国纽约州纽约市自由岛',
    coords: { lat: 40.6892, lng: -74.0445 },
    description: '一座位于美国纽约市纽约港自由岛上的巨型新古典主义雕塑。'
  },
  {
    id: 3,
    name: '罗马斗兽场',
    address: '意大利罗马斗兽场广场1号, 00184',
    coords: { lat: 41.8902, lng: 12.4922 },
    description: '位于意大利罗马市中心的椭圆形露天剧场，是古罗马时期建造的最大的圆形剧场。'
  },
  {
    id: 4,
    name: '悉尼歌剧院',
    address: '澳大利亚新南威尔士州悉尼市贝尼朗角',
    coords: { lat: -33.8568, lng: 151.2153 },
    description: '位于澳大利亚新南威尔士州悉尼港的多功能表演艺术中心，是20世纪最具特色和最著名的建筑之一。'
  }
]);

const selectedLocation = ref<Location | null>(null);

const filteredLocations = computed(() => {
  if (!searchQuery.value) {
    return locations.value;
  }
  return locations.value.filter(location =>
    location.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    location.address.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const selectLocation = (location: Location) => {
  selectedLocation.value = location;
  // 在真实地图中，您需要将视口移动到该位置的坐标
  console.log(`已选择 ${location.name}`);
};

const recenterMap = () => {
    selectedLocation.value = null;
    // 在真实地图中，您需要将地图视图重置为其初始状态
    console.log('地图已重置中心。');
}

</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.4s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #4a5568;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #718096;
}
</style>
