<!-- WindowManager.vue -->
<template>
  <div class="window-manager-container">
    <!-- 桌面端多窗口模式 -->
    <template v-if="!desktopStore.isMobile">
      <Window
        v-for="win in windowStore.windows"
        :key="win.id"
        :z-index="win.zIndex"
        :title="win.title"
        @mousedown="activeWindow(win.id)"
        @close="stopTask(win.appId)"
        @minimize="toggleMinimize(win.id)"
        @maximize="toggleMaximize(win.id)"
        @contextmenu="openWindowContextMenu($event, win)"
        :maximizable="win.maximizable"
        :height="win.height"
        :width="win.width"
        :id="win.id"
        :appId="win.appId"
        :minimized="win.minimized"
        :maximized="win.maximized"
        :params="win.params"
        :component="win.component"
        :ref="(el) => registerWindow(win.id, el as InstanceType<typeof Window>)"
        @unmounted="unregisterWindow(win.id)"
      />
    </template>

    <!-- 移动端全屏模式 -->
    <template v-else>
      <TransitionGroup name="app-layer-fade">
        <AppLayer
          v-for="win in windowStore.windows"
          :key="win.id"
          :id="win.id"
          :appId="win.appId"
          :z-index="win.zIndex"
          :minimized="win.minimized"
          :params="win.params"
          :component="win.component"
        />
      </TransitionGroup>
    </template>

    <ContextMenu ref="menuRef" />
  </div>
</template>

<script setup lang="ts">
import { windowStore, toggleMinimize, toggleMaximize, activeWindow, type WindowItem } from '../stores/windowStore'
import { desktopStore } from '../stores/desktopStore'
import { stopTask } from '../stores/taskStore.ts'
import Window from './Window.vue'
import AppLayer from './AppLayer.vue'
import ContextMenu from './ContextMenu.vue'
import { ref } from 'vue'

const menuRef = ref()
const windowRefs = ref<Record<string, any>>({}) 

const registerWindow = (id: string, el: any) => {
  if (el) windowRefs.value[id] = el
}

const unregisterWindow = (id: string) => {
  delete windowRefs.value[id]
}

const openWindowContextMenu = ($event: MouseEvent, win: WindowItem) => {
  $event.stopPropagation()
  const options = [
    { label: '最大化', disabled: win.maximized , action: () => toggleMaximize(win.id) },
    { label: '最小化', action: () => toggleMinimize(win.id) },
    { label: '恢复', disabled: !win.maximized ,action: () => toggleMaximize(win.id) },
    { label: '关闭', action: () => stopTask(win.appId) }
  ]
  menuRef.value.open($event, options)
}
</script>

<style scoped>
/* 移动端应用层切换动画：采用更高级的 Fade + Scale 方案 */
.app-layer-fade-enter-active,
.app-layer-fade-leave-active {
  transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.app-layer-fade-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
  filter: blur(10px);
}

.app-layer-fade-leave-to {
  opacity: 0;
  transform: scale(1.1);
  filter: blur(20px);
}
</style>
