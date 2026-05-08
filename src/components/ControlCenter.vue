<script setup lang="ts">
import { computed } from 'vue';
import { desktopStore, setMode } from '../stores/desktopStore';
import { themeStore } from '../stores/themeStore';
import { userStore } from '../stores/userStore';
import { useNotification } from '../composables/useNotification';
import { useFullscreen } from '../composables/useFullscreen';
import { 
  LayoutDashboardIcon, 
  Grid2X2Icon, 
  MoonIcon, 
  SunIcon, 
  MaximizeIcon, 
  MinimizeIcon, 
  LockIcon, 
  Trash2Icon,
  BellIcon
} from 'lucide-vue-next';
import { uiStore, toggleControlCenter } from '../stores/uiStore';
import logoUrl from '../assets/logo.svg';

const { notifications, clearAll, remove } = useNotification();
const { isFullscreen, toggleFullscreen } = useFullscreen();

// 将内部状态映射到全局 uiStore
const isOpen = computed(() => uiStore.controlCenterVisible);
const toggleOpen = () => toggleControlCenter();

defineExpose({ toggleOpen, isOpen });

const handleToggleMode = () => {
  setMode(desktopStore.mode === 'desktop' ? 'metro' : 'desktop');
};

const handleToggleTheme = () => {
  themeStore.setTheme(themeStore.mode.value === 'dark' ? 'light' : 'dark');
};

const handleLock = () => {
  userStore.user.locked = true;
  uiStore.controlCenterVisible = false;
};
</script>

<template>
    <Transition name="fade">
      <!-- 控制中心面板：全屏模式 -->
      <div
        v-if="uiStore.controlCenterVisible"
        class="fixed left-0 right-0 top-0 z-[999999] bottom-[var(--mobile-nav-height)] bg-white/60 dark:bg-black/40 backdrop-blur-3xl transition-colors duration-500"
      >
        <div class="h-full w-full flex flex-col">
          
          <!-- 顶部拉条指示器 -->
          <div class="w-full flex justify-center pt-3 pb-1">
            <div class="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
          </div>

          <div class="p-6 pt-2 overflow-y-auto custom-scrollbar text-gray-900 dark:text-white">
            <!-- 品牌区域：单行横向 -->
            <div class="flex items-center gap-3 mb-6 mt-1 px-1 justify-center">
              <img :src="logoUrl" alt="FlyOS Logo" class="w-8 h-8 object-contain" />
              <div class="flex flex-col leading-tight">
                <h2 class="text-xl tracking-tight dark:text-white text-gray-900">
                  FlyOS
                </h2>
              </div>
            </div>

            <!-- 快捷设置网格 -->
            <div class="grid grid-cols-2 gap-3 mb-6">
              <!-- 布局模式 -->
              <button @click="handleToggleMode" class="control-card group">
                <div class="icon-box" :class="desktopStore.mode === 'metro' ? 'bg-blue-500' : 'bg-gray-200 dark:bg-white/10'">
                  <component :is="desktopStore.mode === 'metro' ? Grid2X2Icon : LayoutDashboardIcon" class="w-6 h-6" />
                </div>
                <div class="text-left">
                  <span class="title">布局模式</span>
                  <span class="status">{{ desktopStore.mode === 'metro' ? '磁贴模式' : '图标模式' }}</span>
                </div>
              </button>

              <!-- 主题切换 -->
              <button @click="handleToggleTheme" class="control-card group">
                <div class="icon-box" :class="themeStore.mode.value === 'dark' ? 'bg-purple-600' : 'bg-amber-500'">
                  <component :is="themeStore.mode.value === 'dark' ? MoonIcon : SunIcon" class="w-6 h-6" />
                </div>
                <div class="text-left">
                  <span class="title">系统主题</span>
                  <span class="status">{{ themeStore.mode.value === 'dark' ? '深色' : '浅色' }}</span>
                </div>
              </button>

              <!-- 全屏控制 -->
              <button @click="toggleFullscreen" class="control-card group">
                <div class="icon-box bg-emerald-500">
                  <component :is="isFullscreen ? MinimizeIcon : MaximizeIcon" class="w-6 h-6" />
                </div>
                <div class="text-left">
                  <span class="title">显示模式</span>
                  <span class="status">{{ isFullscreen ? '退出全屏' : '进入全屏' }}</span>
                </div>
              </button>

              <!-- 系统锁定 -->
              <button @click="handleLock" class="control-card group">
                <div class="icon-box bg-rose-500">
                  <LockIcon class="w-6 h-6" />
                </div>
                <div class="text-left">
                  <span class="title">系统安全</span>
                  <span class="status">立即锁定</span>
                </div>
              </button>
            </div>

            <!-- 通知部分 -->
            <div class="space-y-4">
              <div class="flex items-center justify-between px-1">
                <div class="flex items-center gap-2">
                  <BellIcon class="w-4 h-4 text-gray-500" />
                  <h3 class="text-sm font-bold text-gray-500 uppercase tracking-wider">系统通知 ({{ notifications.length }})</h3>
                </div>
                <button v-if="notifications.length > 0" @click="clearAll" class="text-xs text-blue-500 font-bold hover:opacity-70 transition-opacity">
                  全部清除
                </button>
              </div>

              <div v-if="notifications.length > 0" class="space-y-2">
                <div 
                  v-for="notif in notifications.slice(0, 3)" 
                  :key="notif.id"
                  class="bg-white/10 dark:bg-white/5 backdrop-blur-md p-4 rounded-2xl flex justify-between items-center group relative overflow-hidden border border-white/20 dark:border-white/5"
                >
                  <div class="flex-1">
                    <p class="text-[10px] font-black text-blue-500/80 uppercase mb-0.5 tracking-wider">{{ notif.appName || '系统' }}</p>
                    <p class="text-sm font-bold leading-tight text-gray-800 dark:text-white/90">{{ notif.title }}</p>
                  </div>
                  <button @click="remove(notif.id)" class="p-2 opacity-40 hover:opacity-100 transition-opacity">
                    <Trash2Icon class="w-4 h-4 text-rose-500" />
                  </button>
                </div>
              </div>
              <div v-else class="py-10 text-center opacity-30 grayscale">
                <BellIcon class="w-12 h-12 mx-auto mb-2" />
                <p class="text-xs font-bold">暂无新通知</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  backdrop-filter: blur(0px);
}

.control-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 1.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.03);
  background-color: rgba(255, 255, 255, 0.4);
}

.dark .control-card {
  background-color: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.05);
}

.control-card:active {
  transform: scale(0.96);
  background-color: rgba(255, 255, 255, 0.6);
}

.icon-box {
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s;
}

/* 浅色模式下弱化图标背景对比度，但保持图标清晰 */
.icon-box.bg-blue-500 { background-color: rgba(59, 130, 246, 0.15) !important; color: #2563eb !important; }
.icon-box.bg-purple-600 { background-color: rgba(147, 51, 234, 0.15) !important; color: #7e22ce !important; }
.icon-box.bg-amber-500 { background-color: rgba(245, 158, 11, 0.15) !important; color: #d97706 !important; }
.icon-box.bg-emerald-500 { background-color: rgba(16, 185, 129, 0.15) !important; color: #059669 !important; }
.icon-box.bg-rose-500 { background-color: rgba(244, 63, 94, 0.15) !important; color: #e11d48 !important; }
.icon-box.bg-gray-200 { background-color: rgba(0, 0, 0, 0.08) !important; color: #4b5563 !important; }

/* 深色模式下维持较高对比度以保证可见性 */
.dark .icon-box.bg-blue-500 { background-color: #3b82f6 !important; color: white !important; }
.dark .icon-box.bg-purple-600 { background-color: #9333ea !important; color: white !important; }
.dark .icon-box.bg-amber-500 { background-color: #f59e0b !important; color: white !important; }
.dark .icon-box.bg-emerald-500 { background-color: #10b981 !important; color: white !important; }
.dark .icon-box.bg-rose-500 { background-color: #f43f5e !important; color: white !important; }
.dark .icon-box.bg-white\/10 { background-color: rgba(255, 255, 255, 0.1) !important; color: white !important; }

.title {
  display: block;
  font-size: 10px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  margin-bottom: 1px;
}

.status {
  display: block;
  font-size: 0.95rem;
  font-weight: 500;
  color: #1e293b;
  white-space: nowrap;
}

.dark .status {
  color: white;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 0px;
}
</style>
