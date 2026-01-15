<script setup lang="ts">
import { ref, computed } from 'vue';
import { themeStore, AccentColor } from '@/stores/themeStore';
import { userStore } from '@/stores/userStore';
import { desktopStore, setMode } from '@/stores/desktopStore';
import Wallpaper1 from '@/assets/wallpaper.jpg';
import Wallpaper2 from '@/assets/wallpaper2.jpg';
import Wallpaper3 from '@/assets/wallpaper3.jpg';

const wallpapers = [
  { name: '风景', url: Wallpaper1 },
  { name: '插画', url: Wallpaper2 },
  { name: '暗黑', url: Wallpaper3 },
];

/**
 * 预设 SVG 图标库 (同步之前的视觉风格)
 */
const icons = {
  system: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>`,
  user: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>`,
  display: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>`,
  network: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" /></svg>`,
  about: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>`,
  lock: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>`,
  moon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>`
};

/**
 * 导航菜单配置
 */
const navItems = [
  { id: 'system', label: '系统设置', icon: icons.system },
  { id: 'user', label: '账户信息', icon: icons.user },
  { id: 'display', label: '显示与桌面', icon: icons.display },
  { id: 'network', label: '网络与连接', icon: icons.network },
  { id: 'about', label: '关于 FlyOS', icon: icons.about },
];

const currentCategory = ref('display');

const activeCategoryLabel = computed(() => {
  return navItems.find(item => item.id === currentCategory.value)?.label || '设置';
});

/**
 * 个性化配置选项
 */
const themeColors: { name: string; hex: string; value: AccentColor }[] = [
  { name: '蓝色', hex: '#3b82f6', value: 'blue' },
  { name: '紫色', hex: '#8b5cf6', value: 'purple' },
  { name: '粉色', hex: '#ec4899', value: 'pink' },
  { name: '橙色', hex: '#f97316', value: 'orange' },
  { name: '青色', hex: '#14b8a6', value: 'teal' },
];

// 本地临时亮度控制
const brightness = ref(80);
</script>

<template>
  <div class="settings-app @container flex h-full bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-xl text-gray-900 dark:text-gray-100 font-sans overflow-hidden">

    <!-- 侧边导航栏 -->
    <div class="hidden @[600px]:flex w-64 border-r border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex-col p-4 space-y-2 overflow-y-auto">
      <!-- 用户简略信息 -->
      <div class="flex items-center gap-3 px-3 py-4 mb-4 ">
        <img :src="userStore.user.avatar" class="w-10 h-10 rounded-full border-2 border-accent/50 object-cover shadow-sm" />
        <div class="min-w-0">
          <h2 class="text-xs font-bold truncate">{{ userStore.user.name }}</h2>
          <p class="text-[10px] opacity-50 truncate">FlyOS Pro 认证</p>
        </div>
      </div>

      <button
        v-for="item in navItems"
        :key="item.id"
        @click="currentCategory = item.id"
        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative"
        :class="currentCategory === item.id
          ? 'bg-white/60 dark:bg-white/10 shadow-sm text-accent dark:text-accent'
          : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100'"
      >
        <span v-if="currentCategory === item.id" class="absolute left-0 w-1 h-4 bg-accent rounded-full"></span>
        <div class="flex-shrink-0" v-html="item.icon"></div>
        <span class="text-[13px] font-semibold tracking-tight">{{ item.label }}</span>
      </button>
    </div>

    <!-- 主内容区 -->
    <div class="flex-1 flex flex-col min-w-0 pt-5 border-gray-100 dark:border-gray-800 ">
      <header class="h-16 flex items-center px-8 border-b border-gray-200/30 dark:border-gray-800/30">
        <h2 class="text-[20px] font-black uppercase tracking-widest opacity-80">{{ activeCategoryLabel }}</h2>
      </header>

      <div class="flex-1 overflow-y-auto p-4 @[600px]:p-8 custom-scrollbar">
        <div class="max-w-full @[900px]:max-w-3xl mx-auto space-y-8 animate-in">

          <!-- 系统设置 -->
          <section v-if="currentCategory === 'system'" class="space-y-6">
            
          </section>

          <!-- 账户信息 -->
          <section v-if="currentCategory === 'user'" class="space-y-6">
            <div class="flex flex-col @[400px]:flex-row items-center gap-8 p-2">
              <div class="relative group">
                <img :src="userStore.user.avatar" class="w-24 h-24 rounded-[2rem] shadow-2xl border-4 border-white dark:border-gray-800 object-cover" />
                <div class="absolute inset-0 bg-black/40 rounded-[2rem] opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                  <div class="text-white scale-125" v-html="icons.user"></div>
                </div>
              </div>
              <div>
                <h2 class="text-2xl font-black tracking-tight text-center @[400px]:text-left">{{ userStore.user.name }}</h2>
                <p class="text-[11px] font-bold text-accent uppercase tracking-widest mt-1 text-center @[400px]:text-left">FlyOS Administrator</p>
                <div class="mt-4 flex gap-2">
                  <button class="px-5 py-2 bg-accent hover:bg-accent/90 text-white text-[11px] font-black rounded-xl shadow-lg shadow-accent/30 transition-all active:scale-95">编辑资料</button>
                  <button class="px-5 py-2 bg-gray-200 dark:bg-white/10 text-[11px] font-black rounded-xl transition-all">安全设置</button>
                </div>
              </div>
            </div>

            <div class="bg-white/40 dark:bg-white/5 rounded-2xl p-6 border border-white/20 dark:border-white/10">
              <div class="flex flex-col @[400px]:flex-row items-center justify-between">
                <div class="flex items-center gap-4 mb-4 @[400px]:mb-0">
                  <div class="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500" v-html="icons.lock"></div>
                  <div>
                    <div class="text-sm font-bold">系统锁定状态</div>
                    <div class="text-[11px] opacity-50">锁定后需要密码或生物识别才能进入</div>
                  </div>
                </div>
                <button
                  @click="userStore.user.locked = !userStore.user.locked"
                  class="px-5 py-2 rounded-xl text-[11px] font-black uppercase transition-all"
                  :class="userStore.user.locked ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'bg-emerald-500/10 text-emerald-500'"
                >
                  {{ userStore.user.locked ? '已锁定' : '立即锁定' }}
                </button>
              </div>
            </div>
          </section>

          <!-- 显示与桌面 -->
          <section v-if="currentCategory === 'display'" class="space-y-6">
            <div class="bg-white/40 dark:bg-white/5 rounded-2xl p-6 border border-white/20 dark:border-white/10 shadow-sm">
              <h3 class="text-[11px] font-bold mb-5 opacity-40 uppercase tracking-widest">个性化体验</h3>
              <div class="space-y-6">
                <!-- 亮色/深色模式切换 -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500" v-html="icons.moon"></div>
                    <div>
                      <div class="text-sm font-bold">深色模式</div>
                      <div class="text-[11px] opacity-50">降低屏幕亮度，减轻眼睛疲劳</div>
                    </div>
                  </div>
                  <div
                    @click="themeStore.setTheme(themeStore.mode.value === 'dark' ? 'light' : 'dark')"
                    class="w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-500"
                    :class="themeStore.mode.value === 'dark' ? 'bg-accent' : 'bg-gray-300 dark:bg-gray-700'"
                  >
                    <div class="w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-500" :style="{ transform: themeStore.mode.value === 'dark' ? 'translateX(24px)' : 'translateX(0)' }"></div>
                  </div>
                </div>

                <!-- 亮度调节 -->
                <div class="space-y-3">
                  <div class="flex justify-between text-[11px] font-bold opacity-60">
                    <span>屏幕亮度</span>
                    <span>{{ brightness }}%</span>
                  </div>
                  <input type="range" v-model="brightness" class="w-full accent-accent" />
                </div>
              </div>
            </div>

            <div class="bg-white/40 dark:bg-white/5 rounded-2xl p-6 border border-white/20 dark:border-white/10 shadow-sm">
              <h3 class="text-[11px] font-bold mb-5 opacity-40 uppercase tracking-widest">更换壁纸</h3>
              <div class="grid grid-cols-3 gap-4">
                <div
                  v-for="wallpaper in wallpapers"
                  :key="wallpaper.name"
                  @click="themeStore.setWallpaper(wallpaper.url)"
                  class="aspect-video rounded-lg overflow-hidden cursor-pointer transition-all hover:scale-105"
                  :class="{ 'ring-4 ring-accent': themeStore.wallpaper.value === wallpaper.url }"
                >
                  <img :src="wallpaper.url" class="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            <div class="bg-white/40 dark:bg-white/5 rounded-2xl p-6 border border-white/20 dark:border-white/10 shadow-sm">
              <h3 class="text-[11px] font-bold mb-5 opacity-40 uppercase tracking-widest">系统强调色</h3>
              <div class="flex flex-wrap gap-4">
                <button
                  v-for="color in themeColors"
                  :key="color.name"
                  @click="themeStore.setAccentColor(color.value)"
                  class="w-10 h-10 rounded-full transition-all duration-150 hover:scale-110 active:scale-95 flex items-center justify-center relative shadow-md"
                  :class="{ 'ring-4 ring-white/30 shadow-xl scale-110': themeStore.accentColor.value === color.value }"
                  :style="{ backgroundColor: color.hex }"
                >
                  <svg v-if="themeStore.accentColor.value === color.value" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </button>
              </div>
            </div>
            <div class="bg-white/40 dark:bg-white/5 rounded-2xl p-6 border border-white/20 dark:border-white/10 shadow-sm">
              <h3 class="text-[11px] font-bold mb-5 opacity-40 uppercase tracking-widest">UI 布局模式</h3>
              <div class="grid grid-cols-1 @[400px]:grid-cols-2 gap-4">
                <div
                  @click="setMode('desktop')"
                  class="p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center gap-3 group"
                  :class="desktopStore.mode === 'desktop' ? 'border-accent bg-accent/5' : 'border-transparent bg-black/5'"
                >
                  <div class="w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform" v-html="icons.display"></div>
                  <div class="text-[12px] font-black uppercase tracking-wider">标准桌面</div>
                </div>
                <div
                  @click="setMode('metro')"
                  class="p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center gap-3 group"
                  :class="desktopStore.mode === 'metro' ? 'border-accent bg-accent/5' : 'border-transparent bg-black/5'"
                >
                  <div class="w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                  </div>
                  <div class="text-[12px] font-black uppercase tracking-wider">磁贴矩阵</div>
                </div>
              </div>
            </div>
          </section>

          <!-- 关于 -->
          <section v-if="currentCategory === 'about'" class="space-y-6">
            <div class="bg-gradient-to-br from-accent/70 via-accent to-purple-700 rounded-[2.5rem] p-6 @[400px]:p-10 text-white relative overflow-hidden shadow-2xl shadow-accent/20">
              <div class="relative z-10">
                <div class="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest mb-4">Core Edition</div>
                <h2 class="text-3xl @[400px]:text-4xl font-black tracking-tighter mb-2">FlyOS Pro</h2>
                <p class="opacity-70 text-sm font-medium mb-8">Next-generation workspace for creators.</p>
                <div class="flex flex-col @[400px]:flex-row gap-4">
                  <button class="px-8 py-2.5 bg-white text-accent rounded-2xl text-[11px] font-black shadow-xl hover:scale-105 active:scale-95 transition-all">检查更新</button>
                  <button class="px-8 py-2.5 bg-white/20 backdrop-blur-md text-white rounded-2xl text-[11px] font-black hover:bg-white/30 transition-all">支持中心</button>
                </div>
              </div>
              <div class="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-[100px] animate-pulse"></div>
            </div>
          </section>

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

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-in {
  animation: slideUp 0.6s cubic-bezier(0.2, 1, 0.3, 1) forwards;
}
</style>
