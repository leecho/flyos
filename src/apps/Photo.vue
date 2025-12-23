<template>
  <div class="photos-app flex h-full bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-hidden font-sans">

    <!-- 侧边导航 -->
    <div class="w-16 md:w-56 bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-xl border-r border-gray-200 dark:border-gray-800 flex flex-col">
      <div class="p-6 hidden md:block">
        <h2 class="text-xl font-bold tracking-tight">照片</h2>
      </div>

      <nav class="flex-1 px-3 space-y-1">
        <button
          v-for="item in navItems"
          :key="item.id"
          @click="currentTab = item.id"
          class="w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group"
          :class="currentTab === item.id ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'hover:bg-gray-200/50 dark:hover:bg-gray-800/50 text-gray-500 dark:text-gray-400'"
        >
          <component :is="item.icon" class="w-5 h-5 shrink-0" />
          <span class="ml-3 text-sm font-medium hidden md:inline">{{ item.name }}</span>
        </button>
      </nav>

      <div class="p-4 mt-auto">
        <div class="hidden md:block p-3 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/10">
          <p class="text-[10px] uppercase tracking-wider font-bold text-blue-500 mb-1">存储空间</p>
          <div class="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div class="h-full bg-blue-500 w-2/3"></div>
          </div>
          <p class="text-[10px] mt-2 opacity-50">12.4 GB / 20 GB</p>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- 顶栏 -->
      <header class="h-16 px-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white/80 dark:bg-gray-950/80 backdrop-blur-md z-10">
        <div class="flex items-center space-x-4">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
            <input
              type="text"
              placeholder="搜索照片、人物或地点..."
              class="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-none rounded-full text-sm w-48 md:w-80 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
            />
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <button class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <Plus class="w-5 h-5" />
          </button>
          <button class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <Settings class="w-5 h-5" />
          </button>
        </div>
      </header>

      <!-- 照片网格 -->
      <main class="flex-1 overflow-y-auto p-6 scroll-smooth">
        <div class="mb-8">
          <h3 class="text-sm font-bold opacity-40 uppercase tracking-widest mb-4">今天 - 2025年12月23日</h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            <div
              v-for="photo in photos"
              :key="photo.id"
              @click="openLightbox(photo)"
              class="aspect-square rounded-xl overflow-hidden cursor-pointer group relative active:scale-95 transition-all duration-300 shadow-sm hover:shadow-xl"
            >
              <img
                :src="photo.url"
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                alt="Photo"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                <p class="text-[10px] text-white font-medium truncate">{{ photo.location }}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- 灯箱预览 (Lightbox) -->
    <Transition name="fade">
      <div v-if="selectedPhoto" class="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col">
        <div class="h-16 px-6 flex items-center justify-between text-white">
          <div class="flex flex-col">
            <span class="text-sm font-bold">{{ selectedPhoto.location }}</span>
            <span class="text-[10px] opacity-50">{{ selectedPhoto.time }}</span>
          </div>
          <div class="flex items-center space-x-4">
            <button class="p-2 hover:bg-white/10 rounded-full transition-colors"><Heart class="w-5 h-5" /></button>
            <button class="p-2 hover:bg-white/10 rounded-full transition-colors"><Edit3 class="w-5 h-5" /></button>
            <button class="p-2 hover:bg-white/10 rounded-full transition-colors"><Trash2 class="w-5 h-5" /></button>
            <button @click="selectedPhoto = null" class="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X class="w-6 h-6" />
            </button>
          </div>
        </div>
        <div class="flex-1 relative flex items-center justify-center p-4">
          <img
            :src="selectedPhoto.url"
            class="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
          />
        </div>
        <div class="h-24 px-6 overflow-x-auto flex items-center space-x-2 justify-center py-4">
          <div
            v-for="p in photos"
            :key="'thumb-'+p.id"
            @click="selectedPhoto = p"
            class="h-full aspect-square rounded-md overflow-hidden cursor-pointer shrink-0 transition-all"
            :class="selectedPhoto.id === p.id ? 'ring-2 ring-blue-500 scale-110' : 'opacity-40 hover:opacity-100'"
          >
            <img :src="p.url" class="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </Transition>

    <!-- 动态磁贴演示组件 (隐藏在主应用内，仅用于代码参考) -->
    <!-- 实际磁贴通常渲染在桌面环境，此处作为 Preview 演示 -->
    <div class="fixed bottom-4 right-4 w-48 h-48 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800 z-50 group pointer-events-none md:pointer-events-auto">
      <div class="absolute inset-0 bg-gray-200 dark:bg-gray-800">
        <Transition name="slide-fade" mode="out-in">
          <div :key="currentTilePhotoIndex" class="absolute inset-0">
            <img :src="photos[currentTilePhotoIndex].url" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent p-4 flex flex-col justify-end">
              <p class="text-white text-xs font-bold">回忆</p>
              <p class="text-white/70 text-[10px]">{{ photos[currentTilePhotoIndex].location }}</p>
            </div>
          </div>
        </Transition>
      </div>
      <div class="absolute top-3 right-3 bg-white/20 backdrop-blur-md rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <Camera class="w-3 h-3 text-white" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, markRaw } from 'vue';
import {
  Image as ImageIcon,
  Heart,
  Folder,
  Trash2,
  Clock,
  Search,
  Plus,
  Settings,
  X,
  Edit3,
  Camera
} from 'lucide-vue-next';

const currentTab = ref('all');
const selectedPhoto = ref<any>(null);
const currentTilePhotoIndex = ref(0);
let tileInterval: any = null;

const navItems = [
  { id: 'all', name: '所有照片', icon: markRaw(ImageIcon) },
  { id: 'favorites', name: '收藏夹', icon: markRaw(Heart) },
  { id: 'albums', name: '相册', icon: markRaw(Folder) },
  { id: 'recent', name: '最近删除', icon: markRaw(Trash2) },
  { id: 'timeline', name: '时间轴', icon: markRaw(Clock) },
];

const photos = ref([
  { id: 1, url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80', location: '优胜美地国家公园', time: '10:24 AM' },
  { id: 2, url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80', location: '落基山脉', time: '11:15 AM' },
  { id: 3, url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=800&q=80', location: '森林步道', time: '02:30 PM' },
  { id: 4, url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80', location: '雾蒙蒙的山谷', time: '04:12 PM' },
  { id: 5, url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80', location: '瓦纳卡湖', time: '06:05 PM' },
  { id: 6, url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80', location: '红杉林', time: '昨天 09:00 AM' },
  { id: 7, url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=800&q=80', location: '乡村牧场', time: '昨天 03:20 PM' },
  { id: 8, url: 'https://images.unsplash.com/photo-1433086566608-5732f1683017?auto=format&fit=crop&w=800&q=80', location: '山间瀑布', time: '前天 11:45 AM' },
  { id: 9, url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80', location: '广阔农田', time: '3天前' },
  { id: 10, url: 'https://images.unsplash.com/photo-1475924156734-496f6acc671e?auto=format&fit=crop&w=800&q=80', location: '海边日落', time: '1周前' },
  { id: 11, url: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=800&q=80', location: '野花丛', time: '2周前' },
  { id: 12, url: 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?auto=format&fit=crop&w=800&q=80', location: '沙漠绿洲', time: '1个月前' },
]);

function openLightbox(photo: any) {
  selectedPhoto.value = photo;
}

onMounted(() => {
  // 动态磁贴轮播逻辑
  tileInterval = setInterval(() => {
    currentTilePhotoIndex.value = (currentTilePhotoIndex.value + 1) % photos.value.length;
  }, 5000);
});

onUnmounted(() => {
  if (tileInterval) clearInterval(tileInterval);
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 动态磁贴切换动画 */
.slide-fade-enter-active {
  transition: all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.slide-fade-leave-active {
  transition: all 0.8s cubic-bezier(0.4, 0, 1, 1);
}

.slide-fade-enter-from {
  transform: scale(1.2);
  opacity: 0;
}
.slide-fade-leave-to {
  transform: scale(0.9);
  opacity: 0;
}

/* 隐藏滚动条但保留功能 */
main::-webkit-scrollbar {
  width: 6px;
}
main::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}
.dark main::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
}
</style>
