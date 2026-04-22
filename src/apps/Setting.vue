<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { themeStore, AccentColor } from '@/stores/themeStore';
import { userStore } from '@/stores/userStore';
import { desktopStore, setMode } from '@/stores/desktopStore';
import Wallpaper1 from '@/assets/wallpaper.jpg';
import Wallpaper2 from '@/assets/wallpaper2.jpg';
import Wallpaper3 from '@/assets/wallpaper3.jpg';
import { useNotification } from '../composables/useNotification';
import { startTask } from '../stores/taskStore';
import { getAppById } from '../stores/appStore';
import { ChevronLeft } from 'lucide-vue-next';

const props = defineProps<{
  params?: any
}>()

const wallpapers = [
  { name: '风景', url: Wallpaper1 },
  { name: '插画', url: Wallpaper2 },
  { name: '暗黑', url: Wallpaper3 },
];

const { push } = useNotification()

/**
 * 预设图标库
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

const navItems = [
  { id: 'system', label: '系统设置', icon: icons.system },
  { id: 'user', label: '账户信息', icon: icons.user },
  { id: 'display', label: '显示与桌面', icon: icons.display },
  { id: 'network', label: '网络与连接', icon: icons.network },
  { id: 'about', label: '关于 FlyOS', icon: icons.about },
];

const currentCategory = ref('display');
const mobileView = ref<'sidebar' | 'detail'>('sidebar');

watch(() => props.params, (newValue) => {
  if(newValue?.category){
    currentCategory.value = newValue.category
    mobileView.value = 'detail'
  }
},{ deep: true , immediate: true})

const activeCategoryLabel = computed(() => {
  return navItems.find(item => item.id === currentCategory.value)?.label || '设置';
});

const themeColors: { name: string; hex: string; value: AccentColor }[] = [
  { name: '蓝色', hex: '#3b82f6', value: 'blue' },
  { name: '紫色', hex: '#8b5cf6', value: 'purple' },
  { name: '粉色', hex: '#ec4899', value: 'pink' },
  { name: '橙色', hex: '#f97316', value: 'orange' },
  { name: '青色', hex: '#14b8a6', value: 'teal' },
];

onMounted(() => {
  push({
    title: '系统通知',
    content: '已进入 FlyOS 偏好设置',
    appName: '设置',
    type: 'info',
    duration: 3000,
  })
})

</script>

<template>
  <div class="settings-app @container flex h-full bg-[var(--fly-bg-primary)] text-[var(--fly-text-primary)] font-sans overflow-hidden">

    <!-- 侧边导航栏 -->
    <div class="border-r border-[var(--fly-border-system)] bg-[var(--fly-bg-secondary)] flex-col p-4 space-y-2 overflow-y-auto shrink-0 w-full @2xl:w-64"
         :class="mobileView === 'sidebar' ? 'flex' : 'hidden @2xl:flex'">
      
      <div class="flex items-center gap-3 px-3 py-6 mb-4">
        <img :src="userStore.user.avatar" class="w-10 h-10 rounded-xl border-2 border-accent/20 object-cover shadow-sm" />
        <div class="min-w-0">
          <h2 class="text-sm font-bold truncate tracking-tight">{{ userStore.user.name }}</h2>
          <p class="text-[10px] opacity-40 truncate uppercase font-medium tracking-wider">FlyOS 用户</p>
        </div>
      </div>

      <button
        v-for="item in navItems"
        :key="item.id"
        @click="currentCategory = item.id; mobileView = 'detail'"
        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--fly-radius-md)] transition-all duration-200 group relative"
        :class="currentCategory === item.id
          ? 'bg-accent/10 text-accent font-bold'
          : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-60 hover:opacity-100'"
      >
        <span v-if="currentCategory === item.id" class="absolute left-0 w-1 h-4 bg-accent rounded-full"></span>
        <div class="flex-shrink-0" v-html="item.icon"></div>
        <span class="text-[13px] tracking-tight">{{ item.label }}</span>
      </button>
    </div>

    <!-- 主内容区 -->
    <div class="flex-1 flex flex-col min-w-0"
         :class="mobileView === 'detail' ? 'flex' : 'hidden @2xl:flex'">
      
      <header class="h-16 flex items-center px-4 @2xl:px-8 border-b border-[var(--fly-border-system)] shrink-0">
        <button @click="mobileView = 'sidebar'" class="@2xl:hidden p-2 -ml-2 mr-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
          <ChevronLeft class="w-6 h-6" />
        </button>
        <h2 class="text-lg font-bold tracking-tight opacity-90">{{ activeCategoryLabel }}</h2>
      </header>

      <div class="flex-1 overflow-y-auto p-4 @2xl:p-8 no-scrollbar">
        <div class="max-w-full @2xl:max-w-3xl mx-auto space-y-8 animate-in">

          <!-- 个人账户 -->
          <section v-if="currentCategory === 'user'" class="space-y-6">
            <div class="flex flex-col @xs:flex-row items-center gap-6 p-2">
              <img :src="userStore.user.avatar" class="w-20 h-20 rounded-[var(--fly-radius-lg)] shadow-xl border-4 border-[var(--fly-border-glass)] object-cover" />
              <div class="text-center @xs:text-left">
                <h2 class="text-2xl font-extrabold tracking-tight">{{ userStore.user.name }}</h2>
                <p class="text-[11px] font-bold text-accent uppercase tracking-widest mt-1">系统管理员</p>
                <div class="mt-4 flex gap-2">
                  <button class="px-4 py-1.5 bg-accent text-white text-[11px] font-bold rounded-lg shadow-lg shadow-accent/20 transition-all active:scale-95">编辑资料</button>
                  <button class="px-4 py-1.5 bg-[var(--fly-border-system)] text-[11px] font-bold rounded-lg transition-all">安全设置</button>
                </div>
              </div>
            </div>

            <div class="bg-[var(--fly-bg-glass)] rounded-[var(--fly-radius-md)] p-6 border border-[var(--fly-border-glass)] shadow-sm">
              <div class="flex flex-col @xs:flex-row items-center justify-between gap-4">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-xl bg-gray-500/10 flex items-center justify-center text-gray-500" v-html="icons.lock"></div>
                  <div>
                    <div class="text-sm font-bold">屏幕自动锁定</div>
                    <div class="text-[11px] text-[var(--fly-text-secondary)]">离开电脑后自动进入保护状态</div>
                  </div>
                </div>
                <button
                  @click="userStore.user.locked = !userStore.user.locked"
                  class="px-5 py-2 rounded-lg text-[11px] font-bold uppercase transition-all"
                  :class="userStore.user.locked ? 'bg-rose-500 text-white' : 'bg-accent/10 text-accent'"
                >
                  {{ userStore.user.locked ? '已锁定' : '立即锁定' }}
                </button>
              </div>
            </div>
          </section>

          <!-- 外观设置 -->
          <section v-if="currentCategory === 'display'" class="space-y-8">
            <!-- 系统主题 -->
            <div class="space-y-4">
              <h3 class="text-[11px] font-bold opacity-40 uppercase tracking-widest px-1">外观模式</h3>
              <div class="grid grid-cols-1 @xs:grid-cols-3 gap-4">
                <div
                  v-for="mode in ['light', 'dark', 'system']"
                  :key="mode"
                  @click="themeStore.setTheme(mode as any)"
                  class="p-4 rounded-[var(--fly-radius-md)] border-2 cursor-pointer transition-all flex flex-col items-center gap-3 group bg-[var(--fly-bg-secondary)]"
                  :class="themeStore.mode.value === mode ? 'border-accent' : 'border-transparent opacity-60 hover:opacity-100'"
                >
                  <div class="w-8 h-8 flex items-center justify-center" v-html="mode === 'dark' ? icons.moon : icons.display"></div>
                  <span class="text-[10px] font-black uppercase tracking-wider">{{ mode === 'light' ? '浅色' : mode === 'dark' ? '深色' : '跟随系统' }}</span>
                </div>
              </div>
            </div>

            <!-- 主题色 -->
            <div class="space-y-4">
              <h3 class="text-[11px] font-bold opacity-40 uppercase tracking-widest px-1">强调色</h3>
              <div class="flex flex-wrap gap-4">
                <button
                  v-for="color in themeColors"
                  :key="color.name"
                  @click="themeStore.setAccentColor(color.value)"
                  class="w-10 h-10 rounded-full transition-all hover:scale-110 active:scale-95 flex items-center justify-center relative shadow-sm"
                  :class="{ 'ring-2 ring-offset-2 ring-accent scale-110': themeStore.accentColor.value === color.value }"
                  :style="{ backgroundColor: color.hex }"
                >
                  <svg v-if="themeStore.accentColor.value === color.value" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </button>
              </div>
            </div>

            <!-- 壁纸选择 -->
            <div class="space-y-4">
              <h3 class="text-[11px] font-bold opacity-40 uppercase tracking-widest px-1">桌面壁纸</h3>
              <div class="grid grid-cols-1 @xs:grid-cols-3 gap-4">
                <div
                  v-for="wallpaper in wallpapers"
                  :key="wallpaper.name"
                  @click="themeStore.setWallpaper(wallpaper.url)"
                  class="aspect-video rounded-[var(--fly-radius-md)] overflow-hidden cursor-pointer transition-all border-2"
                  :class="themeStore.wallpaper.value === wallpaper.url ? 'border-accent' : 'border-transparent opacity-80 hover:opacity-100'"
                >
                  <img :src="wallpaper.url" class="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </section>

          <!-- 关于 -->
          <section v-if="currentCategory === 'about'" class="space-y-6">
            <div class="glass-effect rounded-[var(--fly-radius-lg)] p-8 @2xl:p-12 text-center space-y-6">
              <div class="w-20 h-20 bg-accent rounded-3xl mx-auto shadow-2xl flex items-center justify-center text-white scale-125 mb-4">
                 <div v-html="icons.about" class="scale-150"></div>
              </div>
              <div>
                <h2 class="text-3xl font-black tracking-tighter">FlyOS Pro</h2>
                <p class="text-[var(--fly-text-secondary)] font-medium mt-1">版本 1.1 (2026 Stable Build)</p>
              </div>
              <div class="flex flex-col @xs:flex-row gap-3 justify-center pt-4">
                <button class="px-8 py-2.5 bg-accent text-white rounded-xl text-[11px] font-black shadow-lg shadow-accent/20">检查更新</button>
                <button class="px-8 py-2.5 bg-[var(--fly-border-system)] rounded-xl text-[11px] font-black">开源许可</button>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-in {
  animation: slideUp 0.4s cubic-bezier(0.2, 1, 0.3, 1) forwards;
}
</style>
