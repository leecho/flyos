<template>
  <div 
    class="h-full w-full relative no-scrollbar"
    :class="[desktopStore.isMobile ? 'overflow-y-auto pb-32' : 'overflow-x-auto']"
    @click="handleBackgroundClick"
  >
    <!-- 图标网格布局 -->
    <div 
      class="desktop-icons grid gap-2 p-6 pt-10 h-full w-fit"
      :class="[
        desktopStore.isMobile 
          ? 'grid-cols-4 grid-auto-rows-min w-full gap-4' 
          : 'grid-flow-col grid-rows-[repeat(auto-fill,100px)]'
      ]"
    >
      <div 
        v-for="app in appStore.apps" 
        :key="app.id"
        class="desktop-item group flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-all duration-200"
        :class="[!desktopStore.isMobile ? 'w-24 h-24 justify-center hover:bg-white/10 rounded-lg' : '']"
        @click.stop="openApp(app)"
        @contextmenu.prevent="openContextMenu($event, app)"
      >
        <div class="icon-container relative flex flex-col items-center">
          <AppIcon 
            :id="app.id" 
            size="md" 
            rounded="md" 
            class="shadow-xl group-hover:shadow-blue-500/20 transition-all" 
          />
          <!-- 运行状态指示点 -->
          <div 
            v-if="isAppRunning(app.id)" 
            class="absolute -bottom-2 w-1 h-1 bg-white rounded-full shadow-glow"
          ></div>
        </div>
        <span 
          class="text-[11px] font-semibold text-white text-center drop-shadow-lg truncate w-full px-1 leading-tight opacity-90"
        >
          {{ app.name }}
        </span>
      </div>
    </div>
    
    <ContextMenu ref="menuRef" />
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import { appStore } from '../stores/appStore.ts'
import { desktopStore } from '../stores/desktopStore.ts'
import { startTask } from '../stores/taskStore.ts'
import { windowStore } from '../stores/windowStore.ts'
import AppIcon from './AppIcon.vue'
import ContextMenu from './ContextMenu.vue'
import { SquareArrowUpRightIcon, PinOffIcon, PinIcon } from 'lucide-vue-next'

const menuRef = ref()

// 检查应用是否正在运行
const isAppRunning = (appId: string) => {
  return windowStore.windows.some(win => win.appId === appId)
}

const openApp = (app: any) => {
  startTask(app)
}

const handleBackgroundClick = () => {
  // 背景点击逻辑（如取消选中）
}

function openContextMenu(e: MouseEvent, app: any) {
  const options = [
    { label: '打开应用', icon: SquareArrowUpRightIcon, action: () => openApp(app) },
    { type: 'divider' },
    { label: app.fixed ? '取消固定' : '固定到开始菜单', icon: app.fixed ? PinOffIcon : PinIcon, action: () => app.fixed = !app.fixed }
  ]
  e.stopPropagation()
  menuRef.value.open(e, options)
}
</script>

<style scoped>
.shadow-glow {
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
