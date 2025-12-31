<script setup lang="ts">
import { ref, computed, reactive } from 'vue'

const activeCategory = ref('all')

const categories = [
  { id: 'all', name: '探索', icon: '✨' },
  { id: 'app', name: '应用', icon: '📱' },
  { id: 'game', name: '游戏', icon: '🎮' },
  { id: 'tool', name: '工具', icon: '🛠️' },
]

const storeApps = [
  { id: 'chat', name: '飞聊 FlyChat', dev: 'FlySoft', icon: '💬', color: 'bg-blue-500', rating: 4.8, type: 'app' },
  { id: 'music', name: '云听音乐', dev: 'SoundWave', icon: '🎵', color: 'bg-purple-500', rating: 4.5, type: 'app' },
  { id: 'pixel', name: 'PixelHero', dev: 'IndieGame', icon: '⚔️', color: 'bg-red-500', rating: 4.9, type: 'game' },
  { id: 'code', name: 'VS Code Web', dev: 'Microsoft', icon: '💻', color: 'bg-sky-600', rating: 4.7, type: 'tool' },
  { id: 'draw', name: '画板', dev: 'FlySoft', icon: '🎨', color: 'bg-amber-400', rating: 4.2, type: 'tool' },
  { id: 'mail', name: 'FlyMail', dev: 'FlySoft', icon: '✉️', color: 'bg-emerald-500', rating: 4.4, type: 'app' },
]

const filteredApps = computed(() => {
  if (activeCategory.value === 'all') return storeApps
  return storeApps.filter(a => a.type === activeCategory.value)
})

// 状态管理：idle, installing, installed
const installState = reactive<Record<string, { status: string, progress: number }>>({})

const installApp = (id: string) => {
  if (installState[id]?.status === 'installed') {
    // Logic to open app can be added here
    return
  }

  installState[id] = { status: 'installing', progress: 0 }

  const timer = setInterval(() => {
    if(!installState[id]) return
    if (installState[id].progress < 100) {
      installState[id].progress += Math.floor(Math.random() * 20) + 5
      if (installState[id].progress > 100) installState[id].progress = 100
    } else {
      clearInterval(timer)
      installState[id].status = 'installed'
    }
  }, 400)
}

const getButtonText = (id: string) => {
  const state = installState[id]
  if (!state) return '获取'
  if (state.status === 'installing') return `安装中 ${state.progress}%`
  if (state.status === 'installed') return '打开'
  return '获取'
}

const getButtonStyle = (id: string) => {
  const state = installState[id]
  if (!state) return 'bg-accent/10 text-accent hover:bg-accent hover:text-white dark:text-accent'
  if (state.status === 'installing') return 'bg-gray-200 dark:bg-white/10 text-gray-500 cursor-not-allowed'
  if (state.status === 'installed') return 'bg-emerald-500/10 text-emerald-500'
  return ''
}
</script>

<template>
  <div class="settings-app flex h-full bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-xl text-gray-900 dark:text-gray-100 font-sans overflow-hidden">

    <!-- 侧边导航栏 -->
    <div class="w-64 border-r border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex flex-col p-4 space-y-2 overflow-y-auto">
      <div class="flex items-center gap-3 px-3 py-4 mb-4">
        <div class="w-10 h-10 rounded-full border-2 border-accent/50 object-cover shadow-sm bg-accent flex items-center justify-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
        </div>
        <div class="min-w-0">
          <h2 class="text-xs font-bold truncate">应用商店</h2>
          <p class="text-[10px] opacity-50 truncate">发现新应用与游戏</p>
        </div>
      </div>

      <button
        v-for="cat in categories"
        :key="cat.id"
        @click="activeCategory = cat.id"
        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative"
        :class="activeCategory === cat.id
          ? 'bg-white/60 dark:bg-white/10 shadow-sm text-accent dark:text-accent'
          : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100'"
      >
        <span v-if="activeCategory === cat.id" class="absolute left-0 w-1 h-4 bg-accent rounded-full"></span>
        <div class="flex-shrink-0 w-6 text-center text-lg">{{ cat.icon }}</div>
        <span class="text-[13px] font-semibold tracking-tight">{{ cat.name }}</span>
      </button>
    </div>

    <!-- 主内容区 -->
    <div class="flex-1 flex flex-col min-w-0">
      <header class="h-16 flex items-center justify-end px-8 border-b border-gray-200/30 dark:border-gray-800/30">
        <div class="relative w-64">
          <input
            type="text"
            placeholder="搜索应用..."
            class="w-full bg-white/40 dark:bg-black/40 border border-transparent rounded-xl py-2 px-4 pl-10 text-sm outline-none focus:border-accent/50 transition-all"
          >
          <svg class="absolute left-3 top-2.5 opacity-40" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </div>
      </header>

      <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <!-- 重点推荐 Banner -->
        <div v-if="activeCategory === 'all'" class="mb-8 relative rounded-3xl overflow-hidden h-56 group cursor-pointer shadow-2xl shadow-accent/20">
          <div class="absolute inset-0 bg-gradient-to-r from-accent/80 to-accent"></div>
           <div class="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-[100px] animate-pulse"></div>
          <div class="relative h-full flex flex-col justify-end px-8 py-6 text-white">
            <div class="text-xs font-bold bg-white/10 backdrop-blur-sm w-fit px-2 py-1 rounded-md mb-3 uppercase tracking-wider">热门精选</div>
            <div class="text-3xl font-black mb-1 tracking-tighter">Pixel Studio 2024</div>
            <div class="text-sm opacity-80 max-w-sm font-medium">专业的像素绘图工具，现已完美适配 FlyOS 触控手势。</div>
          </div>
        </div>

        <!-- 应用网格 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          <div
            v-for="app in filteredApps"
            :key="app.id"
            class="group bg-white/40 dark:bg-white/5 rounded-2xl p-5 border border-white/20 dark:border-white/10 shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
          >
            <div class="flex items-center gap-4 mb-4">
              <div :class="['w-14 h-14 rounded-xl shadow-lg flex-shrink-0 flex items-center justify-center text-3xl', app.color]">
                {{ app.icon }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-bold truncate text-sm">{{ app.name }}</div>
                <div class="text-xs opacity-60 truncate">{{ app.dev }}</div>
                <div v-if="app.rating" class="flex items-center gap-1 mt-1 text-yellow-500 text-xs font-bold">\
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/></svg>
                  <span>{{ app.rating }}</span>
                </div>
              </div>
            </div>

            <button
              @click="installApp(app.id)"
              :disabled="installState[app.id]?.status === 'installing'"
              :class="['mt-2 w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all relative overflow-hidden', getButtonStyle(app.id)]"
            >
              <div
                v-if="installState[app.id]?.status === 'installing'"
                class="absolute left-0 top-0 h-full bg-accent/20 transition-all duration-300"
                :style="{ width: installState[app.id]?.progress + '%' }"
              ></div>
              <span class="relative z-10">
                {{ getButtonText(app.id) }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(155, 155, 155, 0.2);
  border-radius: 10px;
}
</style>
