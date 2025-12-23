<template>
  <div
      class="taskbar w-full h-12 flex items-center justify-center px-4 gap-2 fixed bottom-0 left-0
             transition-all duration-300"
  >
    <!-- Start button -->
    <div
        class="w-8 h-8 rounded flex items-center justify-center
               bg-blue-500/80 hover:bg-blue-500/90
               text-white font-bold shadow-sm transition
               cursor-pointer"
        @click="startMenuRef.toggleOpen()"
    >
      ⊞
    </div>

    <!-- Example icons -->
<!--    <div class="w-8 h-8 rounded bg-gray-300/40 dark:bg-gray-700/40 transition"></div>-->
<!--    <div class="w-8 h-8 rounded bg-gray-300/40 dark:bg-gray-700/40 transition"></div>-->

    <!-- Running windows -->
    <div class="flex flex-row gap-2">
      <TaskBarItem
          v-for="win in windowStore.windows"
          :key="win.id"
          :window="win"
          @contextmenu="openWindowContextMenu($event, win)"
          @click="toggleActive(win.id)"
      />
    </div>
    <ContextMenu ref='menuRef' />
    <StartMenu ref="startMenuRef"/>
  </div>
</template>

<style scoped>
.taskbar {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  /* ----- 浅色模式 ----- */
  background: rgba(255, 255, 255, 0.55);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 -1px 10px rgba(0, 0, 0, 0.1);
  z-index: 99999;

  /* ----- 暗色模式 ----- */
}
.dark .taskbar {
  background: rgba(32, 32, 32, 0.55);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 -1px 10px rgba(0, 0, 0, 0.35);
}
</style>

<script setup lang="ts">
import { toggleActive, toggleMaximize, toggleMinimize, WindowItem, windowStore } from '../stores/windowStore'
import TaskBarItem from "./TaskBarItem.vue"
import ContextMenu from './ContextMenu.vue'
import { stopTask } from '../stores/taskStore.ts'
import { ref } from 'vue'
import StartMenu from './StartMenu.vue'
const menuRef = ref()
const startMenuRef = ref()
const openWindowContextMenu = ($event, win: WindowItem) => {
  $event.stopPropagation()
  const options = [
    { label: '最大化', action: () => toggleMaximize(win.id) },
    { label: '最小化', action: () => toggleMinimize(win.id) },
    { label: '恢复', action: () => toggleMaximize(win.id) },
    { label: '关闭', action: () => stopTask(win.appId) }
  ]
  menuRef.value.open($event, options)
}

</script>
