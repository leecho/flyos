<template>
  <div class="app-store flex h-full text-black dark:text-white overflow-hidden bg-white/50 dark:bg-black/20">
    <!-- 侧边导航栏 -->
    <div class="w-48 border-r border-gray-400/20 flex flex-col p-4 gap-2 backdrop-blur-md bg-white/30 dark:bg-black/40">
      <div class="px-2 mb-4 text-xs font-bold opacity-50 uppercase tracking-wider">分类</div>
      <button
        v-for="cat in categories"
        :key="cat.id"
        @click="activeCategory = cat.id"
        :class="[
          'flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm',
          activeCategory === cat.id ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'hover:bg-white/20'
        ]"
      >
        <span class="text-lg">{{ cat.icon }}</span>
        {{ cat.name }}
      </button>
    </div>

    <!-- 主内容区 -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- 搜索与标题 -->
      <div class="p-6 flex items-center justify-between">
        <h2 class="text-2xl font-bold tracking-tight">应用商店</h2>
        <div class="relative w-64">
          <input
            type="text"
            placeholder="搜索应用..."
            class="w-full bg-white/40 dark:bg-black/40 border border-gray-400/20 rounded-full py-1.5 px-4 pl-10 text-sm outline-none focus:border-blue-500/50 transition-all"
          >
          <span class="absolute left-3 top-1.5 opacity-40">🔍</span>
        </div>
      </div>

      <!-- 滚动区域 -->
      <div class="flex-1 overflow-y-auto p-6 pt-0 custom-scrollbar">
        <!-- 重点推荐 Banner -->
        <div v-if="activeCategory === 'all'" class="mb-8 relative rounded-2xl overflow-hidden h-48 group cursor-pointer shadow-xl">
          <div class="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-400"></div>
          <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
          <div class="relative h-full flex flex-col justify-center px-8 text-white">
            <div class="text-xs font-bold bg-white/20 w-fit px-2 py-0.5 rounded mb-2">热门推荐</div>
            <div class="text-3xl font-black mb-1">Pixel Studio 2024</div>
            <div class="text-sm opacity-80 max-w-sm">专业的像素绘图工具，现已完美适配 FlyOS 触控手势。</div>
          </div>
        </div>

        <!-- 应用网格 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div
            v-for="app in filteredApps"
            :key="app.id"
            class="app-card group p-4 rounded-2xl border border-gray-400/10 bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 transition-all duration-300 flex flex-col"
          >
            <div class="flex gap-4 mb-4">
              <div :class="['w-14 h-14 rounded-xl shadow-lg flex items-center justify-center text-2xl', app.color]">
                {{ app.icon }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-bold truncate">{{ app.name }}</div>
                <div class="text-[11px] opacity-50 truncate">{{ app.dev }}</div>
                <div class="flex items-center gap-1 mt-1 text-orange-400 text-[10px]">
                  <span>★</span>
                  <span>{{ app.rating }}</span>
                </div>
              </div>
            </div>

            <!-- 安装按钮 -->
            <button
              @click="installApp(app.id)"
              :disabled="installState[app.id]?.status === 'installing'"
              :class="[
                'mt-auto w-full py-1.5 rounded-lg text-xs font-bold transition-all relative overflow-hidden',
                getButtonStyle(app.id)
              ]"
            >
              <!-- 进度条背景 -->
              <div
                v-if="installState[app.id]?.status === 'installing'"
                class="absolute left-0 top-0 h-full bg-blue-500/20 transition-all duration-300"
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

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'

const activeCategory = ref('all')

const categories = [
  { id: 'all', name: '全部', icon: '✨' },
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
  if (!state) return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500 hover:text-white'
  if (state.status === 'installing') return 'bg-gray-400/10 text-gray-500 cursor-not-allowed'
  if (state.status === 'installed') return 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
  return ''
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(128, 128, 128, 0.2);
  border-radius: 10px;
}
.app-card {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}
.app-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
</style>
