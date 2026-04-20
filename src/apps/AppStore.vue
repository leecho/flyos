<script setup lang="ts">
  import { ref, computed, reactive, markRaw } from 'vue'
  import { Sparkles, AppWindow, Gamepad2, Wrench, Search } from 'lucide-vue-next'
  
  const activeCategory = ref('all')
  
  const categories = [
    { id: 'all', name: '探索', icon: markRaw(Sparkles) },
    { id: 'app', name: '应用', icon: markRaw(AppWindow) },
    { id: 'game', name: '游戏', icon: markRaw(Gamepad2) },
    { id: 'tool', name: '工具', icon: markRaw(Wrench) },
  ]
  
  const storeApps = [
    { id: 'chat', name: '飞聊 FlyChat', dev: 'FlySoft', icon: '💬', color: 'bg-blue-500', rating: 4.8, type: 'app' },
    { id: 'music', name: '云听音乐', dev: 'SoundWave', icon: '🎵', color: 'bg-purple-500', rating: 4.5, type: 'app' },
    { id: 'pixel', name: 'PixelHero', dev: 'IndieGame', icon: '⚔️', color: 'bg-red-500', rating: 4.9, type: 'game' },
    { id: 'code', name: 'VS Code Web', dev: 'Microsoft', icon: '💻', color: 'bg-sky-600', rating: 4.7, type: 'tool' },
    { id: 'draw', name: '画板', dev: 'FlySoft', icon: '🎨', color: 'bg-amber-400', rating: 4.2, type: 'tool' },
    { id: 'mail', name: 'FlyMail', dev: 'FlySoft', icon: '✉️', color: 'bg-emerald-500', rating: 4.4, type: 'app' },
    { id: 'todo', name: 'FlyTodo', dev: 'Leecho', icon: '✔️', color: 'bg-indigo-500', rating: 4.6, type: 'app' },
    { id: 'translate', name: '飞译 Translate', dev: 'Leecho', icon: '🌐', color: 'bg-cyan-500', rating: 4.3, type: 'tool' },
  ]
  
  const filteredApps = computed(() => {
    if (activeCategory.value === 'all') return storeApps
    return storeApps.filter(a => a.type === activeCategory.value)
  })
  
  const installState = reactive<Record<string, { status: string, progress: number }>>({})
  
  const installApp = (id: string) => {
    if (installState[id]?.status === 'installed') return
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
    if (state.status === 'installing') return `${state.progress}%`
    if (state.status === 'installed') return '打开'
    return '获取'
  }
  
  const getButtonStyle = (id: string) => {
    const state = installState[id]
    if (!state) return 'bg-accent text-white hover:brightness-110 shadow-lg shadow-accent/20'
    if (state.status === 'installing') return 'bg-slate-200 dark:bg-white/10 text-slate-500'
    if (state.status === 'installed') return 'bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10'
    return ''
  }
</script>

<template>
  <div class="app-store-container h-full flex flex-col bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-slate-100 font-sans overflow-hidden">
    <div class="app-store-layout-wrapper flex-1 flex overflow-hidden min-h-0 relative">
      
      <!-- Desktop Sidebar -->
      <aside class="store-sidebar w-64 border-r border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-gray-900/50 backdrop-blur-md flex flex-col p-4 shrink-0 overflow-y-auto">
        <div class="flex items-center gap-3 px-3 py-6 mb-4">
          <div class="w-10 h-10 rounded-2xl bg-accent shadow-lg shadow-accent/20 flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          </div>
          <div class="min-w-0">
            <h2 class="text-sm font-black tracking-tight">应用商店</h2>
            <p class="text-[10px] opacity-50 font-medium tracking-wider uppercase">FlyOS Store</p>
          </div>
        </div>
        <nav class="flex-1 space-y-1">
          <button v-for="cat in categories" :key="cat.id" @click="activeCategory = cat.id"
            class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group relative"
            :class="activeCategory === cat.id ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'hover:bg-slate-200/50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 font-medium'">
            <component :is="cat.icon" class="w-4.5 h-4.5 flex-shrink-0" />
            <span class="text-[13px] font-bold">{{ cat.name }}</span>
          </button>
        </nav>
      </aside>

      <!-- Main Content Area -->
      <main class="store-main flex-1 flex flex-col min-w-0 bg-white/20 dark:bg-transparent overflow-hidden">
        <header class="h-16 flex items-center justify-between px-6 border-b border-slate-200/40 dark:border-white/5 backdrop-blur-md sticky top-0 z-10 shrink-0">
          <h2 class="text-base font-black tracking-tight mobile-title hidden truncate mr-4">{{ categories.find(c => c.id === activeCategory)?.name }}</h2>
          <div class="relative w-full max-w-xs ml-auto">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="搜索应用与游戏..."
              class="w-full bg-slate-100/50 dark:bg-white/5 border border-transparent rounded-full py-2 pl-10 pr-4 text-[13px] outline-none focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-accent/20 transition-all font-medium">
          </div>
        </header>

        <div class="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth custom-scrollbar">
          <!-- Banner -->
          <div v-if="activeCategory === 'all'" class="store-banner mb-8 relative rounded-3xl overflow-hidden h-48 sm:h-64 group cursor-pointer shadow-2xl shadow-accent/10 shrink-0">
            <div class="absolute inset-0 bg-accent brightness-90 transition-all duration-500"></div>
            <div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
            <div class="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-[100px] animate-pulse"></div>
            <div class="relative h-full flex flex-col justify-end px-6 sm:px-10 py-6 sm:py-10 text-white">
              <div class="text-[9px] sm:text-[10px] font-black bg-white/20 backdrop-blur-md w-fit px-2 py-0.5 rounded uppercase tracking-[0.2em] mb-2 sm:mb-4">热门精选</div>
              <div class="text-2xl sm:text-4xl font-black mb-1 sm:mb-2 tracking-tighter leading-none">Pixel Studio 2024</div>
              <div class="text-[11px] sm:text-sm opacity-90 max-w-md font-medium leading-relaxed line-clamp-2">专业的像素绘图工具，现已完美适配 FlyOS 触控手势。</div>
            </div>
          </div>

          <div class="mb-5 flex items-center justify-between">
            <h3 class="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">发现更多</h3>
          </div>

          <!-- Apps Grid -->
          <div class="store-grid">
            <div v-for="app in filteredApps" :key="app.id" class="app-card border border-slate-200/60 dark:border-white/5 shadow-sm hover:shadow-xl hover:scale-[1.02]">
              <div class="app-card-icon" :class="[app.color]">{{ app.icon }}</div>
              <div class="app-card-body">
                <div class="app-info">
                  <div class="app-name">{{ app.name }}</div>
                  <div class="app-dev">{{ app.dev }}</div>
                </div>
                <div class="app-actions">
                  <div v-if="app.rating" class="app-rating">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/></svg>
                    <span>{{ app.rating }}</span>
                  </div>
                  <button @click="installApp(app.id)" :disabled="installState[app.id]?.status === 'installing'"
                    class="get-button" :class="[getButtonStyle(app.id)]">
                    <div v-if="installState[app.id]?.status === 'installing'" class="install-progress" :style="{ width: installState[app.id]?.progress + '%' }"></div>
                    <span class="relative z-10">{{ getButtonText(app.id) }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Bottom Nav (Mobile Only) -->
      <nav class="store-bottom-nav absolute bottom-0 left-0 right-0 h-16 bg-white/80 dark:bg-gray-900/90 backdrop-blur-2xl border-t border-slate-200 dark:border-white/10 flex items-center justify-around px-2 z-20 hidden">
        <button v-for="cat in categories" :key="cat.id" @click="activeCategory = cat.id"
          class="flex flex-col items-center gap-1 transition-all flex-1 py-1"
          :class="activeCategory === cat.id ? 'text-accent scale-105' : 'text-slate-400'">
          <component :is="cat.icon" class="w-5 h-5 flex-shrink-0" />
          <span class="text-[10px] font-black tracking-tight">{{ cat.name }}</span>
        </button>
      </nav>
    </div>
  </div>
</template>

<style scoped>
.app-store-container {
  container-type: inline-size;
  container-name: app-store;
}

/* Grid System */
.store-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
  padding-bottom: 5rem;
}

/* Base Card Style */
.app-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 1.25rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.dark .app-card {
  background: rgba(255, 255, 255, 0.05);
}

.app-card-icon {
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  border-radius: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  box-shadow: 0 8px 16px -4px rgba(0,0,0,0.1);
}

.app-card-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 64px;
}

.app-name {
  font-weight: 800;
  font-size: 14px;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.app-dev {
  font-size: 10px;
  font-weight: 700;
  opacity: 0.5;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.app-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.app-rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 10px;
  font-weight: 900;
  color: #f59e0b;
}

.get-button {
  padding: 0.35rem 1rem;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 900;
  min-width: 68px;
  position: relative;
  overflow: hidden;
  transition: all 0.2s;
}

.install-progress {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: rgba(255, 255, 255, 0.25);
  transition: width 0.3s;
}

/* Container Queries */

/* Tablet & Intermediate */
@container app-store (max-width: 800px) {
  .store-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Phone / Very Small Window */
@container app-store (max-width: 500px) {
  .store-sidebar {
    display: none !important;
  }
  .store-bottom-nav {
    display: flex !important;
  }
  .mobile-title {
    display: block !important;
  }
  
  .store-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    padding-bottom: 6rem;
  }
  
  .app-card {
    flex-direction: column;
    align-items: stretch;
    height: auto;
    text-align: center;
    padding: 0.75rem;
    gap: 0.75rem;
  }
  
  .app-card-icon {
    width: 80px !important;
    height: 80px !important;
    margin: 0 auto !important;
    font-size: 2rem !important;
  }
  
  .app-card-body {
    height: auto;
    gap: 0.5rem;
  }
  
  .app-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .get-button {
    width: 100%;
  }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(155, 155, 155, 0.2);
  border-radius: 10px;
}
</style>